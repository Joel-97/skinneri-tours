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

const CURRENCIES_COLLECTION = "currencies";

/* ===============================
   FIRESTORE HELPERS
================================ */

const getCurrenciesCollection = (companyId) =>
  collection(
    db,
    "companies",
    companyId,
    CURRENCIES_COLLECTION
  );

const getCurrencyDoc = (
  companyId,
  currencyId
) =>
  doc(
    db,
    "companies",
    companyId,
    CURRENCIES_COLLECTION,
    currencyId
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

const validateCurrencyId = (
  currencyId
) => {
  if (
    !currencyId ||
    typeof currencyId !== "string"
  ) {
    throw new Error(
      "Currency ID is required."
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

const validateCurrencyData = (data) => {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Currency data is required."
    );
  }

  if (
    !data.code ||
    !data.code.trim()
  ) {
    throw new Error(
      "Currency code is required."
    );
  }

  if (
    !data.name ||
    !data.name.trim()
  ) {
    throw new Error(
      "Currency name is required."
    );
  }

  if (
    !data.symbol ||
    !data.symbol.trim()
  ) {
    throw new Error(
      "Currency symbol is required."
    );
  }
};

/* ===============================
   NORMALIZATION
================================ */

const normalizeCode = (
  value = ""
) => {
  return value
    .trim()
    .toUpperCase();
};

const normalizeText = (
  value = ""
) => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeCurrencyData = (
  data = {}
) => {
  return {
    code: normalizeCode(data.code),
    name: normalizeText(data.name),
    symbol: data.symbol?.trim() || "",
    isDefault: !!data.isDefault,
    isActive: data.isActive !== false
  };
};

/* ===============================
   DEFAULT CURRENCY HELPERS
================================ */

const getDefaultCurrencies = async (
  companyId
) => {
  const ref =
    getCurrenciesCollection(
      companyId
    );

  const q = query(
    ref,
    where("isDefault", "==", true)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs;
};

const removeExistingDefaults = async (
  companyId,
  currencyId = null
) => {
  const existing =
    await getDefaultCurrencies(
      companyId
    );

  const currenciesToUpdate =
    existing.filter(
      (currency) =>
        currency.id !== currencyId
    );

  if (
    currenciesToUpdate.length === 0
  ) {
    return;
  }

  await Promise.all(
    currenciesToUpdate.map(
      (currency) =>
        updateDoc(currency.ref, {
          isDefault: false,
          updatedAt: serverTimestamp()
        })
    )
  );
};

/* ===============================
   GET CURRENCIES
================================ */

export const getCurrencies = async (
  companyId
) => {
  validateCompanyId(companyId);

  const ref =
    getCurrenciesCollection(
      companyId
    );

  const snapshot =
    await getDocs(ref);

  return snapshot.docs.map(
    (currency) => ({
      id: currency.id,
      ...currency.data()
    })
  );
};

/* ===============================
   CREATE CURRENCY
================================ */

export const createCurrency = async (
  companyId,
  data,
  user
) => {
  validateCompanyId(companyId);
  validateUser(user);
  validateCurrencyData(data);

  const normalizedData =
    normalizeCurrencyData(data);

  /*
   * Only one currency can be
   * the default currency.
   */
  if (normalizedData.isDefault) {
    await removeExistingDefaults(
      companyId
    );
  }

  const ref =
    getCurrenciesCollection(
      companyId
    );

  const userId =
    getUserId(user);

  const currencyData = {
    code: normalizedData.code,
    name: normalizedData.name,
    symbol: normalizedData.symbol,
    isDefault: normalizedData.isDefault,
    isActive: normalizedData.isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId
  };

  const document = await addDoc(
    ref,
    currencyData
  );

  return {
    id: document.id,
    ...currencyData
  };
};

/* ===============================
   UPDATE CURRENCY
================================ */

export const updateCurrency = async (
  companyId,
  currencyId,
  data,
  user
) => {
  validateCompanyId(companyId);

  validateCurrencyId(
    currencyId
  );

  validateUser(user);
  validateCurrencyData(data);

  const normalizedData =
    normalizeCurrencyData(data);

  /*
   * If this currency becomes
   * the default, all other
   * default currencies are reset.
   */
  if (normalizedData.isDefault) {
    await removeExistingDefaults(
      companyId,
      currencyId
    );
  }

  const ref =
    getCurrencyDoc(
      companyId,
      currencyId
    );

  const userId =
    getUserId(user);

  const updateData = {
    code: normalizedData.code,
    name: normalizedData.name,
    symbol: normalizedData.symbol,
    isDefault: normalizedData.isDefault,
    isActive: normalizedData.isActive,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  };

  await updateDoc(
    ref,
    updateData
  );

  return {
    id: currencyId,
    ...updateData
  };
};

/* ===============================
   TOGGLE CURRENCY STATUS
================================ */

export const toggleCurrencyStatus = async (
  companyId,
  currencyId,
  currentStatus,
  user
) => {
  validateCompanyId(companyId);
  validateCurrencyId(currencyId);
  validateUser(user);

  const ref = getCurrencyDoc(
    companyId,
    currencyId
  );

  /*
   * If the currency is currently active,
   * check whether there is another active
   * currency before disabling it.
   */
  if (currentStatus === true) {
    const currencies =
      await getCurrencies(companyId);

    const otherActiveCurrencies =
      currencies.filter(
        (currency) =>
          currency.id !== currencyId &&
          currency.isActive === true
      );

    if (otherActiveCurrencies.length === 0) {
      throw new Error(
        "Debe existir al menos una moneda activa."
      );
    }
  }

  const newStatus = !currentStatus;

  const userId = getUserId(user);

  await updateDoc(ref, {
    isActive: newStatus,
    updatedAt: serverTimestamp(),
    updatedBy: userId
  });

  return {
    id: currencyId,
    isActive: newStatus
  };
};