import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase";

const PAYMENT_TYPES_COLLECTION = "paymentTypes";

/* ===============================
   FIRESTORE HELPERS
================================ */

const getPaymentTypesCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    PAYMENT_TYPES_COLLECTION
  );

const getPaymentTypeDoc = (companyId, paymentTypeId) =>
  doc(
    db,
    "companies",
    companyId,
    PAYMENT_TYPES_COLLECTION,
    paymentTypeId
  );

/* ===============================
   VALIDATION HELPERS
================================ */

const validateCompanyId = (companyId) => {
  if (!companyId || typeof companyId !== "string") {
    throw new Error("Company ID is required.");
  }
};

const validateUser = (user) => {
  if (!user) {
    throw new Error("Authenticated user is required.");
  }
};

const getUserId = (user) => {
  return user?.uid || user?.id || null;
};

const validatePaymentTypeData = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Payment type data is required.");
  }

  if (!data.name || !data.name.trim()) {
    throw new Error("Payment type name is required.");
  }
};

/* ===============================
   NORMALIZATION HELPERS
================================ */

const normalizeName = (value = "") => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeDescription = (value = "") => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

const normalizePaymentTypeData = (data = {}) => {
  return {
    name: normalizeName(data.name),
    description: normalizeDescription(data.description),
    isActive: data.isActive !== false
  };
};

/* ===============================
   DUPLICATE VALIDATION
================================ */

const validateDuplicateName = async (
  companyId,
  name,
  paymentTypeId = null
) => {
  const ref = getPaymentTypesCollection(companyId);

  const duplicateQuery = query(
    ref,
    where("name", "==", name)
  );

  const snapshot = await getDocs(duplicateQuery);

  const duplicate = snapshot.docs.find(
    (paymentType) => paymentType.id !== paymentTypeId
  );

  if (duplicate) {
    throw new Error(
      "A payment type with this name already exists."
    );
  }
};

/* ===============================
   MAP FIRESTORE DOCUMENT
================================ */

const mapPaymentType = (snapshot) => {
  return {
    id: snapshot.id,
    ...snapshot.data()
  };
};

/* ===============================
   GET PAYMENT TYPES
================================ */

export const getPaymentTypes = async (companyId) => {
  validateCompanyId(companyId);

  const ref = getPaymentTypesCollection(companyId);
  const snapshot = await getDocs(ref);

  return snapshot.docs.map(mapPaymentType);
};

/* ===============================
   CREATE PAYMENT TYPE
================================ */

export const createPaymentType = async (
  companyId,
  data,
  user
) => {
  validateCompanyId(companyId);
  validateUser(user);
  validatePaymentTypeData(data);

  const normalizedData = normalizePaymentTypeData(data);

  await validateDuplicateName(
    companyId,
    normalizedData.name
  );

  const ref = getPaymentTypesCollection(companyId);
  const userId = getUserId(user);

  const paymentTypeData = {
    name: normalizedData.name,
    description: normalizedData.description,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId
  };

  const document = await addDoc(
    ref,
    paymentTypeData
  );

  return {
    id: document.id,
    ...paymentTypeData
  };
};

/* ===============================
   UPDATE PAYMENT TYPE
================================ */

export const updatePaymentType = async (
  companyId,
  id,
  data,
  user
) => {
  validateCompanyId(companyId);

  if (!id) {
    throw new Error("Payment type ID is required.");
  }

  validatePaymentTypeData(data);

  const normalizedData = normalizePaymentTypeData(data);

  await validateDuplicateName(
    companyId,
    normalizedData.name,
    id
  );

  const ref = getPaymentTypeDoc(companyId, id);

  const updateData = {
    name: normalizedData.name,
    description: normalizedData.description,
    isActive: normalizedData.isActive,
    updatedAt: serverTimestamp()
  };

  const userId = getUserId(user);

  if (userId) {
    updateData.updatedBy = userId;
  }

  await updateDoc(ref, updateData);

  return {
    id,
    ...updateData
  };
};

/* ===============================
   DELETE PAYMENT TYPE
================================ */

export const deletePaymentType = async (
  companyId,
  id
) => {
  validateCompanyId(companyId);

  if (!id) {
    throw new Error("Payment type ID is required.");
  }

  const ref = getPaymentTypeDoc(companyId, id);

  await deleteDoc(ref);

  return {
    id,
    deleted: true
  };
};

/* ===============================
   TOGGLE PAYMENT TYPE STATUS
================================ */

export const togglePaymentTypeStatus = async (
  companyId,
  id,
  currentStatus,
  user
) => {
  validateCompanyId(companyId);

  if (!id) {
    throw new Error("Payment type ID is required.");
  }

  const ref = getPaymentTypeDoc(companyId, id);
  const userId = getUserId(user);

  const updateData = {
    isActive: !currentStatus,
    updatedAt: serverTimestamp()
  };

  if (userId) {
    updateData.updatedBy = userId;
  }

  await updateDoc(ref, updateData);

  return {
    id,
    isActive: !currentStatus
  };
};