import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../../firebase";
// import { server } from '../serverName/Server';

/* ===============================
   GET DISCOUNTS
================================= */

export const getDiscounts = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "discounts")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};


/* ===============================
   CREATE DISCOUNT
================================= */

export const createDiscount = async (
  companyId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "discounts")
  );

  const discounts = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombre duplicado
  const duplicate = discounts.find(
    d => d.name.toLowerCase() === data.name.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error("Ya existe un descuento con ese nombre.");
  }

  // 🚫 Validaciones por tipo
  if (!data.name) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!data.type) {
    throw new Error("Debe seleccionar un tipo.");
  }

  if (!data.value || data.value <= 0) {
    throw new Error("El valor debe ser mayor a 0.");
  }

  if (data.type === "fixed" && !data.currency) {
    throw new Error("Debe seleccionar una moneda.");
  }

  if (data.type === "percentage" && data.value > 100) {
    throw new Error("El porcentaje no puede ser mayor a 100.");
  }

  return await addDoc(
    collection(db, "companies", companyId, "discounts"),
    {
      name: data.name.trim(),
      type: data.type,
      value: data.value,
      currency: data.type === "fixed" ? data.currency : null,
      expirationDate: data.expirationDate
        ? Timestamp.fromDate(new Date(data.expirationDate))
        : null,
      appliesTo: {
        serviceTypes: [] // preparado para futuro
      },
      isActive: data.isActive ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};


/* ===============================
   UPDATE DISCOUNT
================================= */

export const updateDiscount = async (
  companyId,
  discountId,
  data,
  user
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "discounts")
  );

  const discounts = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar duplicados
  const duplicate = discounts.find(
    d =>
      d.name.toLowerCase() === data.name.trim().toLowerCase() &&
      d.id !== discountId
  );

  if (duplicate) {
    throw new Error("Ya existe un descuento con ese nombre.");
  }

  if (!data.name) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!data.value || data.value <= 0) {
    throw new Error("El valor debe ser mayor a 0.");
  }

  if (data.type === "fixed" && !data.currency) {
    throw new Error("Debe seleccionar una moneda.");
  }

  if (data.type === "percentage" && data.value > 100) {
    throw new Error("El porcentaje no puede ser mayor a 100.");
  }

  // 🚫 No permitir 0 activos
  if (data.isActive === false) {
    const activeDiscounts = discounts.filter(d => d.isActive);

    if (activeDiscounts.length === 1) {
      throw new Error(
        "Debe existir al menos un descuento activo."
      );
    }
  }

  return await updateDoc(
    doc(db, "companies", companyId, "discounts", discountId),
    {
      name: data.name.trim(),
      type: data.type,
      value: data.value,
      currency: data.type === "fixed" ? data.currency : null,
      expirationDate: data.expirationDate
        ? Timestamp.fromDate(new Date(data.expirationDate))
        : null,
      isActive: data.isActive,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );
};


/* ===============================
   TOGGLE STATUS
================================= */

export const toggleDiscountStatus = async (
  companyId,
  discountId,
  currentStatus
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "discounts")
  );

  const discounts = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeDiscounts = discounts.filter(d => d.isActive);

  if (currentStatus && activeDiscounts.length === 1) {
    throw new Error(
      "Debe existir al menos un descuento activo."
    );
  }

  return await updateDoc(
    doc(db, "companies", companyId, "discounts", discountId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};
