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
   GET STAFF
================================= */

export const getStaff = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "staff")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};


/* ===============================
   CREATE STAFF
================================= */

export const createStaff = async (companyId, data, user) => {

  return await addDoc(
    collection(db, "companies", companyId, "staff"),
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
   UPDATE STAFF
================================= */

export const updateStaff = async (companyId, staffId, data, user) => {

  return await updateDoc(
    doc(db, "companies", companyId, "staff", staffId),
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

export const toggleStaffStatus = async (companyId, staffId, currentStatus) => {

  return await updateDoc(
    doc(db, "companies", companyId, "staff", staffId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};