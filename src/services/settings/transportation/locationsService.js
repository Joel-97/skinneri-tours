import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


const LOCATIONS_COLLECTION = "locations";

const LOCATION_CODE_MIN_LENGTH = 3;
const LOCATION_CODE_MAX_LENGTH = 50;

const MIN_ACTIVE_LOCATION_ERROR =
  "Debe existir al menos un lugar de recogida activo.";


/* =========================================================
   HELPERS
========================================================= */

const getLocationsCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    LOCATIONS_COLLECTION
  );


const getLocationDocument = (
  companyId,
  locationId
) =>
  doc(
    db,
    "companies",
    companyId,
    LOCATIONS_COLLECTION,
    locationId
  );


const getUserId = (user) =>
  user?.uid || user?.id || null;


const requireUserId = (user) => {
  const userId = getUserId(user);

  if (!userId) {
    throw new Error(
      "Usuario no autenticado."
    );
  }

  return userId;
};


const normalizeLocationCode = (
  code = ""
) =>
  typeof code === "string"
    ? code
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";


const validateLocationCode = (code) => {
  const normalizedCode =
    normalizeLocationCode(code);

  if (!normalizedCode) {
    throw new Error(
      "El código del lugar es obligatorio."
    );
  }

  if (
    normalizedCode.length <
    LOCATION_CODE_MIN_LENGTH
  ) {
    throw new Error(
      `El código del lugar debe tener al menos ${LOCATION_CODE_MIN_LENGTH} caracteres.`
    );
  }

  if (
    normalizedCode.length >
    LOCATION_CODE_MAX_LENGTH
  ) {
    throw new Error(
      `El código del lugar no puede superar los ${LOCATION_CODE_MAX_LENGTH} caracteres.`
    );
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      normalizedCode
    )
  ) {
    throw new Error(
      "El código del lugar solo puede contener letras minúsculas, números y guiones."
    );
  }

  return normalizedCode;
};


const validateLocationData = (
  data
) => {
  if (!data?.name?.trim()) {
    throw new Error(
      "El nombre del lugar es obligatorio."
    );
  }

  return {
    code: validateLocationCode(
      data.code
    ),
    name: data.name.trim(),
    isActive:
      data.isActive ?? true
  };
};


const findLocationById = (
  locations,
  locationId
) =>
  locations.find(
    location =>
      location.id === locationId
  );


const findDuplicateName = (
  locations,
  name,
  locationId = null
) => {
  const normalizedName =
    name.trim().toLowerCase();

  return locations.find(
    location =>
      location.id !== locationId &&
      location.name?.trim().toLowerCase() ===
        normalizedName
  );
};


const findDuplicateCode = (
  locations,
  code,
  locationId = null
) =>
  locations.find(
    location =>
      location.id !== locationId &&
      location.code === code
  );


const validateDuplicates = (
  locations,
  data,
  locationId = null
) => {
  if (
    findDuplicateName(
      locations,
      data.name,
      locationId
    )
  ) {
    throw new Error(
      "Ya existe un lugar con ese nombre."
    );
  }

  if (
    findDuplicateCode(
      locations,
      data.code,
      locationId
    )
  ) {
    throw new Error(
      "Ya existe un lugar con ese código."
    );
  }
};


const validateMinimumActiveLocations = (
  locations,
  locationId
) => {
  const activeLocations =
    locations.filter(
      location =>
        location.isActive
    );

  if (
    activeLocations.length === 1 &&
    activeLocations[0].id === locationId
  ) {
    throw new Error(
      MIN_ACTIVE_LOCATION_ERROR
    );
  }
};


const mapSnapshot = (
  snapshot
) =>
  snapshot.docs.map(
    document => ({
      id: document.id,
      ...document.data()
    })
  );


/* =========================================================
   GET LOCATIONS
========================================================= */

export const getLocations = async (
  companyId
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  const snapshot = await getDocs(
    getLocationsCollection(
      companyId
    )
  );

  return mapSnapshot(snapshot);
};


/* =========================================================
   CREATE LOCATION
========================================================= */

export const createLocations = async (
  companyId,
  data,
  user
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  const userId =
    requireUserId(user);

  const locationData =
    validateLocationData(data);

  const snapshot = await getDocs(
    getLocationsCollection(
      companyId
    )
  );

  const locations =
    mapSnapshot(snapshot);

  validateDuplicates(
    locations,
    locationData
  );

  const timestamp =
    Timestamp.now();

  return addDoc(
    getLocationsCollection(
      companyId
    ),
    {
      ...locationData,

      createdAt:
        timestamp,

      updatedAt:
        timestamp,

      createdBy:
        userId,

      updatedBy:
        userId
    }
  );
};


/* =========================================================
   UPDATE LOCATION
========================================================= */

export const updateLocations = async (
  companyId,
  locationId,
  data,
  user
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!locationId) {
    throw new Error(
      "ID del lugar requerido."
    );
  }

  const userId =
    requireUserId(user);

  const locationData =
    validateLocationData(data);

  const snapshot = await getDocs(
    getLocationsCollection(
      companyId
    )
  );

  const locations =
    mapSnapshot(snapshot);

  const currentLocation =
    findLocationById(
      locations,
      locationId
    );

  if (!currentLocation) {
    throw new Error(
      "Lugar no encontrado."
    );
  }

  validateDuplicates(
    locations,
    locationData,
    locationId
  );

  if (
    locationData.isActive === false &&
    currentLocation.isActive
  ) {
    validateMinimumActiveLocations(
      locations,
      locationId
    );
  }

  return updateDoc(
    getLocationDocument(
      companyId,
      locationId
    ),
    {
      ...locationData,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        userId
    }
  );
};


/* =========================================================
   TOGGLE LOCATION STATUS
========================================================= */

export const toggleLocationStatus = async (
  companyId,
  locationId,
  currentStatus
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!locationId) {
    throw new Error(
      "ID del lugar requerido."
    );
  }

  const snapshot = await getDocs(
    getLocationsCollection(
      companyId
    )
  );

  const locations =
    mapSnapshot(snapshot);

  const currentLocation =
    findLocationById(
      locations,
      locationId
    );

  if (!currentLocation) {
    throw new Error(
      "Lugar no encontrado."
    );
  }

  if (
    currentStatus &&
    locations.filter(
      location =>
        location.isActive
    ).length === 1
  ) {
    throw new Error(
      MIN_ACTIVE_LOCATION_ERROR
    );
  }

  return updateDoc(
    getLocationDocument(
      companyId,
      locationId
    ),
    {
      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()
    }
  );
};