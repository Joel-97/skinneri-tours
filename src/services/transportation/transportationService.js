import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteField
} from "firebase/firestore";

import {
  getFunctions,
  httpsCallable
} from "firebase/functions";

import {
  db,
  app
} from "../../firebase";


/* =========================================================
   FIREBASE FUNCTIONS
========================================================= */

const functions =
  getFunctions(app);


/* =========================================================
   COLLECTION
========================================================= */

const TRANSPORTATION_COLLECTION =
  "transportation";


const getTransportationCollection = (
  companyId
) =>
  collection(
    db,
    "companies",
    companyId,
    TRANSPORTATION_COLLECTION
  );


const getTransportationDocument = (
  companyId,
  reservationId
) =>
  doc(
    db,
    "companies",
    companyId,
    TRANSPORTATION_COLLECTION,
    reservationId
  );


/* =========================================================
   USER HELPERS
========================================================= */

/**
 * Returns the authenticated user's ID.
 *
 * Supports both:
 * - Firebase Auth user.uid
 * - Custom user.id
 */
const getUserId = (
  user
) =>
  user?.uid ||
  user?.id ||
  null;


/**
 * Validates the authenticated user
 * and returns the user ID.
 */
const validateUser = (
  user
) => {
  const userId =
    getUserId(user);

  if (!userId) {
    const error =
      new Error(
        "Usuario no autenticado."
      );

    error.code =
      "user_required";

    throw error;
  }

  return userId;
};


/* =========================================================
   DATE HELPERS
========================================================= */

/*
=========================================================
CONVERT VALUE TO TIMESTAMP
=========================================================
*/

const toTimestamp = (
  value,
  fieldName
) => {

  if (!value) {
    return null;
  }


  /*
  ---------------------------------------------------------
  FIRESTORE TIMESTAMP
  ---------------------------------------------------------
  */

  if (
    value instanceof Timestamp ||
    (
      typeof value?.toDate === "function" &&
      typeof value?.seconds === "number"
    )
  ) {
    return Timestamp.fromDate(
      value.toDate()
    );
  }


  /*
  ---------------------------------------------------------
  DATE
  ---------------------------------------------------------
  */

  if (
    value instanceof Date
  ) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      const error =
        new Error(
          `Fecha inválida en ${fieldName}`
        );

      error.code =
        "invalid_date";

      throw error;
    }

    return Timestamp.fromDate(
      value
    );
  }


  /*
  ---------------------------------------------------------
  STRING
  ---------------------------------------------------------
  */

  if (
    typeof value === "string"
  ) {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      const error =
        new Error(
          `Fecha inválida en ${fieldName}`
        );

      error.code =
        "invalid_date";

      throw error;
    }

    return Timestamp.fromDate(
      date
    );
  }


  /*
  ---------------------------------------------------------
  INVALID VALUE
  ---------------------------------------------------------
  */

  const error =
    new Error(
      `Fecha inválida en ${fieldName}`
    );

  error.code =
    "invalid_date";

  throw error;
};


/* =========================================================
   GET TRANSPORTATION RESERVATIONS
========================================================= */

export const getTransportation = async (
  companyId
) => {

  if (!companyId) {
    const error =
      new Error(
        "company_required"
      );

    error.code =
      "company_required";

    throw error;
  }


  const q =
    query(
      getTransportationCollection(
        companyId
      ),
      orderBy(
        "date",
        "desc"
      )
    );


  const snapshot =
    await getDocs(q);


  return snapshot.docs.map(
    reservationDoc => ({
      id:
        reservationDoc.id,

      ...reservationDoc.data()
    })
  );
};


/* =========================================================
   CREATE RESERVATION
========================================================= */

export const createTransportation = async (
  companyId,
  data,
  user
) => {

  /*
  ---------------------------------------------------------
  VALIDATE COMPANY
  ---------------------------------------------------------
  */

  if (!companyId) {
    const error =
      new Error(
        "company_required"
      );

    error.code =
      "company_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE USER
  ---------------------------------------------------------
  */

  const userId =
    validateUser(user);


  /*
  ---------------------------------------------------------
  VALIDATE DATE
  ---------------------------------------------------------
  */

  if (!data?.date) {
    const error =
      new Error(
        "Por favor agregue una fecha"
      );

    error.code =
      "date_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE DATES
  ---------------------------------------------------------
  */

  const dateTimestamp =
    toTimestamp(
      data.date,
      "date"
    );


  const endTimestamp =
    data.end
      ? toTimestamp(
          data.end,
          "end"
        )
      : null;


  /*
  ---------------------------------------------------------
  REMOVE OLD DATE FIELDS
  ---------------------------------------------------------
  */

  const {
    start,
    endDate,
    ...cleanData
  } = data;


  /*
  ---------------------------------------------------------
  CREATE
  ---------------------------------------------------------
  */

  const transportationRef =
    getTransportationCollection(
      companyId
    );


  const timestamp =
    Timestamp.now();


  return await addDoc(
    transportationRef,
    {
      ...cleanData,

      clientId:
        data.clientId || null,


      /*
      -----------------------------------------------------
      ONLY RESERVATION DATES
      -----------------------------------------------------
      */

      date:
        dateTimestamp,

      end:
        endTimestamp,


      /*
      -----------------------------------------------------
      METADATA
      -----------------------------------------------------
      */

      createdBy:
        userId,

      updatedBy:
        userId,

      createdAt:
        timestamp,

      updatedAt:
        timestamp
    }
  );
};


/* =========================================================
   UPDATE RESERVATION
========================================================= */

export const updateTransportation = async (
  companyId,
  id,
  data,
  user
) => {

  /*
  ---------------------------------------------------------
  VALIDATE COMPANY
  ---------------------------------------------------------
  */

  if (!companyId) {
    const error =
      new Error(
        "company_required"
      );

    error.code =
      "company_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE RESERVATION ID
  ---------------------------------------------------------
  */

  if (!id) {
    const error =
      new Error(
        "reservation_id_required"
      );

    error.code =
      "reservation_id_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE USER
  ---------------------------------------------------------
  */

  const userId =
    validateUser(user);


  /*
  ---------------------------------------------------------
  VALIDATE DATE
  ---------------------------------------------------------
  */

  if (!data?.date) {
    const error =
      new Error(
        "Por favor agregue una fecha"
      );

    error.code =
      "date_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE DATES
  ---------------------------------------------------------
  */

  const dateTimestamp =
    toTimestamp(
      data.date,
      "date"
    );


  const endTimestamp =
    data.end
      ? toTimestamp(
          data.end,
          "end"
        )
      : null;


  /*
  ---------------------------------------------------------
  REMOVE OLD DATE FIELDS
  ---------------------------------------------------------
  */

  const {
    start,
    endDate,
    ...cleanData
  } = data;


  /*
  ---------------------------------------------------------
  REFERENCE
  ---------------------------------------------------------
  */

  const ref =
    getTransportationDocument(
      companyId,
      id
    );


  /*
  ---------------------------------------------------------
  UPDATE
  ---------------------------------------------------------
  */

  return await updateDoc(
    ref,
    {
      ...cleanData,


      /*
      -----------------------------------------------------
      ONLY RESERVATION DATES
      -----------------------------------------------------
      */

      date:
        dateTimestamp,

      end:
        endTimestamp,


      /*
      -----------------------------------------------------
      REMOVE LEGACY FIELDS
      -----------------------------------------------------
      */

      start:
        deleteField(),

      endDate:
        deleteField(),


      /*
      -----------------------------------------------------
      METADATA
      -----------------------------------------------------
      */

      updatedBy:
        userId,

      updatedAt:
        Timestamp.now()
    }
  );
};


/* =========================================================
   DELETE RESERVATION
========================================================= */

export const deleteTransportation = async (
  companyId,
  id
) => {

  /*
  ---------------------------------------------------------
  VALIDATE COMPANY
  ---------------------------------------------------------
  */

  if (!companyId) {
    const error =
      new Error(
        "company_required"
      );

    error.code =
      "company_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE RESERVATION ID
  ---------------------------------------------------------
  */

  if (!id) {
    const error =
      new Error(
        "reservation_id_required"
      );

    error.code =
      "reservation_id_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  DELETE
  ---------------------------------------------------------
  */

  const ref =
    getTransportationDocument(
      companyId,
      id
    );


  return await deleteDoc(
    ref
  );
};


/* =========================================================
   CHECK RESERVATION NUMBER
========================================================= */

export const reservationNumberExists = async (
  companyId,
  reservationNumber
) => {

  try {

    const q =
      query(
        getTransportationCollection(
          companyId
        ),
        where(
          "reservationNumber",
          "==",
          reservationNumber
        )
      );


    const snapshot =
      await getDocs(q);


    return !snapshot.empty;

  } catch (error) {

    console.error(
      "Error verificando reservationNumber:",
      error
    );

    return false;
  }
};


/* =========================================================
   CONFIRM RESERVATION
========================================================= */

export const confirmTransportationReservation = async (
  companyId,
  reservationId
) => {

  /*
  ---------------------------------------------------------
  VALIDATE COMPANY
  ---------------------------------------------------------
  */

  if (!companyId) {
    const error =
      new Error(
        "company_required"
      );

    error.code =
      "company_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  VALIDATE RESERVATION ID
  ---------------------------------------------------------
  */

  if (!reservationId) {
    const error =
      new Error(
        "reservation_id_required"
      );

    error.code =
      "reservation_id_required";

    throw error;
  }


  /*
  ---------------------------------------------------------
  CLOUD FUNCTION
  ---------------------------------------------------------
  */

  const functionCall =
    httpsCallable(
      functions,
      "confirmTransportationReservation"
    );


  /*
  ---------------------------------------------------------
  CONFIRM
  ---------------------------------------------------------
  */

  const response =
    await functionCall({
      companyId,
      reservationId
    });


  /*
  ---------------------------------------------------------
  RESULT
  ---------------------------------------------------------
  */

  return response.data;
};