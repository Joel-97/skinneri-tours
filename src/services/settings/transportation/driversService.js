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

import { db } from "../../../firebase";

/* ==========================================
   GET DRIVERS
========================================== */

export const getDrivers = async (companyId) => {

  const snapshot = await getDocs(

    collection(

      db,

      "companies",

      companyId,

      "drivers"

    )

  );

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};

/* ==========================================
   CREATE DRIVER
========================================== */

export const createDriver = async (

  companyId,

  data,

  user

) => {

  /* ----------------------------------------
     DUPLICATE EMAIL
  ---------------------------------------- */

  if (data.email?.trim()) {

    const snapshot = await getDocs(

      query(

        collection(

          db,

          "companies",

          companyId,

          "drivers"

        ),

        where(

          "email",

          "==",

          data.email.trim().toLowerCase()

        )

      )

    );

    if (!snapshot.empty) {

      throw new Error(

        "Ya existe un conductor con ese correo electrónico."

      );

    }

  }

  /* ----------------------------------------
     CREATE
  ---------------------------------------- */

  return await addDoc(

    collection(

      db,

      "companies",

      companyId,

      "drivers"

    ),

    {

      name:

        data.name.trim(),

      phone:

        data.phone?.trim() || "",

      email:

        data.email?.trim().toLowerCase() || "",

      licenses:

        data.licenses || [],

      driverType:

        data.driverType,

      isAvailable:

        data.isAvailable ?? true,

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

/* ==========================================
   UPDATE DRIVER
========================================== */

export const updateDriver = async (

  companyId,

  driverId,

  data,

  user

) => {

  /* ----------------------------------------
     DUPLICATE EMAIL
  ---------------------------------------- */

  if (data.email?.trim()) {

    const snapshot = await getDocs(

      query(

        collection(

          db,

          "companies",

          companyId,

          "drivers"

        ),

        where(

          "email",

          "==",

          data.email.trim().toLowerCase()

        )

      )

    );

    const duplicate = snapshot.docs.find(

      doc => doc.id !== driverId

    );

    if (duplicate) {

      throw new Error(

        "Ya existe un conductor con ese correo electrónico."

      );

    }

  }

  /* ----------------------------------------
     UPDATE
  ---------------------------------------- */

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "drivers",

      driverId

    ),

    {

      name:

        data.name.trim(),

      phone:

        data.phone?.trim() || "",

      email:

        data.email?.trim().toLowerCase() || "",

      licenses:

        data.licenses || [],

      driverType:

        data.driverType,

      isAvailable:

        data.isAvailable,

      isActive:

        data.isActive,

      updatedAt:

        Timestamp.now(),

      updatedBy:

        user.uid

    }

  );

};

/* ==========================================
   TOGGLE STATUS
========================================== */

export const toggleDriverStatus = async (

  companyId,

  driverId,

  currentStatus

) => {

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "drivers",

      driverId

    ),

    {

      isActive: !currentStatus,

      updatedAt: Timestamp.now()

    }

  );

};