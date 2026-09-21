import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";

const DISCOUNTS_COLLECTION = "discounts";

/* ===============================
   FIRESTORE HELPERS
================================ */

const getDiscountsCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    DISCOUNTS_COLLECTION
  );

const getDiscountDoc = (
  companyId,
  discountId
) =>
  doc(
    db,
    "companies",
    companyId,
    DISCOUNTS_COLLECTION,
    discountId
  );

/* ===============================
   VALIDATION HELPERS
================================ */

const validateCompanyId = (companyId) => {
  if (
    !companyId ||
    typeof companyId !== "string"
  ) {
    throw new Error(
      "Company ID is required."
    );
  }
};

const validateDiscountId = (
  discountId
) => {
  if (
    !discountId ||
    typeof discountId !== "string"
  ) {
    throw new Error(
      "Discount ID is required."
    );
  }
};

const validateUser = (user) => {
  if (!user) {
    throw new Error(
      "Authenticated user is required."
    );
  }
};

const getUserId = (user) => {
  return user?.uid || user?.id || null;
};

const validateDiscountData = (
  data
) => {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Discount data is required."
    );
  }

  if (
    !data.name ||
    !data.name.trim()
  ) {
    throw new Error(
      "El nombre es obligatorio."
    );
  }

  if (!data.type) {
    throw new Error(
      "Debe seleccionar un tipo."
    );
  }

  if (
    data.type !== "percentage" &&
    data.type !== "fixed"
  ) {
    throw new Error(
      "El tipo de descuento no es válido."
    );
  }

  if (
    data.value === "" ||
    data.value === null ||
    data.value === undefined ||
    Number.isNaN(Number(data.value)) ||
    Number(data.value) <= 0
  ) {
    throw new Error(
      "El valor debe ser mayor a 0."
    );
  }

  if (
    data.type === "fixed" &&
    (!data.currency ||
      !data.currency.trim())
  ) {
    throw new Error(
      "Debe seleccionar una moneda."
    );
  }

  if (
    data.type === "percentage" &&
    Number(data.value) > 100
  ) {
    throw new Error(
      "El porcentaje no puede ser mayor a 100."
    );
  }
};

/* ===============================
   NORMALIZATION
================================ */

const normalizeName = (
  value = ""
) => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeCurrency = (
  value = ""
) => {
  return value
    .trim()
    .toUpperCase();
};

const normalizeDiscountData = (
  data = {}
) => {
  const type = data.type;

  return {
    name: normalizeName(data.name),
    type,
    value: Number(data.value),
    currency:
      type === "fixed"
        ? normalizeCurrency(data.currency)
        : null,
    expirationDate:
      data.expirationDate || "",
    isActive:
      data.isActive !== false
  };
};

/* ===============================
   EXPIRATION DATE
================================ */

const buildExpirationTimestamp = (
  expirationDate
) => {
  if (!expirationDate) {
    return null;
  }

  if (
    expirationDate instanceof Timestamp
  ) {
    return expirationDate;
  }

  if (
    expirationDate?.toDate
  ) {
    return Timestamp.fromDate(
      expirationDate.toDate()
    );
  }

  const date = new Date(
    `${expirationDate}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "La fecha de expiración no es válida."
    );
  }

  return Timestamp.fromDate(date);
};

/* ===============================
   DUPLICATE NAME VALIDATION
================================ */

const validateDuplicateName = async (
  companyId,
  name,
  discountId = null
) => {
  const ref =
    getDiscountsCollection(
      companyId
    );

  const q = query(
    ref,
    where("name", "==", name)
  );

  const snapshot =
    await getDocs(q);

  const duplicate =
    snapshot.docs.find(
      (discount) =>
        discount.id !== discountId
    );

  if (duplicate) {
    throw new Error(
      "Ya existe un descuento con ese nombre."
    );
  }
};

/* ===============================
   GET DISCOUNTS
================================ */

export const getDiscounts = async (
  companyId
) => {
  validateCompanyId(companyId);

  const ref =
    getDiscountsCollection(
      companyId
    );

  const snapshot =
    await getDocs(ref);

  return snapshot.docs.map(
    (discount) => ({
      id: discount.id,
      ...discount.data()
    })
  );
};

/* ===============================
   CREATE DISCOUNT
================================ */

export const createDiscount = async (
  companyId,
  data,
  user
) => {
  validateCompanyId(companyId);
  validateUser(user);
  validateDiscountData(data);

  const normalizedData =
    normalizeDiscountData(data);

  await validateDuplicateName(
    companyId,
    normalizedData.name
  );

  const ref =
    getDiscountsCollection(
      companyId
    );

  const userId =
    getUserId(user);

  const discountData = {
    name: normalizedData.name,

    type: normalizedData.type,

    value: normalizedData.value,

    currency:
      normalizedData.currency,

    expirationDate:
      buildExpirationTimestamp(
        normalizedData.expirationDate
      ),

    appliesTo: {
      serviceTypes: []
    },

    isActive:
      normalizedData.isActive,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),

    createdBy:
      userId,

    updatedBy:
      userId
  };

  const document =
    await addDoc(
      ref,
      discountData
    );

  return {
    id: document.id,
    ...discountData
  };
};

/* ===============================
   UPDATE DISCOUNT
================================ */

export const updateDiscount = async (
  companyId,
  discountId,
  data,
  user
) => {
  validateCompanyId(companyId);

  validateDiscountId(
    discountId
  );

  validateUser(user);
  validateDiscountData(data);

  const normalizedData =
    normalizeDiscountData(data);

  await validateDuplicateName(
    companyId,
    normalizedData.name,
    discountId
  );

  /*
   * Prevent the company from
   * having zero active discounts.
   */
  if (
    normalizedData.isActive === false
  ) {
    const ref =
      getDiscountsCollection(
        companyId
      );

    const activeQuery = query(
      ref,
      where("isActive", "==", true)
    );

    const snapshot =
      await getDocs(activeQuery);

    const hasAnotherActiveDiscount =
      snapshot.docs.some(
        (discount) =>
          discount.id !== discountId
      );

    if (
      !hasAnotherActiveDiscount
    ) {
      throw new Error(
        "Debe existir al menos un descuento activo."
      );
    }
  }

  const ref =
    getDiscountDoc(
      companyId,
      discountId
    );

  const userId =
    getUserId(user);

  const updateData = {
    name: normalizedData.name,

    type: normalizedData.type,

    value: normalizedData.value,

    currency:
      normalizedData.currency,

    expirationDate:
      buildExpirationTimestamp(
        normalizedData.expirationDate
      ),

    isActive:
      normalizedData.isActive,

    updatedAt:
      serverTimestamp(),

    updatedBy:
      userId
  };

  await updateDoc(
    ref,
    updateData
  );

  return {
    id: discountId,
    ...updateData
  };
};

/* ===============================
   TOGGLE DISCOUNT STATUS
================================ */

export const toggleDiscountStatus = async (
  companyId,
  discountId,
  currentStatus,
  user
) => {
  validateCompanyId(companyId);

  validateDiscountId(
    discountId
  );

  validateUser(user);

  /*
   * Only validate the minimum
   * active discount rule when
   * disabling an active discount.
   */
  if (currentStatus === true) {
    const ref =
      getDiscountsCollection(
        companyId
      );

    const activeQuery = query(
      ref,
      where("isActive", "==", true)
    );

    const snapshot =
      await getDocs(activeQuery);

    /*
     * Check whether another
     * active discount exists.
     */
    const hasAnotherActiveDiscount =
      snapshot.docs.some(
        (discount) =>
          discount.id !== discountId
      );

    if (
      !hasAnotherActiveDiscount
    ) {
      throw new Error(
        "Debe existir al menos un descuento activo."
      );
    }
  }

  const ref =
    getDiscountDoc(
      companyId,
      discountId
    );

  const userId =
    getUserId(user);

  const newStatus =
    !currentStatus;

  const updateData = {
    isActive: newStatus,

    updatedAt:
      serverTimestamp(),

    updatedBy:
      userId
  };

  await updateDoc(
    ref,
    updateData
  );

  return {
    id: discountId,
    isActive: newStatus
  };
};