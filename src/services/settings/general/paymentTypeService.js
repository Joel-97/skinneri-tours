import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../../firebase";
// import { server } from '../serverName/Server';

/* ===============================
   GET PAYMENT TYPES
================================ */

export const getPaymentTypes = async (companyId) => {

  const ref = collection(db, "companies", companyId, "paymentTypes");

  const snapshot = await getDocs(ref);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

};

/* ===============================
   CREATE PAYMENT TYPE
================================ */

export const createPaymentType = async (companyId, data, user) => {

  const ref = collection(db, "companies", companyId, "paymentTypes");

  await addDoc(ref, {
    name: data.name,
    description: data.description || "",
    isActive: true,
    createdAt: new Date(),
    createdBy: user?.uid || null
  });

};

/* ===============================
   UPDATE PAYMENT TYPE
================================ */

export const updatePaymentType = async (companyId, id, data) => {

  const ref = doc(db, "companies", companyId, "paymentTypes", id);

  await updateDoc(ref, {
    name: data.name,
    description: data.description || "",
    isActive: data.isActive
  });

};

/* ===============================
   DELETE PAYMENT TYPE
================================ */

export const deletePaymentType = async (companyId, id) => {

  const ref = doc(db, "companies", companyId, "paymentTypes", id);

  await deleteDoc(ref);

};

/* ===============================
   TOGGLE PAYMENT TYPE STATUS
================================ */

export const togglePaymentTypeStatus = async (
  companyId,
  id,
  currentStatus
) => {

  const ref = doc(db, "companies", companyId, "paymentTypes", id);

  await updateDoc(ref, {
    isActive: !currentStatus
  });

};