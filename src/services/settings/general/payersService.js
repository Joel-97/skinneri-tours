import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


/* ======================================================
   CONSTANTS
====================================================== */

const PAYERS_COLLECTION = "payers";


/* ======================================================
   FIRESTORE HELPERS
====================================================== */

const getPayersCollection = (companyId) => {

  return collection(
    db,
    "companies",
    companyId,
    PAYERS_COLLECTION
  );

};


const getPayerDocument = (
  companyId,
  payerId
) => {

  return doc(
    db,
    "companies",
    companyId,
    PAYERS_COLLECTION,
    payerId
  );

};


/* ======================================================
   VALIDATION HELPERS
====================================================== */

const validateCompanyId = (companyId) => {

  if (
    !companyId ||
    typeof companyId !== "string"
  ) {

    throw new Error(
      "No se encontró una empresa válida."
    );

  }

};


const validatePayerId = (payerId) => {

  if (
    !payerId ||
    typeof payerId !== "string"
  ) {

    throw new Error(
      "No se encontró un pagador válido."
    );

  }

};


const getUserId = (user) => {

  return (
    user?.uid ||
    user?.id ||
    null
  );

};


const requireUserId = (user) => {

  const userId =
    getUserId(user);

  if (!userId) {

    throw new Error(
      "No se encontró un usuario válido."
    );

  }

  return userId;

};


/* ======================================================
   NORMALIZATION
====================================================== */

const normalizeName = (
  name = ""
) => {

  if (
    typeof name !== "string"
  ) {
    return "";
  }

  return name
    .trim()
    .replace(/\s+/g, " ");

};


const normalizePhone = (
  phone = ""
) => {

  if (
    typeof phone !== "string"
  ) {
    return "";
  }

  return phone.trim();

};


const normalizeEmail = (
  email = ""
) => {

  if (
    typeof email !== "string"
  ) {
    return "";
  }

  return email
    .trim()
    .toLowerCase();

};


const normalizePayerType = (
  payerType
) => {

  if (!payerType) {
    return null;
  }

  return {
    value:
      payerType.value || "",

    label:
      payerType.label || ""
  };

};


/* ======================================================
   DATA VALIDATION
====================================================== */

const validatePayerData = (
  data
) => {

  const name =
    normalizeName(data?.name);

  if (!name) {

    throw new Error(
      "El nombre del pagador es obligatorio."
    );

  }


  if (!data?.payerType) {

    throw new Error(
      "El tipo de pagador es obligatorio."
    );

  }


  const payerType =
    normalizePayerType(
      data.payerType
    );


  if (
    !payerType?.value ||
    !payerType?.label
  ) {

    throw new Error(
      "El tipo de pagador seleccionado no es válido."
    );

  }


  return {

    name,

    payerType,

    phone:
      normalizePhone(
        data?.phone
      ),

    email:
      normalizeEmail(
        data?.email
      ),

    isActive:
      data?.isActive ?? true

  };

};


/* ======================================================
   DUPLICATE NAME
====================================================== */

const validateDuplicateName = async (
  companyId,
  name,
  payerId = null
) => {

  const snapshot = await getDocs(

    query(
      getPayersCollection(
        companyId
      ),

      where(
        "name",
        "==",
        name
      )
    )

  );


  const duplicate =
    snapshot.docs.find(
      (document) =>
        document.id !== payerId
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un pagador con ese nombre."
    );

  }

};


/* ======================================================
   DUPLICATE EMAIL
====================================================== */

const validateDuplicateEmail = async (
  companyId,
  email,
  payerId = null
) => {

  /*
   * El correo es opcional.
   * No necesitamos comprobar duplicados
   * cuando está vacío.
   */

  if (!email) {
    return;
  }


  const snapshot = await getDocs(

    query(
      getPayersCollection(
        companyId
      ),

      where(
        "email",
        "==",
        email
      )
    )

  );


  const duplicate =
    snapshot.docs.find(
      (document) =>
        document.id !== payerId
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un pagador con ese correo electrónico."
    );

  }

};


/* ======================================================
   MAP SNAPSHOT
====================================================== */

const mapSnapshot = (
  snapshot
) => {

  return snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data()
    })
  );

};


/* ======================================================
   GET PAYERS
====================================================== */

export const getPayers = async (
  companyId
) => {

  validateCompanyId(
    companyId
  );


  const snapshot =
    await getDocs(
      getPayersCollection(
        companyId
      )
    );


  return mapSnapshot(
    snapshot
  );

};


/* ======================================================
   CREATE PAYER
====================================================== */

export const createPayer = async (
  companyId,
  data,
  user
) => {

  validateCompanyId(
    companyId
  );


  const userId =
    requireUserId(user);


  const payerData =
    validatePayerData(
      data
    );


  await validateDuplicateName(
    companyId,
    payerData.name
  );


  await validateDuplicateEmail(
    companyId,
    payerData.email
  );


  const now =
    Timestamp.now();


  return await addDoc(

    getPayersCollection(
      companyId
    ),

    {

      ...payerData,

      createdAt:
        now,

      updatedAt:
        now,

      createdBy:
        userId,

      updatedBy:
        userId

    }

  );

};


/* ======================================================
   UPDATE PAYER
====================================================== */

export const updatePayer = async (
  companyId,
  payerId,
  data,
  user
) => {

  validateCompanyId(
    companyId
  );


  validatePayerId(
    payerId
  );


  const userId =
    requireUserId(user);


  const payerData =
    validatePayerData(
      data
    );


  /*
   * Verificamos que el pagador
   * actual exista.
   */

  const payerSnapshot =
    await getDocs(

      query(
        getPayersCollection(
          companyId
        ),

        where(
          "__name__",
          "==",
          payerId
        )
      )

    );


  if (payerSnapshot.empty) {

    throw new Error(
      "El pagador no existe."
    );

  }


  await validateDuplicateName(
    companyId,
    payerData.name,
    payerId
  );


  await validateDuplicateEmail(
    companyId,
    payerData.email,
    payerId
  );


  return await updateDoc(

    getPayerDocument(
      companyId,
      payerId
    ),

    {

      ...payerData,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        userId

    }

  );

};


/* ======================================================
   TOGGLE STATUS
====================================================== */

export const togglePayerStatus = async (
  companyId,
  payerId,
  currentStatus
) => {

  validateCompanyId(
    companyId
  );


  validatePayerId(
    payerId
  );


  return await updateDoc(

    getPayerDocument(
      companyId,
      payerId
    ),

    {

      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()

    }

  );

};