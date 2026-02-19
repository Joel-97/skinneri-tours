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
import { db } from "../../firebase";

export const getCurrencies = async (companyId) => {
  const snapshot = await getDocs(
    collection(db, "companies", companyId, "currencies")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};

export const createCurrency = async (companyId, data, user) => {

  if (data.isDefault) {
    const q = query(
      collection(db, "companies", companyId, "currencies"),
      where("isDefault", "==", true)
    );

    const existing = await getDocs(q);

    existing.forEach(async (d) => {
      await updateDoc(d.ref, { isDefault: false });
    });
  }

  return await addDoc(
    collection(db, "companies", companyId, "currencies"),
    {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};

export const updateCurrency = async (companyId, currencyId, data, user) => {

  if (data.isDefault) {
    const q = query(
      collection(db, "companies", companyId, "currencies"),
      where("isDefault", "==", true)
    );

    const existing = await getDocs(q);

    existing.forEach(async (d) => {
      if (d.id !== currencyId) {
        await updateDoc(d.ref, { isDefault: false });
      }
    });
  }

  return await updateDoc(
    doc(db, "companies", companyId, "currencies", currencyId),
    {
      ...data,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );
};

export const toggleCurrencyStatus = async (companyId, currencyId, currentStatus) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "currencies")
  );

  const currencies = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const activeCurrencies = currencies.filter(c => c.isActive);

  // Si intenta desactivar la última activa → bloquear
  if (currentStatus && activeCurrencies.length === 1) {
    throw new Error("Debe existir al menos una moneda activa.");
  }

  return await updateDoc(
    doc(db, "companies", companyId, "currencies", currencyId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};
