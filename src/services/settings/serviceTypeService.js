import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

/* ===============================
   GET SERVICE TYPES
================================= */

export const getServiceTypes = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};


/* ===============================
   CREATE SERVICE TYPE
================================= */

export const createServiceType = async (
  companyId,
  data,
  user
) => {

  if (!companyId) {
    throw new Error("Empresa requerida.");
  }

  if (!user) {
    throw new Error("Usuario no autenticado.");
  }

  if (!data.name || !data.name.trim()) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!data.color) {
    throw new Error("Debe seleccionar un color.");
  }

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar nombre duplicado
  const duplicate = types.find(
    t => t.name.toLowerCase() === data.name.trim().toLowerCase()
  );

  if (duplicate) {
    throw new Error("Ya existe un tipo de servicio con ese nombre.");
  }

  let basePrice = data.basePrice ?? null;
  let currency = data.currency ?? null;
  let symbol = data.symbol ?? null;

  // 🚫 Validaciones pricingMode
  if (data.pricingMode === "fixed") {

    if (!basePrice || basePrice <= 0) {
      throw new Error("El precio base debe ser mayor a 0.");
    }

  } else {
    basePrice = null;
  }

  if (!currency) {
    throw new Error("Debe seleccionar una moneda.");
  }

  return await addDoc(
    collection(db, "companies", companyId, "serviceTypes"),
    {
      name: data.name.trim(),
      pricingMode: data.pricingMode,
      basePrice,
      currency,
      symbol,
      durationMinutes: data.durationMinutes ?? null,
      color: data.color,
      isActive: data.isActive ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};

/* ===============================
   UPDATE SERVICE TYPE
================================= */

export const updateServiceType = async (
  companyId,
  serviceTypeId,
  data,
  user
) => {

  if (!companyId) {
    throw new Error("Empresa requerida.");
  }

  if (!serviceTypeId) {
    throw new Error("ID de tipo de servicio requerido.");
  }

  if (!user) {
    throw new Error("Usuario no autenticado.");
  }

  if (!data.name || !data.name.trim()) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!data.color) {
    throw new Error("Debe seleccionar un color.");
  }

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar duplicados
  const duplicate = types.find(
    t =>
      t.name.toLowerCase() === data.name.trim().toLowerCase() &&
      t.id !== serviceTypeId
  );

  if (duplicate) {
    throw new Error("Ya existe un tipo de servicio con ese nombre.");
  }

  let basePrice = data.basePrice ?? null;
  let currency = data.currency ?? null;
  let symbol = data.symbol ?? null;

  if (data.pricingMode === "fixed") {

    if (!basePrice || basePrice <= 0) {
      throw new Error("El precio base debe ser mayor a 0.");
    }

  } else {
    basePrice = null;
  }

  if (!currency) {
    throw new Error("Debe seleccionar una moneda.");
  }

  // 🚫 No permitir 0 activos
  if (data.isActive === false) {
    const activeTypes = types.filter(t => t.isActive);

    if (activeTypes.length === 1) {
      throw new Error(
        "Debe existir al menos un tipo de servicio activo."
      );
    }
  }

  return await updateDoc(
    doc(db, "companies", companyId, "serviceTypes", serviceTypeId),
    {
      name: data.name.trim(),
      pricingMode: data.pricingMode,
      basePrice,
      currency,
      symbol,
      durationMinutes: data.durationMinutes ?? null,
      color: data.color,
      isActive: data.isActive,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );
};


/* ===============================
   TOGGLE STATUS
================================= */

export const toggleServiceTypeStatus = async (
  companyId,
  serviceTypeId,
  currentStatus
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeTypes = types.filter(t => t.isActive);

  if (currentStatus && activeTypes.length === 1) {
    throw new Error(
      "Debe existir al menos un tipo de servicio activo."
    );
  }

  return await updateDoc(
    doc(db, "companies", companyId, "serviceTypes", serviceTypeId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};
