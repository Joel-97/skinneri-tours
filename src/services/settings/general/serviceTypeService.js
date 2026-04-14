import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../../firebase";

/* ===============================
   CONSTANTES (ESCALABLE)
================================= */

export const SERVICE_CATEGORIES = {
  TRANSPORTATION: "transportation",
  ADVENTURE: "adventure"
};

/* ===============================
   GET SERVICE TYPES
================================= */

export const getServiceTypes = async (companyId, category = null) => {
  if (!companyId) throw new Error("Empresa requerida.");

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  let data = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🔥 Filtrar por categoría (adventure / transportation)
  if (category) {
    data = data.filter(t => t.category === category);
  }

  return data;
};

/* ===============================
   VALIDACIONES BASE
================================= */

const validateServiceType = (data) => {
  if (!data.name?.trim()) throw new Error("El nombre es obligatorio.");
  if (!data.color) throw new Error("Debe seleccionar un color.");
  if (!data.currency) throw new Error("Debe seleccionar una moneda.");
  if (!data.category) throw new Error("La categoría es obligatoria.");

  // 🔥 Validar categoría permitida
  if (
    data.category !== SERVICE_CATEGORIES.TRANSPORTATION &&
    data.category !== SERVICE_CATEGORIES.ADVENTURE
  ) {
    throw new Error("Categoría inválida.");
  }
};

/* ===============================
   NORMALIZAR PRECIO
================================= */

const normalizePricing = (data) => {
  let basePrice = data.basePrice ?? null;
  let currency = data.currency ?? null;
  let symbol = data.symbol ?? null;

  if (data.pricingMode === "fixed") {
    if (!basePrice || Number(basePrice) <= 0) {
      throw new Error("El precio base debe ser mayor a 0.");
    }
    basePrice = Number(basePrice);
  } else {
    basePrice = null;
  }

  return { basePrice, currency, symbol };
};

/* ===============================
   STAFF PAYMENT (COMISIONES)
================================= */

const normalizeStaffPayment = (data) => {
  const staffPayment =
    data.staffPayment?.enabled
      ? {
          enabled: true,
          type: data.staffPayment.type || "fixed",
          value:
            data.staffPayment.value === "" ||
            data.staffPayment.value === undefined
              ? null
              : Number(data.staffPayment.value)
        }
      : null;

  if (staffPayment) {
    if (staffPayment.value !== null && staffPayment.value < 0) {
      throw new Error("El pago al staff no puede ser negativo.");
    }

    if (
      staffPayment.type === "percentage" &&
      staffPayment.value !== null &&
      staffPayment.value > 100
    ) {
      throw new Error("La comisión no puede ser mayor a 100%.");
    }
  }

  return staffPayment;
};

/* ===============================
   CREATE SERVICE TYPE
================================= */

export const createServiceType = async (
  companyId,
  data,
  user
) => {

  if (!companyId) throw new Error("Empresa requerida.");
  if (!user) throw new Error("Usuario no autenticado.");

  validateServiceType(data);

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 Evitar duplicados por nombre + categoría
  const duplicate = types.find(
    t =>
      t.name.toLowerCase() === data.name.trim().toLowerCase() &&
      t.category === data.category
  );

  if (duplicate) {
    throw new Error("Ya existe un tipo de servicio con ese nombre.");
  }

  const { basePrice, currency, symbol } = normalizePricing(data);
  const staffPayment = normalizeStaffPayment(data);

  return await addDoc(
    collection(db, "companies", companyId, "serviceTypes"),
    {
      name: data.name.trim(),
      category: data.category, // 🔥 CLAVE
      pricingMode: data.pricingMode,
      basePrice,
      currency,
      symbol,
      durationMinutes: data.durationMinutes ?? null,
      color: data.color,

      // 🔥 preparado para comisiones
      staffPayment,

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

  if (!companyId) throw new Error("Empresa requerida.");
  if (!serviceTypeId) throw new Error("ID requerido.");
  if (!user) throw new Error("Usuario no autenticado.");

  validateServiceType(data);

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  // 🚫 duplicados
  const duplicate = types.find(
    t =>
      t.name.toLowerCase() === data.name.trim().toLowerCase() &&
      t.category === data.category &&
      t.id !== serviceTypeId
  );

  if (duplicate) {
    throw new Error("Ya existe un tipo de servicio con ese nombre.");
  }

  // 🚫 mínimo 1 activo por categoría
  if (data.isActive === false) {
    const activeTypes = types.filter(
      t => t.isActive && t.category === data.category
    );

    if (activeTypes.length === 1) {
      throw new Error(
        "Debe existir al menos un tipo activo en esta categoría."
      );
    }
  }

  const { basePrice, currency, symbol } = normalizePricing(data);
  const staffPayment = normalizeStaffPayment(data);

  return await updateDoc(
    doc(db, "companies", companyId, "serviceTypes", serviceTypeId),
    {
      name: data.name.trim(),
      category: data.category,
      pricingMode: data.pricingMode,
      basePrice,
      currency,
      symbol,
      durationMinutes: data.durationMinutes ?? null,
      color: data.color,
      staffPayment,
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
  currentStatus,
  category
) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "serviceTypes")
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeTypes = types.filter(
    t => t.isActive && t.category === category
  );

  if (currentStatus && activeTypes.length === 1) {
    throw new Error(
      "Debe existir al menos un tipo activo en esta categoría."
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