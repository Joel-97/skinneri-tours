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
   CONSTANTES
================================= */

export const SERVICE_CATEGORY = "transportation";


/* ===============================
   CODE CONFIGURATION
================================= */

const SERVICE_CODE_MIN_LENGTH = 3;

const SERVICE_CODE_MAX_LENGTH = 50;


/* ===============================
   NORMALIZE SERVICE CODE
================================= */

const normalizeServiceCode = (code) => {

  if (typeof code !== "string") {
    return "";
  }

  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

};


/* ===============================
   VALIDATE SERVICE CODE
================================= */

const validateServiceCode = (code) => {

  const normalizedCode = normalizeServiceCode(code);

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


/* ===============================
   GET SERVICE TYPES
================================= */

export const getServiceTypes = async (
  companyId
) => {

  if (!companyId) {
    throw new Error(
      "Empresa requerida."
    );
  }

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "serviceTypes"
    )
  );

  /*
  ==========================================
  SOLO SERVICIOS DE TRANSPORTE
  ==========================================
  */

  const data = snapshot.docs
    .map(d => ({
      id: d.id,
      ...d.data()
    }))
    .filter(
      service =>
        service.category === SERVICE_CATEGORY
    );

  return data;

};


/* ===============================
   VALIDACIONES BASE
================================= */

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

  /*
  ==========================================
  CATEGORÍA FIJA
  ==========================================
  */

  if (
    data.category !== SERVICE_CATEGORY
  ) {
    throw new Error(
      "El tipo de servicio debe pertenecer a la categoría de transporte."
    );
  }

};


/* ===============================
   NORMALIZAR PRECIO
================================= */

const normalizePricing = (data) => {

  let basePrice =
    data.basePrice ?? null;

  let currency =
    data.currency ?? null;

  let symbol =
    data.symbol ?? null;

  if (data.pricingMode === "fixed") {

    if (
      !basePrice ||
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


/* ===============================
   STAFF PAYMENT (COMISIONES)
================================= */

const normalizeStaffPayment = (data) => {

  const staffPayment =
    data.staffPayment?.enabled

      ? {
          enabled: true,

          type:
            data.staffPayment.type ||
            "fixed",

          value:
            data.staffPayment.value === "" ||
            data.staffPayment.value === undefined

              ? null

              : Number(
                  data.staffPayment.value
                )
        }

      : null;


  if (staffPayment) {

    if (
      staffPayment.value !== null &&
      staffPayment.value < 0
    ) {
      throw new Error(
        "El pago al staff no puede ser negativo."
      );
    }

    if (
      staffPayment.type === "percentage" &&
      staffPayment.value !== null &&
      staffPayment.value > 100
    ) {
      throw new Error(
        "La comisión no puede ser mayor a 100%."
      );
    }

  }

  return staffPayment;

};


/* ===============================
   CHECK DUPLICATE SERVICE CODE
================================= */

const checkDuplicateServiceCode = (
  types,
  code,
  serviceTypeId = null
) => {

  return types.find(
    service =>
      service.code === code &&
      service.id !== serviceTypeId &&
      service.category === SERVICE_CATEGORY
  );

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
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }


  /*
  ==========================================
  FORZAR TRANSPORTE
  ==========================================
  */

  const serviceData = {
    ...data,
    category: SERVICE_CATEGORY
  };


  validateServiceType(serviceData);


  /* ===============================
     SERVICE CODE
  ================================= */

  const code = validateServiceCode(
    serviceData.code
  );


  /* ===============================
     GET EXISTING TYPES
  ================================= */

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "serviceTypes"
    )
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));


  /* ===============================
     DUPLICATE NAME
  ================================= */

  const duplicateName = types.find(
    service =>
      service.name?.toLowerCase() ===
        serviceData.name.trim().toLowerCase() &&
      service.category === SERVICE_CATEGORY
  );


  if (duplicateName) {

    throw new Error(
      "Ya existe un tipo de servicio con ese nombre."
    );

  }


  /* ===============================
     DUPLICATE CODE
  ================================= */

  const duplicateCode =
    checkDuplicateServiceCode(
      types,
      code
    );


  if (duplicateCode) {

    throw new Error(
      "Ya existe un tipo de servicio con ese código."
    );

  }


  /* ===============================
     NORMALIZE DATA
  ================================= */

  const {
    basePrice,
    currency,
    symbol
  } = normalizePricing(serviceData);

  const staffPayment =
    normalizeStaffPayment(serviceData);


  /* ===============================
     CREATE
  ================================= */

  return await addDoc(
    collection(
      db,
      "companies",
      companyId,
      "serviceTypes"
    ),
    {

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

      basePrice,

      currency,

      symbol,

      durationMinutes:
        serviceData.durationMinutes ?? null,

      color:
        serviceData.color,

      staffPayment,

      isActive:
        serviceData.isActive ?? true,

      createdAt:
        Timestamp.now(),

      updatedAt:
        Timestamp.now(),

      createdBy:
        user.uid,

      updatedBy:
        user.uid

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
    throw new Error(
      "Empresa requerida."
    );
  }

  if (!serviceTypeId) {
    throw new Error(
      "ID requerido."
    );
  }

  if (!user) {
    throw new Error(
      "Usuario no autenticado."
    );
  }


  /*
  ==========================================
  FORZAR TRANSPORTE
  ==========================================
  */

  const serviceData = {
    ...data,
    category: SERVICE_CATEGORY
  };


  validateServiceType(serviceData);


  /* ===============================
     SERVICE CODE
  ================================= */

  const code = validateServiceCode(
    serviceData.code
  );


  /* ===============================
     GET EXISTING TYPES
  ================================= */

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "serviceTypes"
    )
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));


  /* ===============================
     VERIFY SERVICE EXISTS
  ================================= */

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


  /*
  ==========================================
  NO PERMITIR CONVERTIR OTROS TIPOS
  ==========================================
  */

  if (
    currentService.category !==
    SERVICE_CATEGORY
  ) {

    throw new Error(
      "El tipo de servicio no pertenece a transporte."
    );

  }


  /* ===============================
     DUPLICATE NAME
  ================================= */

  const duplicateName = types.find(
    service =>
      service.name?.toLowerCase() ===
        serviceData.name.trim().toLowerCase() &&
      service.category === SERVICE_CATEGORY &&
      service.id !== serviceTypeId
  );


  if (duplicateName) {

    throw new Error(
      "Ya existe un tipo de servicio con ese nombre."
    );

  }


  /* ===============================
     DUPLICATE CODE
  ================================= */

  const duplicateCode =
    checkDuplicateServiceCode(
      types,
      code,
      serviceTypeId
    );


  if (duplicateCode) {

    throw new Error(
      "Ya existe un tipo de servicio con ese código."
    );

  }


  /* ===============================
     MINIMUM ACTIVE SERVICES
  ================================= */

  if (serviceData.isActive === false) {

    const activeTypes =
      types.filter(
        service =>
          service.isActive &&
          service.category ===
            SERVICE_CATEGORY
      );


    if (
      activeTypes.length === 1 &&
      activeTypes[0].id === serviceTypeId
    ) {

      throw new Error(
        "Debe existir al menos un servicio de transporte activo."
      );

    }

  }


  /* ===============================
     NORMALIZE DATA
  ================================= */

  const {
    basePrice,
    currency,
    symbol
  } = normalizePricing(serviceData);

  const staffPayment =
    normalizeStaffPayment(serviceData);


  /* ===============================
     UPDATE
  ================================= */

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "serviceTypes",
      serviceTypeId
    ),
    {

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

      basePrice,

      currency,

      symbol,

      durationMinutes:
        serviceData.durationMinutes ?? null,

      color:
        serviceData.color,

      staffPayment,

      isActive:
        serviceData.isActive,

      updatedAt:
        Timestamp.now(),

      updatedBy:
        user.uid

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
    collection(
      db,
      "companies",
      companyId,
      "serviceTypes"
    )
  );

  const types = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));


  /* ===============================
     VERIFY SERVICE
  ================================= */

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


  /* ===============================
     ACTIVE TRANSPORT SERVICES
  ================================= */

  const activeTypes =
    types.filter(
      service =>
        service.isActive &&
        service.category ===
          SERVICE_CATEGORY
    );


  /*
  ==========================================
  NO PERMITIR DESACTIVAR EL ÚLTIMO
  ==========================================
  */

  if (
    currentStatus &&
    activeTypes.length === 1
  ) {

    throw new Error(
      "Debe existir al menos un servicio de transporte activo."
    );

  }


  /* ===============================
     UPDATE STATUS
  ================================= */

  return await updateDoc(
    doc(
      db,
      "companies",
      companyId,
      "serviceTypes",
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