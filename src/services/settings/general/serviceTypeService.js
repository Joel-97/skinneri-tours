import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";


export const SERVICE_CATEGORY = "transportation";

const SERVICE_CODE_MIN_LENGTH = 3;
const SERVICE_CODE_MAX_LENGTH = 50;

const SERVICE_TYPES_COLLECTION = "serviceTypes";


/* =========================================================
   HELPERS
========================================================= */

const getServiceTypesCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    SERVICE_TYPES_COLLECTION
  );


const getUserId = (user) =>
  user?.uid || user?.id || null;


const normalizeServiceCode = (code = "") =>
  typeof code === "string"
    ? code
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    : "";


const validateServiceCode = (code) => {
  const normalizedCode =
    normalizeServiceCode(code);

  if (!normalizedCode) {
    throw new Error(
      "El código del servicio es obligatorio."
    );
  }

  if (
    normalizedCode.length <
    SERVICE_CODE_MIN_LENGTH
  ) {
    throw new Error(
      `El código del servicio debe tener al menos ${SERVICE_CODE_MIN_LENGTH} caracteres.`
    );
  }

  if (
    normalizedCode.length >
    SERVICE_CODE_MAX_LENGTH
  ) {
    throw new Error(
      `El código del servicio no puede superar los ${SERVICE_CODE_MAX_LENGTH} caracteres.`
    );
  }

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      normalizedCode
    )
  ) {
    throw new Error(
      "El código del servicio solo puede contener letras minúsculas, números y guiones."
    );
  }

  return normalizedCode;
};


/* =========================================================
   VALIDATION
========================================================= */

const validateServiceType = (data) => {
  if (!data.name?.trim()) {
    throw new Error(
      "El nombre es obligatorio."
    );
  }

  if (!data.color) {
    throw new Error(
      "Debe seleccionar un color."
    );
  }

  if (!data.currency) {
    throw new Error(
      "Debe seleccionar una moneda."
    );
  }

  if (
    data.category !== SERVICE_CATEGORY
  ) {
    throw new Error(
      "El tipo de servicio debe pertenecer a la categoría de transporte."
    );
  }
};


/* =========================================================
   NORMALIZATION
========================================================= */

const normalizePricing = (data) => {
  let basePrice =
    data.basePrice ?? null;

  const currency =
    data.currency ?? null;

  const symbol =
    data.symbol ?? null;

  if (data.pricingMode === "fixed") {
    if (
      basePrice === null ||
      basePrice === "" ||
      Number(basePrice) <= 0
    ) {
      throw new Error(
        "El precio base debe ser mayor a 0."
      );
    }

    basePrice = Number(basePrice);
  } else {
    basePrice = null;
  }

  return {
    basePrice,
    currency,
    symbol
  };
};


const normalizeStaffPayment = (data) => {
  if (!data.staffPayment?.enabled) {
    return null;
  }

  const value =
    data.staffPayment.value === "" ||
    data.staffPayment.value === undefined ||
    data.staffPayment.value === null
      ? null
      : Number(data.staffPayment.value);

  const type =
    data.staffPayment.type || "fixed";

  if (
    value !== null &&
    value < 0
  ) {
    throw new Error(
      "El pago al staff no puede ser negativo."
    );
  }

  if (
    type === "percentage" &&
    value !== null &&
    value > 100
  ) {
    throw new Error(
      "La comisión no puede ser mayor a 100%."
    );
  }

  return {
    enabled: true,
    type,
    value
  };
};


const normalizeServiceData = (data) => {
  const serviceData = {
    ...data,
    category: SERVICE_CATEGORY
  };

  validateServiceType(serviceData);

  const code = validateServiceCode(
    serviceData.code
  );

  const pricing =
    normalizePricing(serviceData);

  const staffPayment =
    normalizeStaffPayment(serviceData);

  return {
    code,

    name:
      serviceData.name.trim(),

    category:
      SERVICE_CATEGORY,

    pricingMode:
      serviceData.pricingMode,

    pricingType:
      serviceData.pricingType ||
      "per_booking",

    basePrice:
      pricing.basePrice,

    currency:
      pricing.currency,

    symbol:
      pricing.symbol,

    durationMinutes:
      serviceData.durationMinutes ?? null,

    color:
      serviceData.color,

    staffPayment,

    isActive:
      serviceData.isActive ?? true
  };
};


/* =========================================================
   USER VALIDATION
========================================================= */

const requireUserId = (user) => {
  const userId = getUserId(user);

  if (!userId) {
    throw new Error(
      "Usuario no autenticado."
    );
  }

  return userId;
};


/* =========================================================
   GET SERVICE TYPES
========================================================= */

export const getServiceTypes = async (
  companyId
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  const snapshot = await getDocs(
    getServiceTypesCollection(companyId)
  );

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data()
    }))
    .filter(
      service =>
        service.category ===
        SERVICE_CATEGORY
    );
};


/* =========================================================
   DUPLICATE CHECKS
========================================================= */

const findDuplicateName = (
  types,
  name,
  serviceTypeId = null
) => {
  const normalizedName =
    name.trim().toLowerCase();

  return types.find(
    service =>
      service.id !== serviceTypeId &&
      service.category ===
        SERVICE_CATEGORY &&
      service.name?.trim().toLowerCase() ===
        normalizedName
  );
};


const findDuplicateCode = (
  types,
  code,
  serviceTypeId = null
) => {
  return types.find(
    service =>
      service.id !== serviceTypeId &&
      service.category ===
        SERVICE_CATEGORY &&
      service.code === code
  );
};


const validateDuplicates = (
  types,
  serviceData,
  serviceTypeId = null
) => {
  if (
    findDuplicateName(
      types,
      serviceData.name,
      serviceTypeId
    )
  ) {
    throw new Error(
      "Ya existe un tipo de servicio con ese nombre."
    );
  }

  if (
    findDuplicateCode(
      types,
      serviceData.code,
      serviceTypeId
    )
  ) {
    throw new Error(
      "Ya existe un tipo de servicio con ese código."
    );
  }
};


/* =========================================================
   CREATE
========================================================= */

export const createServiceType = async (
  companyId,
  data,
  user
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  const userId =
    requireUserId(user);

  const serviceData =
    normalizeServiceData(data);

  const snapshot = await getDocs(
    getServiceTypesCollection(companyId)
  );

  const types = snapshot.docs.map(
    document => ({
      id: document.id,
      ...document.data()
    })
  );

  validateDuplicates(
    types,
    serviceData
  );

  const timestamp =
    Timestamp.now();

  return addDoc(
    getServiceTypesCollection(companyId),
    {
      ...serviceData,

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
   UPDATE
========================================================= */

export const updateServiceType = async (
  companyId,
  serviceTypeId,
  data,
  user
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!serviceTypeId) {
    throw new Error(
      "ID requerido."
    );
  }

  const userId =
    requireUserId(user);

  const serviceData =
    normalizeServiceData(data);

  const snapshot = await getDocs(
    getServiceTypesCollection(companyId)
  );

  const types = snapshot.docs.map(
    document => ({
      id: document.id,
      ...document.data()
    })
  );

  const currentService =
    types.find(
      service =>
        service.id === serviceTypeId
    );

  if (!currentService) {
    throw new Error(
      "Tipo de servicio no encontrado."
    );
  }

  if (
    currentService.category !==
    SERVICE_CATEGORY
  ) {
    throw new Error(
      "El tipo de servicio no pertenece a transporte."
    );
  }

  validateDuplicates(
    types,
    serviceData,
    serviceTypeId
  );

  validateMinimumActiveServices(
    types,
    serviceData.isActive,
    serviceTypeId
  );

  return updateDoc(
    doc(
      db,
      "companies",
      companyId,
      SERVICE_TYPES_COLLECTION,
      serviceTypeId
    ),
    {
      ...serviceData,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        userId
    }
  );
};


/* =========================================================
   ACTIVE SERVICE VALIDATION
========================================================= */

const validateMinimumActiveServices = (
  types,
  isActive,
  serviceTypeId
) => {
  if (isActive !== false) {
    return;
  }

  const activeServices =
    types.filter(
      service =>
        service.isActive &&
        service.category ===
          SERVICE_CATEGORY
    );

  const isLastActiveService =
    activeServices.length === 1 &&
    activeServices[0].id ===
      serviceTypeId;

  if (isLastActiveService) {
    throw new Error(
      "Debe existir al menos un servicio de transporte activo."
    );
  }
};


/* =========================================================
   TOGGLE STATUS
========================================================= */

export const toggleServiceTypeStatus = async (
  companyId,
  serviceTypeId,
  currentStatus
) => {
  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!serviceTypeId) {
    throw new Error(
      "ID requerido."
    );
  }

  const snapshot = await getDocs(
    getServiceTypesCollection(companyId)
  );

  const types = snapshot.docs.map(
    document => ({
      id: document.id,
      ...document.data()
    })
  );

  const currentService =
    types.find(
      service =>
        service.id === serviceTypeId
    );

  if (!currentService) {
    throw new Error(
      "Tipo de servicio no encontrado."
    );
  }

  if (
    currentService.category !==
    SERVICE_CATEGORY
  ) {
    throw new Error(
      "El tipo de servicio no pertenece a transporte."
    );
  }

  validateMinimumActiveServices(
    types,
    !currentStatus,
    serviceTypeId
  );

  return updateDoc(
    doc(
      db,
      "companies",
      companyId,
      SERVICE_TYPES_COLLECTION,
      serviceTypeId
    ),
    {
      isActive:
        !currentStatus,

      updatedAt:
        Timestamp.now()
    }
  );
};