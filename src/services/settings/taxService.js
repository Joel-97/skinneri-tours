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
import { db } from "../../firebase"; // ajusta si tu ruta cambia
import { server } from '../serverName/Server';

// Obtener todos los impuestos
export const getTaxes = async (companyId) => {
  const snapshot = await getDocs(
    collection(db, "companies", companyId, "taxes")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Crear impuesto
export const createTax = async (companyId, taxData, user) => {

  // Si se marca como default, quitar el anterior
  if (taxData.isDefault) {
    const q = query(
      collection(db, "companies", companyId, "taxes"),
      where("isDefault", "==", true)
    );

    const existing = await getDocs(q);

    existing.forEach(async (d) => {
      await updateDoc(d.ref, { isDefault: false });
    });
  }

  return await addDoc(
    collection(db, "companies", companyId, "taxes"),
    {
      ...taxData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};

// Actualizar impuesto
export const updateTax = async (companyId, taxId, taxData, user) => {

  if (taxData.isDefault) {
    const q = query(
      collection(db, "companies", companyId, "taxes"),
      where("isDefault", "==", true)
    );

    const existing = await getDocs(q);

    existing.forEach(async (d) => {
      if (d.id !== taxId) {
        await updateDoc(d.ref, { isDefault: false });
      }
    });
  }

  return await updateDoc(
    doc(db, "companies", companyId, "taxes", taxId),
    {
      ...taxData,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );
};

// Activar / Desactivar
export const toggleTaxStatus = async (companyId, taxId, currentStatus) => {
  return await updateDoc(
    doc(db, "companies", companyId, "taxes", taxId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};
