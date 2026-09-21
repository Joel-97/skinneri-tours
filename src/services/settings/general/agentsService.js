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

const COMMISSION_AGENTS_COLLECTION =
  "commissionAgents";


/* ======================================================
   FIRESTORE HELPERS
====================================================== */

const getCommissionAgentsCollection = (
  companyId
) => {

  return collection(
    db,
    "companies",
    companyId,
    COMMISSION_AGENTS_COLLECTION
  );

};


const getCommissionAgentDocument = (
  companyId,
  agentId
) => {

  return doc(
    db,
    "companies",
    companyId,
    COMMISSION_AGENTS_COLLECTION,
    agentId
  );

};


/* ======================================================
   VALIDATION HELPERS
====================================================== */

const validateCompanyId = (
  companyId
) => {

  if (
    !companyId ||
    typeof companyId !== "string"
  ) {

    throw new Error(
      "No se encontró una empresa válida."
    );

  }

};


const validateAgentId = (
  agentId
) => {

  if (
    !agentId ||
    typeof agentId !== "string"
  ) {

    throw new Error(
      "No se encontró un comisionista válido."
    );

  }

};


const getUserId = (
  user
) => {

  return (
    user?.uid ||
    user?.id ||
    null
  );

};


const requireUserId = (
  user
) => {

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


const normalizeType = (
  type
) => {

  return (
    type === "agency"
      ? "agency"
      : "person"
  );

};


const normalizeCommissionType = (
  commissionType
) => {

  return (
    commissionType === "fixed"
      ? "fixed"
      : "percentage"
  );

};


const normalizeCommissionValue = (
  value
) => {

  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return number;

};


/* ======================================================
   DATA VALIDATION
====================================================== */

const validateCommissionAgentData = (
  data
) => {

  const name =
    normalizeName(
      data?.name
    );


  if (!name) {

    throw new Error(
      "El nombre del comisionista es obligatorio."
    );

  }


  const type =
    normalizeType(
      data?.type
    );


  const commissionType =
    normalizeCommissionType(
      data?.commissionType
    );


  const commissionValue =
    normalizeCommissionValue(
      data?.commissionValue
    );


  if (
    commissionValue <= 0
  ) {

    throw new Error(
      "El valor de comisión debe ser mayor a 0."
    );

  }


  if (
    commissionType === "percentage" &&
    commissionValue > 100
  ) {

    throw new Error(
      "El porcentaje de comisión no puede ser mayor a 100."
    );

  }


  return {

    name,

    phone:
      normalizePhone(
        data?.phone
      ),

    email:
      normalizeEmail(
        data?.email
      ),

    type,

    commissionType,

    commissionValue,

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
  agentId = null
) => {

  const snapshot =
    await getDocs(

      query(
        getCommissionAgentsCollection(
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
        document.id !== agentId
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un comisionista con ese nombre."
    );

  }

};


/* ======================================================
   DUPLICATE EMAIL
====================================================== */

const validateDuplicateEmail = async (
  companyId,
  email,
  agentId = null
) => {

  /*
   * El email es opcional.
   * Si está vacío no se valida duplicidad.
   */

  if (!email) {
    return;
  }


  const snapshot =
    await getDocs(

      query(
        getCommissionAgentsCollection(
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
        document.id !== agentId
    );


  if (duplicate) {

    throw new Error(
      "Ya existe un comisionista con ese correo electrónico."
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
   GET COMMISSION AGENTS
====================================================== */

export const getCommissionAgents = async (
  companyId
) => {

  validateCompanyId(
    companyId
  );


  const snapshot =
    await getDocs(

      getCommissionAgentsCollection(
        companyId
      )

    );


  return mapSnapshot(
    snapshot
  );

};


/* ======================================================
   CREATE COMMISSION AGENT
====================================================== */

export const createCommissionAgent = async (
  companyId,
  data,
  user
) => {

  validateCompanyId(
    companyId
  );


  const userId =
    requireUserId(
      user
    );


  const agentData =
    validateCommissionAgentData(
      data
    );


  await validateDuplicateName(
    companyId,
    agentData.name
  );


  await validateDuplicateEmail(
    companyId,
    agentData.email
  );


  const now =
    Timestamp.now();


  return await addDoc(

    getCommissionAgentsCollection(
      companyId
    ),

    {

      ...agentData,

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
   UPDATE COMMISSION AGENT
====================================================== */

export const updateCommissionAgent = async (
  companyId,
  agentId,
  data,
  user
) => {

  validateCompanyId(
    companyId
  );


  validateAgentId(
    agentId
  );


  const userId =
    requireUserId(
      user
    );


  const agentData =
    validateCommissionAgentData(
      data
    );


  /*
   * Verificamos que el comisionista
   * exista antes de actualizarlo.
   */

  const agentSnapshot =
    await getDocs(

      query(
        getCommissionAgentsCollection(
          companyId
        ),

        where(
          "__name__",
          "==",
          agentId
        )
      )

    );


  if (agentSnapshot.empty) {

    throw new Error(
      "El comisionista no existe."
    );

  }


  await validateDuplicateName(
    companyId,
    agentData.name,
    agentId
  );


  await validateDuplicateEmail(
    companyId,
    agentData.email,
    agentId
  );


  return await updateDoc(

    getCommissionAgentDocument(
      companyId,
      agentId
    ),

    {

      ...agentData,

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

export const toggleCommissionAgentStatus = async (
  companyId,
  agentId,
  currentStatus
) => {

  validateCompanyId(
    companyId
  );


  validateAgentId(
    agentId
  );


  return await updateDoc(

    getCommissionAgentDocument(
      companyId,
      agentId
    ),

    {

      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()

    }

  );

};