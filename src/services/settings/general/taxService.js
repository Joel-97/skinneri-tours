import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase";

const TAXES_COLLECTION = "taxes";

/* =========================================================
   Helpers
========================================================= */

const getTaxesCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    TAXES_COLLECTION
  );

const getTaxDoc = (companyId, taxId) =>
  doc(
    db,
    "companies",
    companyId,
    TAXES_COLLECTION,
    taxId
  );

const getUserId = (user) =>
  user?.uid || user?.id || null;

const validateCompanyId = (companyId) => {
  if (!companyId) {
    throw new Error("El companyId es requerido.");
  }
};

const validateTaxId = (taxId) => {
  if (!taxId) {
    throw new Error("El taxId es requerido.");
  }
};

const validateUser = (user) => {
  const userId = getUserId(user);

  if (!userId) {
    throw new Error("El usuario es requerido.");
  }

  return userId;
};

/* =========================================================
   Normalización
========================================================= */

const normalizeText = (value = "") =>
  String(value)
    .trim()
    .replace(/\s+/g, " ");

const normalizeRate = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue)
    ? value
    : numericValue;
};

const normalizeTaxData = (taxData = {}) => {
  const type = normalizeText(taxData.type).toLowerCase();

  return {
    name: normalizeText(taxData.name),
    rate: normalizeRate(taxData.rate),
    type,
    currency:
      type === "fixed"
        ? normalizeText(taxData.currency).toUpperCase()
        : "",
    isDefault: Boolean(taxData.isDefault),
    isActive:
      taxData.isActive === undefined
        ? true
        : Boolean(taxData.isActive)
  };
};

/* =========================================================
   Validación
========================================================= */

const validateTaxData = (taxData) => {
  if (!taxData.name) {
    throw new Error("El nombre del impuesto es requerido.");
  }

  if (
    taxData.rate === "" ||
    taxData.rate === null ||
    taxData.rate === undefined
  ) {
    throw new Error("La tasa del impuesto es requerida.");
  }

  const rate = Number(taxData.rate);

  if (Number.isNaN(rate) || rate <= 0) {
    throw new Error(
      "La tasa del impuesto debe ser mayor que 0."
    );
  }

  if (!taxData.type) {
    throw new Error("El tipo de impuesto es requerido.");
  }

  if (!["percentage", "fixed"].includes(taxData.type)) {
    throw new Error("El tipo de impuesto no es válido.");
  }

  if (
    taxData.type === "percentage" &&
    rate > 100
  ) {
    throw new Error(
      "El porcentaje del impuesto no puede ser mayor a 100."
    );
  }

  if (
    taxData.type === "fixed" &&
    !taxData.currency
  ) {
    throw new Error(
      "La moneda es requerida para impuestos de monto fijo."
    );
  }
};

/* =========================================================
   Default Tax
========================================================= */

const removeExistingDefaultTaxes = async (
  companyId,
  taxIdToKeep = null
) => {
  const q = query(
    getTaxesCollection(companyId),
    where("isDefault", "==", true)
  );

  const snapshot = await getDocs(q);

  const updates = snapshot.docs
    .filter((taxDoc) => taxDoc.id !== taxIdToKeep)
    .map((taxDoc) =>
      updateDoc(taxDoc.ref, {
        isDefault: false,
        updatedAt: serverTimestamp()
      })
    );

  await Promise.all(updates);
};

/* =========================================================
   Obtener impuestos
========================================================= */

export const getTaxes = async (companyId) => {
  validateCompanyId(companyId);

  const snapshot = await getDocs(
    getTaxesCollection(companyId)
  );

  return snapshot.docs.map((taxDoc) => ({
    id: taxDoc.id,
    ...taxDoc.data()
  }));
};

/* =========================================================
   Crear impuesto
========================================================= */

export const createTax = async (
  companyId,
  taxData,
  user
) => {
  validateCompanyId(companyId);

  const userId = validateUser(user);

  const normalizedData =
    normalizeTaxData(taxData);

  validateTaxData(normalizedData);

  /*
   * Si este impuesto será el default,
   * quitamos el default anterior antes de crear el nuevo.
   */
  if (normalizedData.isDefault) {
    await removeExistingDefaultTaxes(companyId);
  }

  const timestampData = {
    ...normalizedData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId
  };

  const taxRef = await addDoc(
    getTaxesCollection(companyId),
    timestampData
  );

  return {
    id: taxRef.id,
    ...normalizedData
  };
};

/* =========================================================
   Actualizar impuesto
========================================================= */

export const updateTax = async (
  companyId,
  taxId,
  taxData,
  user
) => {
  validateCompanyId(companyId);
  validateTaxId(taxId);

  const userId = validateUser(user);

  const normalizedData =
    normalizeTaxData(taxData);

  validateTaxData(normalizedData);

  /*
   * Si el impuesto editado será el default,
   * todos los demás defaults se desactivan.
   */
  if (normalizedData.isDefault) {
    await removeExistingDefaultTaxes(
      companyId,
      taxId
    );
  }

  await updateDoc(
    getTaxDoc(companyId, taxId),
    {
      ...normalizedData,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }
  );

  return {
    id: taxId,
    ...normalizedData
  };
};

/* =========================================================
   Activar / Desactivar impuesto
========================================================= */

export const toggleTaxStatus = async (
  companyId,
  taxId,
  currentStatus,
  user
) => {
  validateCompanyId(companyId);
  validateTaxId(taxId);

  const userId = validateUser(user);

  const newStatus = !currentStatus;

  await updateDoc(
    getTaxDoc(companyId, taxId),
    {
      isActive: newStatus,
      updatedAt: serverTimestamp(),
      updatedBy: userId
    }
  );

  return {
    id: taxId,
    isActive: newStatus
  };
};