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

const functions = getFunctions(app);


/* =========================================================
   DATE HELPERS
========================================================= */

/*
=========================================================
CONVERT VALUE TO TIMESTAMP
=========================================================
*/

const toTimestamp = (value, fieldName) => {

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

  if (value instanceof Date) {

    if (Number.isNaN(value.getTime())) {

      const error = new Error(

        `Fecha inválida en ${fieldName}`

      );

      error.code = "invalid_date";

      throw error;

    }

    return Timestamp.fromDate(value);

  }

  /*
  ---------------------------------------------------------
  STRING
  ---------------------------------------------------------
  */

  if (typeof value === "string") {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

      const error = new Error(

        `Fecha inválida en ${fieldName}`

      );

      error.code = "invalid_date";

      throw error;

    }

    return Timestamp.fromDate(date);

  }

  /*
  ---------------------------------------------------------
  INVALID VALUE
  ---------------------------------------------------------
  */

  const error = new Error(

    `Fecha inválida en ${fieldName}`

  );

  error.code = "invalid_date";

  throw error;

};


/* =========================================================
   OBTENER RESERVAS
========================================================= */

export const getTransportation = async (companyId) => {

  if (!companyId) {

    const error = new Error("company_required");

    error.code = "company_required";

    throw error;

  }

  const q = query(

    collection(

      db,

      "companies",

      companyId,

      "transportation"

    ),

    orderBy("date", "desc")

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};


/* =========================================================
   CREAR RESERVA
========================================================= */

export const createTransportation = async (

  companyId,

  data,

  user

) => {

  if (!companyId) {

    const error = new Error("company_required");

    error.code = "company_required";

    throw error;

  }

  if (!user) {

    const error = new Error("user_required");

    error.code = "user_required";

    throw error;

  }

  if (!data.date) {

    const error = new Error(

      "Por favor agregue una fecha"

    );

    error.code = "date_required";

    throw error;

  }

  /*
  ---------------------------------------------------------
  VALIDATE DATES
  ---------------------------------------------------------
  */

  const dateTimestamp = toTimestamp(

    data.date,

    "date"

  );

  const endTimestamp = data.end

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

  const transportationRef = collection(

    db,

    "companies",

    companyId,

    "transportation"

  );

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

        user.uid,

      updatedBy:

        user.uid,

      createdAt:

        Timestamp.now(),

      updatedAt:

        Timestamp.now()

    }

  );

};


/* =========================================================
   ACTUALIZAR RESERVA
========================================================= */

export const updateTransportation = async (

  companyId,

  id,

  data,

  user

) => {

  if (!companyId) {

    const error = new Error("company_required");

    error.code = "company_required";

    throw error;

  }

  if (!id) {

    const error = new Error(

      "reservation_id_required"

    );

    error.code = "reservation_id_required";

    throw error;

  }

  if (!data.date) {

    const error = new Error(

      "Por favor agregue una fecha"

    );

    error.code = "date_required";

    throw error;

  }

  /*
  ---------------------------------------------------------
  VALIDATE DATES
  ---------------------------------------------------------
  */

  const dateTimestamp = toTimestamp(

    data.date,

    "date"

  );

  const endTimestamp = data.end

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

  const ref = doc(

    db,

    "companies",

    companyId,

    "transportation",

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

        user?.uid || null,

      updatedAt:

        Timestamp.now()

    }

  );

};


/* =========================================================
   ELIMINAR RESERVA
========================================================= */

export const deleteTransportation = async (

  companyId,

  id

) => {

  if (!companyId) {

    const error = new Error("company_required");

    error.code = "company_required";

    throw error;

  }

  if (!id) {

    const error = new Error(

      "reservation_id_required"

    );

    error.code = "reservation_id_required";

    throw error;

  }

  const ref = doc(

    db,

    "companies",

    companyId,

    "transportation",

    id

  );

  return await deleteDoc(ref);

};


/* =========================================================
   VERIFICAR SI EXISTE NUMERO DE RESERVACION
========================================================= */

export const reservationNumberExists = async (

  companyId,

  reservationNumber

) => {

  try {

    const q = query(

      collection(

        db,

        "companies",

        companyId,

        "transportation"

      ),

      where(

        "reservationNumber",

        "==",

        reservationNumber

      )

    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

  }

  catch (error) {

    console.error(

      "Error verificando reservationNumber:",

      error

    );

    return false;

  }

};


/* =========================================================
   CONFIRMAR RESERVA
========================================================= */

export const confirmTransportationReservation = async (

  companyId,

  reservationId

) => {

  if (!companyId) {

    const error = new Error(

      "company_required"

    );

    error.code = "company_required";

    throw error;

  }


  if (!reservationId) {

    const error = new Error(

      "reservation_id_required"

    );

    error.code = "reservation_id_required";

    throw error;

  }


  /*
  ---------------------------------------------------------
  CLOUD FUNCTION
  ---------------------------------------------------------
  */

  const functionCall = httpsCallable(

    functions,

    "confirmTransportationReservation"

  );


  /*
  ---------------------------------------------------------
  CONFIRM
  ---------------------------------------------------------
  */

  const response = await functionCall({

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