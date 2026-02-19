import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

/* ===============================
   GET ALL Locations
================================= */

export const getLocations = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "locations")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};


/* ===============================
   CREATE LOCATIONS
================================= */

export const createLocations = async (companyId, data, user) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "locations")
  );

  const locations = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombre duplicado
  const duplicate = locations.find(
    p => p.name.toLowerCase() === data.name.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error("Ya existe un lugar con ese nombre.");
  }

  return await addDoc(
    collection(db, "companies", companyId, "locations"),
    {
      name: data.name.trim(),
      isActive: data.isActive ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
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

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "locations")
  );

  const locations = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombre duplicado (excepto el actual)
  const duplicate = locations.find(
    p =>
      p.name.toLowerCase() === data.name.trim().toLowerCase() &&
      p.id !== locationId
  );

  if (duplicate) {
    throw new Error("Ya existe un lugar con ese nombre.");
  }

  // 🚫 Evitar dejar 0 activos
  if (data.isActive === false) {
    const activeLocations = locations.filter(p => p.isActive);

    if (activeLocations.length === 1) {
      throw new Error(
        "Debe existir al menos un lugar de recogida activo."
      );
    }
  }

  return await updateDoc(
    doc(db, "companies", companyId, "locations", locationId),
    {
      name: data.name.trim(),
      isActive: data.isActive,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
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

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "locations")
  );

  const locations = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeLocations = locations.filter(p => p.isActive);

  // 🚫 Evitar desactivar el último activo
  if (currentStatus && activeLocations.length === 1) {
    throw new Error(
      "Debe existir al menos un lugar de recogida activo."
    );
  }

  return await updateDoc(
    doc(db, "companies", companyId, "locations", locationId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};
