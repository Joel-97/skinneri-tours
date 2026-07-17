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
   OBTENER CLIENTES
========================================================= */

export const getClients = async (companyId) => {

  if (!companyId) {

    const error = new Error("company_required");
    error.code = "company_required";

    throw error;

  }

  const q = query(

    collection(
      db,
      "companies",
      companyId,
      "clients"
    ),

    orderBy("createdAt", "desc"),

    limit(50)

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};

/* =========================================================
   CREAR CLIENTE
========================================================= */

export const createClient = async (

  companyId,

  data,

  user

) => {

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

  if (!data.name?.trim()) {

    const error = new Error("client_name_required");
    error.code = "client_name_required";

    throw error;

  }

  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );

  /*
  ==========================================================
  VALIDAR DUPLICADO
  ==========================================================
  */

  const duplicateQuery = query(

    clientsRef,

    where(

      "nameLower",

      "==",

      data.nameLower

    )

  );

  const duplicateSnapshot = await getDocs(

    duplicateQuery

  );

  if (!duplicateSnapshot.empty) {

    const error = new Error("duplicate_name");
    error.code = "duplicate_name";

    throw error;

  }

  /*
  ==========================================================
  CREATE
  ==========================================================
  */

  return await addDoc(

    clientsRef,

    {

      ...data,

      createdBy: user.uid,

      updatedBy: user.uid,

      createdAt: Timestamp.now(),

      updatedAt: Timestamp.now()

    }

  );

};

/* =========================================================
   ACTUALIZAR CLIENTE
========================================================= */

export const updateClient = async (

  companyId,

  clientId,

  data,

  user

) => {

  if (!companyId) {

    const error = new Error("company_required");
    error.code = "company_required";

    throw error;

  }

  if (!clientId) {

    const error = new Error("client_required");
    error.code = "client_required";

    throw error;

  }

  if (!data.name?.trim()) {

    const error = new Error("client_name_required");
    error.code = "client_name_required";

    throw error;

  }

  const ref = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );

  return await updateDoc(

    ref,

    {

      ...data,

      updatedBy: user?.uid || null,

      updatedAt: Timestamp.now()

    }

  );

};

/* =========================================================
   ELIMINAR CLIENTE
========================================================= */

export const deleteClient = async (

  companyId,

  clientId

) => {

  if (!companyId) {

    const error = new Error("company_required");
    error.code = "company_required";

    throw error;

  }

  if (!clientId) {

    const error = new Error("client_required");
    error.code = "client_required";

    throw error;

  }

  const ref = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );

  return await deleteDoc(ref);

};

/* =========================================================
   OBTENER CLIENTE POR ID
========================================================= */

export const getClientById = async (

  companyId,

  clientId

) => {

  if (!companyId) {

    const error = new Error("company_required");
    error.code = "company_required";

    throw error;

  }

  if (!clientId) {

    const error = new Error("client_required");
    error.code = "client_required";

    throw error;

  }

  const ref = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {

    return null;

  }

  return {

    id: snapshot.id,

    ...snapshot.data()

  };

};

/* =========================================================
   BUSCAR CLIENTES
========================================================= */

export const searchClients = async (

  searchTerm,

  companyId

) => {

  if (!companyId) {

    const error = new Error("company_required");
    error.code = "company_required";

    throw error;

  }

  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );

  if (!searchTerm) {

    const q = query(

      clientsRef,

      orderBy("createdAt", "desc"),

      limit(20)

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

      id: doc.id,

      ...doc.data()

    }));

  }

  const q = query(

    clientsRef,

    where(

      "nameLower",

      ">=",

      searchTerm.toLowerCase()

    ),

    where(

      "nameLower",

      "<=",

      searchTerm.toLowerCase() + "\uf8ff"

    ),

    limit(10)

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};

/* =========================================================
   BUSCAR CLIENTES POR NOMBRE O EMAIL
========================================================= */

export const searchClientsByName = async (

  companyId,

  searchTerm

) => {

  if (!companyId || !searchTerm) {

    return [];

  }

  const formattedTerm =

    searchTerm.toLowerCase();

  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );

  const nameQuery = query(

    clientsRef,

    where(

      "nameLower",

      ">=",

      formattedTerm

    ),

    where(

      "nameLower",

      "<=",

      formattedTerm + "\uf8ff"

    ),

    limit(10)

  );

  const emailQuery = query(

    clientsRef,

    where(

      "emailLower",

      ">=",

      formattedTerm

    ),

    where(

      "emailLower",

      "<=",

      formattedTerm + "\uf8ff"

    ),

    limit(10)

  );

  const [

    nameSnapshot,

    emailSnapshot

  ] = await Promise.all([

    getDocs(nameQuery),

    getDocs(emailQuery)

  ]);

  const results = new Map();

  nameSnapshot.docs.forEach(doc => {

    results.set(

      doc.id,

      {

        id: doc.id,

        ...doc.data()

      }

    );

  });

  emailSnapshot.docs.forEach(doc => {

    results.set(

      doc.id,

      {

        id: doc.id,

        ...doc.data()

      }

    );

  });

  return Array.from(

    results.values()

  ).slice(0, 10);

};