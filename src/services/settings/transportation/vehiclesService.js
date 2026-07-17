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

/* ===============================
   GET VEHICLES
================================= */

export const getVehicles = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "vehicles")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

};

/* ===============================
   CREATE VEHICLE
================================= */

export const createVehicle = async (
  companyId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "vehicles")
  );

  const vehicles = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar placas duplicadas

  const duplicate = vehicles.find(
    vehicle =>
      vehicle.plate?.trim().toLowerCase() ===
      data.plate?.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error(
      "Ya existe un vehículo con esa placa."
    );
  }

  return await addDoc(
    collection(db, "companies", companyId, "vehicles"),
    {
      ...data,

      isActive: data.isActive ?? true,

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),

      createdBy: user.uid,
      updatedBy: user.uid
    }
  );

};

/* ===============================
   UPDATE VEHICLE
================================= */

export const updateVehicle = async (
  companyId,
  vehicleId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "vehicles")
  );

  const vehicles = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar placas duplicadas

  const duplicate = vehicles.find(
    vehicle =>
      vehicle.plate?.trim().toLowerCase() ===
        data.plate?.trim().toLowerCase() &&
      vehicle.id !== vehicleId
  );

  if (duplicate) {
    throw new Error(
      "Ya existe un vehículo con esa placa."
    );
  }

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "vehicles",
      vehicleId
    ),
    {
      ...data,

      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );

};

/* ===============================
   TOGGLE STATUS
================================= */

export const toggleVehicleStatus = async (
  companyId,
  vehicleId,
  currentStatus
) => {

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "vehicles",
      vehicleId
    ),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );

};

/* ===============================
   DELETE VEHICLE
================================= */

export const deleteVehicle = async (
  companyId,
  vehicleId
) => {

  return await deleteDoc(
    doc(
      db,
      "companies",
      companyId,
      "vehicles",
      vehicleId
    )
  );

};