import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "../../firebase";

/* =========================================================
   CREAR CLIENTE (POR EMPRESA)
========================================================= */
export const createClient = async (data, user, companyId) => {

  if (!companyId) throw new Error("company_required");

  const clientsRef = collection(db, "companies", companyId, "clients");

  // Validar duplicado por nombre dentro de la empresa
  const nameQuery = query(clientsRef, where("name", "==", data.name));
  const nameSnap = await getDocs(nameQuery);

  if (!nameSnap.empty) {
    const error = new Error("duplicate_name");
    error.code = "duplicate_name";
    throw error;
  }

  return await addDoc(clientsRef, {
    name: data.name,
    nameLower: data.name.toLowerCase(),
    email: data.email || "",
    emailLower: data.email?.toLowerCase() || "",
    phone: data.phone || "",
    nationality: data.nationality || "",
    birthday: data.birthday || "",
    tags: data.tags || [],
    type: data.type || "person",
    status: data.status || "active",
    source: data.source || "manual",
    notes: data.notes || "",
    createdBy: user.uid,
    updatedBy: user.uid,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

/* =========================================================
   ACTUALIZAR CLIENTE
========================================================= */
export const updateClient = async (clientId, data, user, companyId) => {

  if (!companyId) throw new Error("company_required");

  const ref = doc(db, "companies", companyId, "clients", clientId);

  await updateDoc(ref, {
    ...data,
    nameLower: data.name.toLowerCase(),
    emailLower: data.email?.toLowerCase() || "",
    updatedBy: user.uid,
    updatedAt: Timestamp.now()
  });
};

/* =========================================================
   ELIMINAR CLIENTE
========================================================= */
export const deleteClient = async (clientId, companyId) => {

  if (!companyId) throw new Error("company_required");

  const ref = doc(db, "companies", companyId, "clients", clientId);
  await deleteDoc(ref);
};

/* =========================================================
   OBTENER CLIENTE POR ID
========================================================= */
export const getClientById = async (clientId, companyId) => {

  if (!companyId) throw new Error("company_required");

  const ref = doc(db, "companies", companyId, "clients", clientId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data()
  };
};

/* =========================================================
   BUSCAR CLIENTES
========================================================= */
export const searchClients = async (searchTerm, companyId) => {

  if (!companyId) throw new Error("company_required");

  const clientsRef = collection(db, "companies", companyId, "clients");

  if (!searchTerm) {
    const q = query(
      clientsRef,
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  const nameQuery = query(
    clientsRef,
    where("name", ">=", searchTerm),
    where("name", "<=", searchTerm + "\uf8ff"),
    limit(10)
  );

  const snap = await getDocs(nameQuery);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/* =========================================================
   LISTAR CLIENTES
========================================================= */
export const getClients = async (companyId) => {

  if (!companyId) throw new Error("company_required");

  const clientsRef = collection(db, "companies", companyId, "clients");

  const q = query(
    clientsRef,
    orderBy("createdAt", "desc"),
    limit(50)
  );

  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


/* =========================================================
   BUSCA CLIENTES POR NOMBRE Y CORREO ELECTRONICO
========================================================= */

export const searchClientsByName = async (companyId, searchTerm) => {

  if (!companyId || !searchTerm) return [];

  const formattedTerm = searchTerm.toLowerCase();

  const clientsRef = collection(db, "companies", companyId, "clients");

  // 🔎 Buscar por nombre
  const nameQuery = query(
    clientsRef,
    where("nameLower", ">=", formattedTerm),
    where("nameLower", "<=", formattedTerm + "\uf8ff"),
    limit(10)
  );

  // 🔎 Buscar por email
  const emailQuery = query(
    clientsRef,
    where("emailLower", ">=", formattedTerm),
    where("emailLower", "<=", formattedTerm + "\uf8ff"),
    limit(10)
  );

  const [nameSnap, emailSnap] = await Promise.all([
    getDocs(nameQuery),
    getDocs(emailQuery)
  ]);

  const resultsMap = new Map();

  nameSnap.docs.forEach(doc => {
    resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  emailSnap.docs.forEach(doc => {
    resultsMap.set(doc.id, { id: doc.id, ...doc.data() });
  });

  return Array.from(resultsMap.values()).slice(0, 10);
};

