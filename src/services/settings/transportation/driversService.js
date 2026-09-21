import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


const DRIVERS_COLLECTION = "drivers";


/* =========================================================
   COLLECTION
========================================================= */

const getDriversCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    DRIVERS_COLLECTION
  );


const getDriverDocument = (
  companyId,
  driverId
) =>
  doc(
    db,
    "companies",
    companyId,
    DRIVERS_COLLECTION,
    driverId
  );


/* =========================================================
   HELPERS
========================================================= */

const normalizeVehicleId = (
  vehicleId
) => {
  if (
    vehicleId === null ||
    vehicleId === undefined ||
    vehicleId === ""
  ) {
    return "";
  }

  if (
    typeof vehicleId === "object"
  ) {
    return String(
      vehicleId.value ??
      vehicleId.id ??
      ""
    ).trim();
  }

  return String(
    vehicleId
  ).trim();
};


const normalizeEmail = (
  email
) =>
  email?.trim().toLowerCase() || "";


const getUserId = (
  user
) =>
  user?.uid ||
  user?.id ||
  null;


const mapSnapshot = (
  snapshot
) =>
  snapshot.docs.map(
    driverDoc => ({
      id: driverDoc.id,
      ...driverDoc.data()
    })
  );


/* =========================================================
   VALIDATION
========================================================= */

const validateCompanyId = (
  companyId
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }
};


const validateUser = (
  user
) => {
  if (!user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }

  return getUserId(user);
};


const validateDriverData = (
  data
) => {
  if (!data?.name?.trim()) {
    throw new Error(
      "El nombre del conductor es obligatorio."
    );
  }

  return {
    name: data.name.trim(),

    phone:
      data.phone?.trim() || "",

    email:
      normalizeEmail(
        data.email
      ),

    licenses:
      Array.isArray(data.licenses)
        ? data.licenses
        : [],

    driverType:
      data.driverType || "",

    vehicleId:
      normalizeVehicleId(
        data.vehicleId
      ),

    isAvailable:
      data.isAvailable ?? true,

    isActive:
      data.isActive ?? true
  };
};


/* =========================================================
   EMAIL VALIDATION
========================================================= */

const validateDuplicateEmail = async (
  companyId,
  email,
  driverId = null
) => {
  if (!email) {
    return;
  }

  const snapshot = await getDocs(
    query(
      getDriversCollection(
        companyId
      ),
      where(
        "email",
        "==",
        email
      )
    )
  );

  const duplicate =
    snapshot.docs.find(
      driverDoc =>
        driverDoc.id !== driverId
    );

  if (duplicate) {
    throw new Error(
      "Ya existe un conductor con ese correo electrónico."
    );
  }
};


/* =========================================================
   VEHICLE ASSIGNMENT VALIDATION
========================================================= */

const validateVehicleAssignment = async (
  companyId,
  vehicleId,
  driverId = null
) => {
  /*
   * No vehicle means there is nothing
   * to validate.
   */
  if (!vehicleId) {
    return;
  }

  const snapshot = await getDocs(
    query(
      getDriversCollection(
        companyId
      ),
      where(
        "vehicleId",
        "==",
        vehicleId
      )
    )
  );

  /*
   * When editing a driver, ignore
   * the driver's own document.
   */
  const assignedDriver =
    snapshot.docs.find(
      driverDoc =>
        driverDoc.id !== driverId
    );

  if (assignedDriver) {
    const driverData =
      assignedDriver.data();

    const driverName =
      driverData.name?.trim();

    throw new Error(
      driverName
        ? `El vehículo ya está asignado al conductor ${driverName}.`
        : "El vehículo ya está asignado a otro conductor."
    );
  }
};


/* =========================================================
   GET DRIVERS
========================================================= */

export const getDrivers = async (
  companyId
) => {
  validateCompanyId(
    companyId
  );

  const snapshot = await getDocs(
    getDriversCollection(
      companyId
    )
  );

  return mapSnapshot(
    snapshot
  );
};


/* =========================================================
   CREATE DRIVER
========================================================= */

export const createDriver = async (
  companyId,
  data,
  user
) => {
  validateCompanyId(
    companyId
  );

  const userId =
    validateUser(user);

  const driverData =
    validateDriverData(data);

  /*
   * Validate email before creating.
   */
  await validateDuplicateEmail(
    companyId,
    driverData.email
  );

  /*
   * Validate that the selected vehicle
   * is not already assigned.
   */
  await validateVehicleAssignment(
    companyId,
    driverData.vehicleId
  );

  const timestamp =
    Timestamp.now();

  return addDoc(
    getDriversCollection(
      companyId
    ),
    {
      ...driverData,

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
   UPDATE DRIVER
========================================================= */

export const updateDriver = async (
  companyId,
  driverId,
  data,
  user
) => {
  validateCompanyId(
    companyId
  );

  if (!driverId) {
    throw new Error(
      "ID del conductor requerido."
    );
  }

  const userId =
    validateUser(user);

  const driverData =
    validateDriverData(data);

  /*
   * Verify that the driver exists.
   */
  const currentDriverSnapshot =
    await getDocs(
      query(
        getDriversCollection(
          companyId
        ),
        where(
          "__name__",
          "==",
          driverId
        )
      )
    );

  if (
    currentDriverSnapshot.empty
  ) {
    throw new Error(
      "Conductor no encontrado."
    );
  }

  /*
   * Validate email.
   */
  await validateDuplicateEmail(
    companyId,
    driverData.email,
    driverId
  );

  /*
   * Validate vehicle assignment.
   *
   * driverId is passed so the current
   * driver's own vehicle does not
   * conflict with itself.
   */
  await validateVehicleAssignment(
    companyId,
    driverData.vehicleId,
    driverId
  );

  return updateDoc(
    getDriverDocument(
      companyId,
      driverId
    ),
    {
      ...driverData,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        userId
    }
  );
};


/* =========================================================
   TOGGLE DRIVER STATUS
========================================================= */

export const toggleDriverStatus = async (
  companyId,
  driverId,
  currentStatus
) => {
  validateCompanyId(
    companyId
  );

  if (!driverId) {
    throw new Error(
      "ID del conductor requerido."
    );
  }

  return updateDoc(
    getDriverDocument(
      companyId,
      driverId
    ),
    {
      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()
    }
  );
};