import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  startAt,
  endAt,
  Timestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { server } from '../serverName/Server';

/* ======================================================
   CREATE CLIENT
====================================================== */
export const createClient = async (companyId, data, user) => {
  const clientsRef = collection(db, "companies", companyId, "clients");

  // validar duplicados por nombre
  const nameQ = query(clientsRef, where("name", "==", data.name));
  const nameSnap = await getDocs(nameQ);

  if (!nameSnap.empty) {
    throw new Error("Ya existe un cliente con ese nombre");
  }

  // validar duplicados por email
  if (data.email) {
    const emailQ = query(clientsRef, where("email", "==", data.email));
    const emailSnap = await getDocs(emailQ);

    if (!emailSnap.empty) {
      throw new Error("Ese correo ya está registrado");
    }
  }

  // validar duplicados por teléfono
  if (data.phone) {
    const phoneQ = query(clientsRef, where("phone", "==", data.phone));
    const phoneSnap = await getDocs(phoneQ);

    if (!phoneSnap.empty) {
      throw new Error("Ese teléfono ya está registrado");
    }
  }

  // crear cliente
  return await addDoc(clientsRef, {
    ...data,

    type: data.type || "Person", // Person | company
    status: data.status || "complete",
    source: data.source || "manual",

    nationality: data.nationality || "",
    birthday: data.birthday || "",
    tags: data.tags || [],

    createdBy: user.uid,
    updatedBy: user.uid,

    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

/* ======================================================
   FIND CLIENT BY EMAIL OR PHONE
   → usado para reservas rápidas
====================================================== */
export const findClientByEmailOrPhone = async (companyId, { email, phone }) => {
  const clientsRef = collection(db, "companies", companyId, "clients");

  if (email) {
    const emailQ = query(clientsRef, where("email", "==", email));
    const snapshot = await getDocs(emailQ);

    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
  }

  if (phone) {
    const phoneQ = query(clientsRef, where("phone", "==", phone));
    const snapshot = await getDocs(phoneQ);

    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
  }

  return null;
};

/* ======================================================
   SEARCH CLIENTS (AUTOCOMPLETE)
   → búsqueda rápida por nombre
====================================================== */
export const searchClients = async (companyId, text) => {
  if (!text) return [];

  const clientsRef = collection(db, "companies", companyId, "clients");

  const q = query(
    clientsRef,
    orderBy("name"),
    startAt(text),
    endAt(text + "\uf8ff")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/* ======================================================
   UPDATE CLIENT
   → necesario para CRM real
====================================================== */
export const updateClient = async (companyId, clientId, data, user) => {
  const clientRef = doc(db, "companies", companyId, "clients", clientId);

  return await updateDoc(clientRef, {
    ...data,
    updatedBy: user.uid,
    updatedAt: Timestamp.now()
  });
};


/* ======================================================
   GET CLIENT
====================================================== */
export const getClients = async (companyId) => {

  const q = query(
    collection(db, "companies", companyId, "clients"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};