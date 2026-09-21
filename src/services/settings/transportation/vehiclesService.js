import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


/* ==========================================================
   VEHICLES COLLECTION
========================================================== */

const getVehiclesCollection = (companyId) => {

  return collection(
    db,
    "companies",
    companyId,
    "vehicles"
  );

};


/* ==========================================================
   VEHICLE DOCUMENT
========================================================== */

const getVehicleDocument = (
  companyId,
  vehicleId
) => {

  return doc(
    db,
    "companies",
    companyId,
    "vehicles",
    vehicleId
  );

};


/* ==========================================================
   NORMALIZE PLATE
========================================================== */

const normalizePlate = (plate) => {

  return (
    plate
      ?.trim()
      .toLowerCase() || ""
  );

};


/* ==========================================================
   GET VEHICLES
========================================================== */

export const getVehicles = async (
  companyId
) => {

  if (!companyId) {

    return [];

  }


  const snapshot = await getDocs(
    getVehiclesCollection(
      companyId
    )
  );


  return snapshot.docs.map(
    (vehicleDoc) => ({

      id:
        vehicleDoc.id,

      ...vehicleDoc.data()

    })
  );

};


/* ==========================================================
   CREATE VEHICLE
========================================================== */

export const createVehicle = async (
  companyId,
  data,
  user
) => {

  if (!companyId) {

    throw new Error(
      "El ID de la empresa es requerido."
    );

  }


  if (!data?.plate?.trim()) {

    throw new Error(
      "La placa del vehículo es requerida."
    );

  }


  /* --------------------------------------------------------
     CHECK DUPLICATE PLATE
  -------------------------------------------------------- */

  const snapshot = await getDocs(
    getVehiclesCollection(
      companyId
    )
  );


  const normalizedPlate =
    normalizePlate(
      data.plate
    );


  const duplicate =
    snapshot.docs.find(
      (vehicleDoc) => {

        const vehicle =
          vehicleDoc.data();

        return (
          normalizePlate(
            vehicle.plate
          ) === normalizedPlate
        );

      }
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un vehículo con esa placa."
    );

  }


  /* --------------------------------------------------------
     STATUS
  -------------------------------------------------------- */

  const isActive =
    data.isActive ??
    true;


  const status =
    data.status ||
    (
      isActive
        ? "active"
        : "inactive"
    );


  /* --------------------------------------------------------
     CREATE
  -------------------------------------------------------- */

  return await addDoc(

    getVehiclesCollection(
      companyId
    ),

    {

      ...data,

      plate:
        data.plate
          .trim()
          .toUpperCase(),

      isActive,

      status,

      createdAt:
        Timestamp.now(),

      updatedAt:
        Timestamp.now(),

      createdBy:
        user?.uid || null,

      updatedBy:
        user?.uid || null

    }

  );

};


/* ==========================================================
   UPDATE VEHICLE
========================================================== */

export const updateVehicle = async (
  companyId,
  vehicleId,
  data,
  user
) => {

  if (!companyId) {

    throw new Error(
      "El ID de la empresa es requerido."
    );

  }


  if (!vehicleId) {

    throw new Error(
      "El ID del vehículo es requerido."
    );

  }


  if (!data?.plate?.trim()) {

    throw new Error(
      "La placa del vehículo es requerida."
    );

  }


  /* --------------------------------------------------------
     CHECK DUPLICATE PLATE
  -------------------------------------------------------- */

  const snapshot = await getDocs(
    getVehiclesCollection(
      companyId
    )
  );


  const normalizedPlate =
    normalizePlate(
      data.plate
    );


  const duplicate =
    snapshot.docs.find(
      (vehicleDoc) => {

        if (
          vehicleDoc.id ===
          vehicleId
        ) {

          return false;

        }


        const vehicle =
          vehicleDoc.data();


        return (
          normalizePlate(
            vehicle.plate
          ) === normalizedPlate
        );

      }
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un vehículo con esa placa."
    );

  }


  /* --------------------------------------------------------
     STATUS
  -------------------------------------------------------- */

  const isActive =
    data.isActive ??
    true;


  const status =
    data.status ||
    (
      isActive
        ? "active"
        : "inactive"
    );


  /* --------------------------------------------------------
     UPDATE
  -------------------------------------------------------- */

  return await updateDoc(

    getVehicleDocument(
      companyId,
      vehicleId
    ),

    {

      ...data,

      plate:
        data.plate
          .trim()
          .toUpperCase(),

      isActive,

      status,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        user?.uid || null

    }

  );

};


/* ==========================================================
   TOGGLE VEHICLE STATUS
========================================================== */

/*
  Mantiene sincronizados:

  - status
  - isActive

  Esto permite trabajar con ambos campos
  sin generar inconsistencias entre componentes
  existentes del sistema.
*/

export const toggleVehicleStatus = async (
  companyId,
  vehicleId,
  currentStatus
) => {

  if (!companyId) {

    throw new Error(
      "El ID de la empresa es requerido."
    );

  }


  if (!vehicleId) {

    throw new Error(
      "El ID del vehículo es requerido."
    );

  }


  const currentlyActive =
    currentStatus === "active" ||
    currentStatus === true;


  const newIsActive =
    !currentlyActive;


  const newStatus =
    newIsActive
      ? "active"
      : "inactive";


  return await updateDoc(

    getVehicleDocument(
      companyId,
      vehicleId
    ),

    {

      isActive:
        newIsActive,

      status:
        newStatus,

      updatedAt:
        Timestamp.now()

    }

  );

};


/* ==========================================================
   DELETE VEHICLE
========================================================== */

export const deleteVehicle = async (
  companyId,
  vehicleId
) => {

  if (!companyId) {

    throw new Error(
      "El ID de la empresa es requerido."
    );

  }


  if (!vehicleId) {

    throw new Error(
      "El ID del vehículo es requerido."
    );

  }


  return await deleteDoc(

    getVehicleDocument(
      companyId,
      vehicleId
    )

  );

};