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
   GET BOOKING SOURCES
================================= */

export const getBookingSources = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "bookingSources")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

};

/* ===============================
   CREATE BOOKING SOURCE
================================= */

export const createBookingSource = async (
  companyId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "bookingSources")
  );

  const bookingSources = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombres duplicados

  const duplicate = bookingSources.find(
    source =>
      source.name?.trim().toLowerCase() ===
      data.name?.trim().toLowerCase()
  );

  if (duplicate) {

    throw new Error(
      "Ya existe un origen de reserva con ese nombre."
    );

  }

  return await addDoc(
    collection(db, "companies", companyId, "bookingSources"),
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
   UPDATE BOOKING SOURCE
================================= */

export const updateBookingSource = async (
  companyId,
  bookingSourceId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "bookingSources")
  );

  const bookingSources = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombres duplicados

  const duplicate = bookingSources.find(
    source =>
      source.name?.trim().toLowerCase() ===
      data.name?.trim().toLowerCase() &&
      source.id !== bookingSourceId
  );

  if (duplicate) {

    throw new Error(
      "Ya existe un origen de reserva con ese nombre."
    );

  }

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "bookingSources",
      bookingSourceId
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

export const toggleBookingSourceStatus = async (
  companyId,
  bookingSourceId,
  currentStatus
) => {

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "bookingSources",
      bookingSourceId
    ),
    {

      isActive: !currentStatus,

      updatedAt: Timestamp.now()

    }
  );

};

/* ===============================
   DELETE BOOKING SOURCE
================================= */

export const deleteBookingSource = async (
  companyId,
  bookingSourceId
) => {

  return await deleteDoc(
    doc(
      db,
      "companies",
      companyId,
      "bookingSources",
      bookingSourceId
    )
  );

};