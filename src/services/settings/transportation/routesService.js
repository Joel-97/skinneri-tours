import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp
} from "firebase/firestore";

import { db } from "../../../firebase";

/* ===============================
   GET ROUTES
================================= */

export const getRoutes = async (companyId) => {

  const snapshot = await getDocs(
    collection(
      db,
      "companies",
      companyId,
      "routes"
    )
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

};

/* ===============================
   CREATE ROUTE
================================= */

export const createRoute = async (
  companyId,
  data,
  user
) => {

  /* -----------------------------
     VALIDATIONS
  ----------------------------- */

  if (
    data.origin.id ===
    data.destination.id
  ) {

    throw new Error(
      "El origen y el destino no pueden ser iguales."
    );

  }

  /* -----------------------------
     DUPLICATE CODE
  ----------------------------- */

  const normalizedCode =
    data.code
      .trim()
      .toUpperCase();

  const snapshot = await getDocs(

    query(

      collection(
        db,
        "companies",
        companyId,
        "routes"
      ),

      where(
        "code",
        "==",
        normalizedCode
      )

    )

  );

  if (!snapshot.empty) {

    throw new Error(
      "Ya existe una ruta con ese código."
    );

  }

  /* -----------------------------
     CREATE
  ----------------------------- */

  return await addDoc(

    collection(
      db,
      "companies",
      companyId,
      "routes"
    ),

    {

      code: normalizedCode,

      origin: {

        id: data.origin.id,
        name: data.origin.name

      },

      destination: {

        id: data.destination.id,
        name: data.destination.name

      },

      distanceKm:
        data.distanceKm || null,

      estimatedMinutes:
        data.estimatedMinutes || null,

      description:
        data.description?.trim() || "",

      isActive:
        data.isActive ?? true,

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
   UPDATE ROUTE
================================= */

export const updateRoute = async (
  companyId,
  routeId,
  data,
  user
) => {

  /* -----------------------------
     VALIDATIONS
  ----------------------------- */

  if (
    data.origin.id ===
    data.destination.id
  ) {

    throw new Error(
      "El origen y el destino no pueden ser iguales."
    );

  }

  /* -----------------------------
     DUPLICATE CODE
  ----------------------------- */

  const normalizedCode =
    data.code
      .trim()
      .toUpperCase();

  const snapshot = await getDocs(

    query(

      collection(
        db,
        "companies",
        companyId,
        "routes"
      ),

      where(
        "code",
        "==",
        normalizedCode
      )

    )

  );

  const duplicate =
    snapshot.docs.find(
      doc => doc.id !== routeId
    );

  if (duplicate) {

    throw new Error(
      "Ya existe una ruta con ese código."
    );

  }

  /* -----------------------------
     UPDATE
  ----------------------------- */

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "routes",

      routeId

    ),

    {

      code: normalizedCode,

      origin: {

        id: data.origin.id,
        name: data.origin.name

      },

      destination: {

        id: data.destination.id,
        name: data.destination.name

      },

      distanceKm:
        data.distanceKm || null,

      estimatedMinutes:
        data.estimatedMinutes || null,

      description:
        data.description?.trim() || "",

      isActive:
        data.isActive,

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

export const toggleRouteStatus = async (
  companyId,
  routeId,
  currentStatus
) => {

  return await updateDoc(

    doc(
      db,
      "companies",
      companyId,
      "routes",
      routeId
    ),

    {

      isActive: !currentStatus,

      updatedAt: Timestamp.now()

    }

  );

};

/* ===============================
   DELETE ROUTE
================================= */

export const deleteRoute = async (
  companyId,
  routeId
) => {

  return await deleteDoc(

    doc(
      db,
      "companies",
      companyId,
      "routes",
      routeId
    )

  );

};