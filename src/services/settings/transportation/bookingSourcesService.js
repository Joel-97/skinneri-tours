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


const BOOKING_SOURCES_COLLECTION =
  "bookingSources";


/* =========================================================
   FIRESTORE REFERENCES
========================================================= */

const getBookingSourcesCollection = (
  companyId
) =>
  collection(
    db,
    "companies",
    companyId,
    BOOKING_SOURCES_COLLECTION
  );


const getBookingSourceDocument = (
  companyId,
  bookingSourceId
) =>
  doc(
    db,
    "companies",
    companyId,
    BOOKING_SOURCES_COLLECTION,
    bookingSourceId
  );


/* =========================================================
   HELPERS
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


const getUserId = (
  user
) =>
  user?.uid ||
  user?.id ||
  null;


const requireUserId = (
  user
) => {
  const userId =
    getUserId(user);

  if (!userId) {
    throw new Error(
      "Usuario no autenticado."
    );
  }

  return userId;
};


const normalizeName = (
  name = ""
) =>
  typeof name === "string"
    ? name.trim()
    : "";


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
   VALIDATION
========================================================= */

const validateBookingSourceData = (
  data
) => {
  const name =
    normalizeName(data?.name);

  if (!name) {
    throw new Error(
      "El nombre del origen de reserva es obligatorio."
    );
  }

  return {
    name,

    description:
      normalizeName(
        data?.description
      ),

    isActive:
      data?.isActive ?? true
  };
};


const validateDuplicateName = (
  bookingSources,
  name,
  bookingSourceId = null
) => {
  const normalizedName =
    name.toLowerCase();

  const duplicate =
    bookingSources.find(
      source =>
        source.id !== bookingSourceId &&
        normalizeName(
          source.name
        ).toLowerCase() ===
          normalizedName
    );

  if (duplicate) {
    throw new Error(
      "Ya existe un origen de reserva con ese nombre."
    );
  }
};


/* =========================================================
   GET BOOKING SOURCES
========================================================= */

export const getBookingSources = async (
  companyId
) => {
  validateCompanyId(
    companyId
  );

  const snapshot =
    await getDocs(
      getBookingSourcesCollection(
        companyId
      )
    );

  return mapSnapshot(
    snapshot
  );
};


/* =========================================================
   CREATE BOOKING SOURCE
========================================================= */

export const createBookingSource = async (
  companyId,
  data,
  user
) => {
  validateCompanyId(
    companyId
  );

  const userId =
    requireUserId(user);

  const bookingSourceData =
    validateBookingSourceData(
      data
    );

  const snapshot =
    await getDocs(
      getBookingSourcesCollection(
        companyId
      )
    );

  const bookingSources =
    mapSnapshot(snapshot);

  validateDuplicateName(
    bookingSources,
    bookingSourceData.name
  );

  const timestamp =
    Timestamp.now();

  return addDoc(
    getBookingSourcesCollection(
      companyId
    ),
    {
      ...bookingSourceData,

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
   UPDATE BOOKING SOURCE
========================================================= */

export const updateBookingSource = async (
  companyId,
  bookingSourceId,
  data,
  user
) => {
  validateCompanyId(
    companyId
  );

  if (!bookingSourceId) {
    throw new Error(
      "ID del origen de reserva requerido."
    );
  }

  const userId =
    requireUserId(user);

  const bookingSourceData =
    validateBookingSourceData(
      data
    );

  const snapshot =
    await getDocs(
      getBookingSourcesCollection(
        companyId
      )
    );

  const bookingSources =
    mapSnapshot(snapshot);

  const currentBookingSource =
    bookingSources.find(
      source =>
        source.id ===
        bookingSourceId
    );

  if (!currentBookingSource) {
    throw new Error(
      "Origen de reserva no encontrado."
    );
  }

  validateDuplicateName(
    bookingSources,
    bookingSourceData.name,
    bookingSourceId
  );

  return updateDoc(
    getBookingSourceDocument(
      companyId,
      bookingSourceId
    ),
    {
      ...bookingSourceData,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        userId
    }
  );
};


/* =========================================================
   TOGGLE STATUS
========================================================= */

export const toggleBookingSourceStatus = async (
  companyId,
  bookingSourceId,
  currentStatus
) => {
  validateCompanyId(
    companyId
  );

  if (!bookingSourceId) {
    throw new Error(
      "ID del origen de reserva requerido."
    );
  }

  return updateDoc(
    getBookingSourceDocument(
      companyId,
      bookingSourceId
    ),
    {
      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()
    }
  );
};


/* =========================================================
   DELETE
========================================================= */

export const deleteBookingSource = async (
  companyId,
  bookingSourceId
) => {
  validateCompanyId(
    companyId
  );

  if (!bookingSourceId) {
    throw new Error(
      "ID del origen de reserva requerido."
    );
  }

  return deleteDoc(
    getBookingSourceDocument(
      companyId,
      bookingSourceId
    )
  );
};