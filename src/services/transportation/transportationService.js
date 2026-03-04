import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

/* =========================================================
   OBTENER RESERVAS
========================================================= */
export const getTransportation = async (companyId) => {

  if (!companyId) {
    const error = new Error("company_required");
    error.code = "company_required";
    throw error;
  }

  const q = query(
    collection(db, "companies", companyId, "transportation"),
    orderBy("date", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


/* =========================================================
   CREAR RESERVA
========================================================= */
export const createTransportation = async (companyId, data, user) => {

  if (!companyId) {
    const error = new Error("company_required");
    error.code = "company_required";
    throw error;
  }

  if (!user) {
    const error = new Error("user_required");
    error.code = "user_required";
    throw error;
  }

  if (!data.date) {
    const error = new Error("Por favor agregue una fecha");
    error.code = "date_required";
    throw error;
  }

  const transportationRef = collection(
    db,
    "companies",
    companyId,
    "transportation"
  );

  return await addDoc(transportationRef, {

    ...data,

    clientId: data.clientId || null,

    // 🔹 Fechas como Timestamp
    date: Timestamp.fromDate(new Date(data.date)),
    endDate: data.endDate
      ? Timestamp.fromDate(new Date(data.endDate))
      : null,

    // 🔹 Metadata
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

/* =========================================================
   ACTUALIZAR RESERVA
========================================================= */
export const updateTransportation = async (
  companyId,
  id,
  data,
  user
) => {

  if (!companyId) {
    const error = new Error("company_required");
    error.code = "company_required";
    throw error;
  }

  if (!id) {
    const error = new Error("reservation_id_required");
    error.code = "reservation_id_required";
    throw error;
  }

  if (!data.date) {
    const error = new Error("Por favor agregue una fecha");
    error.code = "date_required";
    throw error;
  }

  const ref = doc(
    db,
    "companies",
    companyId,
    "transportation",
    id
  );

  return await updateDoc(ref, {

    ...data,

    // 🔹 Fechas como Timestamp
    date: Timestamp.fromDate(new Date(data.date)),
    endDate: data.endDate
      ? Timestamp.fromDate(new Date(data.endDate))
      : null,

    // 🔹 Metadata
    updatedBy: user?.uid || null,
    updatedAt: Timestamp.now()
  });
};

/* =========================================================
   ELIMINAR RESERVA
========================================================= */
export const deleteTransportation = async (companyId, id) => {

  if (!companyId) {
    const error = new Error("company_required");
    error.code = "company_required";
    throw error;
  }

  if (!id) {
    const error = new Error("reservation_id_required");
    error.code = "reservation_id_required";
    throw error;
  }

  const ref = doc(db, "companies", companyId, "transportation", id);

  return await deleteDoc(ref);
};

/* =========================================================
   VERIFICAR SI EXISTE NUMERO DE RESERVACION
========================================================= */

export const reservationNumberExists = async (companyId, reservationNumber) => {
  try {
    const q = query(
      collection(db, "companies", companyId, "transportation"),
      where("reservationNumber", "==", reservationNumber)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

  } catch (error) {
    console.error("Error verificando reservationNumber:", error);
    return false;
  }
};