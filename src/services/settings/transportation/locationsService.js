import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


/* ===============================
   CODE CONFIGURATION
================================= */

const LOCATION_CODE_MIN_LENGTH = 3;

const LOCATION_CODE_MAX_LENGTH = 50;


/* ===============================
   NORMALIZE LOCATION CODE
================================= */

const normalizeLocationCode = (code) => {

  if (typeof code !== "string") {
    return "";
  }

  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

};


/* ===============================
   VALIDATE LOCATION CODE
================================= */

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


/* ===============================
   GET ALL LOCATIONS
================================= */

export const getLocations = async (
  companyId
) => {

  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }


  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "locations"
    )
  );


  return snapshot.docs.map(d => ({

    id: d.id,

    ...d.data()

  }));

};


/* ===============================
   CREATE LOCATION
================================= */

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


  if (!user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }


  if (!data?.name?.trim()) {
    throw new Error(
      "El nombre del lugar es obligatorio."
    );
  }


  /* ===============================
     LOCATION CODE
  ================================= */

  const code =
    validateLocationCode(
      data.code
    );


  /* ===============================
     GET EXISTING LOCATIONS
  ================================= */

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "locations"
    )
  );


  const locations =
    snapshot.docs.map(d => ({

      id: d.id,

      ...d.data()

    }));


  /* ===============================
     DUPLICATE NAME
  ================================= */

  const duplicateName =
    locations.find(
      location =>
        location.name?.toLowerCase() ===
          data.name.trim().toLowerCase()
    );


  if (duplicateName) {

    throw new Error(
      "Ya existe un lugar con ese nombre."
    );

  }


  /* ===============================
     DUPLICATE CODE
  ================================= */

  const duplicateCode =
    locations.find(
      location =>
        location.code === code
    );


  if (duplicateCode) {

    throw new Error(
      "Ya existe un lugar con ese código."
    );

  }


  /* ===============================
     CREATE
  ================================= */

  return await addDoc(

    collection(
      db,
      "companies",
      companyId,
      "locations"
    ),

    {

      code,

      name:
        data.name.trim(),

      isActive:
        data.isActive ?? true,

      createdAt:
        Timestamp.now(),

      updatedAt:
        Timestamp.now(),

      createdBy:
        user.uid,

      updatedBy:
        user.uid

    }

  );

};


/* ===============================
   UPDATE LOCATION
================================= */

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


  if (!user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }


  if (!data?.name?.trim()) {
    throw new Error(
      "El nombre del lugar es obligatorio."
    );
  }


  /* ===============================
     LOCATION CODE
  ================================= */

  const code =
    validateLocationCode(
      data.code
    );


  /* ===============================
     GET EXISTING LOCATIONS
  ================================= */

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "locations"
    )
  );


  const locations =
    snapshot.docs.map(d => ({

      id: d.id,

      ...d.data()

    }));


  /* ===============================
     VERIFY LOCATION EXISTS
  ================================= */

  const currentLocation =
    locations.find(
      location =>
        location.id === locationId
    );


  if (!currentLocation) {

    throw new Error(
      "Lugar no encontrado."
    );

  }


  /* ===============================
     DUPLICATE NAME
  ================================= */

  const duplicateName =
    locations.find(
      location =>

        location.name?.toLowerCase() ===
          data.name.trim().toLowerCase()

        &&

        location.id !== locationId
    );


  if (duplicateName) {

    throw new Error(
      "Ya existe un lugar con ese nombre."
    );

  }


  /* ===============================
     DUPLICATE CODE
  ================================= */

  const duplicateCode =
    locations.find(
      location =>

        location.code === code

        &&

        location.id !== locationId
    );


  if (duplicateCode) {

    throw new Error(
      "Ya existe un lugar con ese código."
    );

  }


  /* ===============================
     MINIMUM ACTIVE LOCATIONS
  ================================= */

  if (data.isActive === false) {

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
        "Debe existir al menos un lugar de recogida activo."
      );

    }

  }


  /* ===============================
     UPDATE
  ================================= */

  return await updateDoc(

    doc(
      db,
      "companies",
      companyId,
      "locations",
      locationId
    ),

    {

      code,

      name:
        data.name.trim(),

      isActive:
        data.isActive,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        user.uid

    }

  );

};


/* ===============================
   TOGGLE STATUS
================================= */

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
    collection(
      db,
      "companies",
      companyId,
      "locations"
    )
  );


  const locations =
    snapshot.docs.map(d => ({

      id: d.id,

      ...d.data()

    }));


  /* ===============================
     VERIFY LOCATION EXISTS
  ================================= */

  const currentLocation =
    locations.find(
      location =>
        location.id === locationId
    );


  if (!currentLocation) {

    throw new Error(
      "Lugar no encontrado."
    );

  }


  /* ===============================
     ACTIVE LOCATIONS
  ================================= */

  const activeLocations =
    locations.filter(
      location =>
        location.isActive
    );


  /* ===============================
     PREVENT LAST ACTIVE
  ================================= */

  if (
    currentStatus &&
    activeLocations.length === 1
  ) {

    throw new Error(
      "Debe existir al menos un lugar de recogida activo."
    );

  }


  /* ===============================
     UPDATE STATUS
  ================================= */

  return await updateDoc(

    doc(
      db,
      "companies",
      companyId,
      "locations",
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