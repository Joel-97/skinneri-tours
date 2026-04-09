import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";
import { server } from '../serverName/Server';

/* ===============================
   GET DRIVERS
================================= */

export const getDrivers = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "drivers")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

/* ===============================
   CREATE DRIVER
================================= */

export const createDriver = async (companyId, data, user) => {

  return await addDoc(
    collection(db, "companies", companyId, "drivers"),
    {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};

/* ===============================
   UPDATE DRIVER
================================= */

export const updateDriver = async (companyId, driverId, data, user) => {

  return await updateDoc(
    doc(db, "companies", companyId, "drivers", driverId),
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

export const toggleDriverStatus = async (companyId, driverId, currentStatus) => {

  return await updateDoc(
    doc(db, "companies", companyId, "drivers", driverId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};