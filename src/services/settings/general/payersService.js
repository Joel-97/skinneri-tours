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
   GET PAYERS
========================================== */

export const getPayers = async (companyId) => {

  const snapshot = await getDocs(

    collection(

      db,

      "companies",

      companyId,

      "payers"

    )

  );

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};

/* ==========================================
   CREATE PAYER
========================================== */

export const createPayer = async (

  companyId,

  data,

  user

) => {

  /* ----------------------------------------
     DUPLICATE NAME
  ---------------------------------------- */

  const normalizedName =

    data.name

      .trim()

      .replace(/\s+/g, " ");

  const nameSnapshot = await getDocs(

    query(

      collection(

        db,

        "companies",

        companyId,

        "payers"

      ),

      where(

        "name",

        "==",

        normalizedName

      )

    )

  );

  if (!nameSnapshot.empty) {

    throw new Error(

      "Ya existe un pagador con ese nombre."

    );

  }

  /* ----------------------------------------
     DUPLICATE EMAIL
  ---------------------------------------- */

  if (data.email?.trim()) {

    const emailSnapshot = await getDocs(

      query(

        collection(

          db,

          "companies",

          companyId,

          "payers"

        ),

        where(

          "email",

          "==",

          data.email

            .trim()

            .toLowerCase()

        )

      )

    );

    if (!emailSnapshot.empty) {

      throw new Error(

        "Ya existe un pagador con ese correo electrónico."

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

      "payers"

    ),

    {

      name:

        normalizedName,

      payerType:

        data.payerType,

      phone:

        data.phone?.trim() || "",

      email:

        data.email?.trim().toLowerCase() || "",

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
   UPDATE PAYER
========================================== */

export const updatePayer = async (

  companyId,

  payerId,

  data,

  user

) => {

  /* ----------------------------------------
     DUPLICATE NAME
  ---------------------------------------- */

  const normalizedName =

    data.name

      .trim()

      .replace(/\s+/g, " ");

  const nameSnapshot = await getDocs(

    query(

      collection(

        db,

        "companies",

        companyId,

        "payers"

      ),

      where(

        "name",

        "==",

        normalizedName

      )

    )

  );

  const duplicateName =

    nameSnapshot.docs.find(

      doc =>

        doc.id !== payerId

    );

  if (duplicateName) {

    throw new Error(

      "Ya existe un pagador con ese nombre."

    );

  }

  /* ----------------------------------------
     DUPLICATE EMAIL
  ---------------------------------------- */

  if (data.email?.trim()) {

    const emailSnapshot = await getDocs(

      query(

        collection(

          db,

          "companies",

          companyId,

          "payers"

        ),

        where(

          "email",

          "==",

          data.email

            .trim()

            .toLowerCase()

        )

      )

    );

    const duplicateEmail =

      emailSnapshot.docs.find(

        doc =>

          doc.id !== payerId

      );

    if (duplicateEmail) {

      throw new Error(

        "Ya existe un pagador con ese correo electrónico."

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

      "payers",

      payerId

    ),

    {

      name:

        normalizedName,

      payerType:

        data.payerType,

      phone:

        data.phone?.trim() || "",

      email:

        data.email?.trim().toLowerCase() || "",

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

export const togglePayerStatus = async (

  companyId,

  payerId,

  currentStatus

) => {

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "payers",

      payerId

    ),

    {

      isActive: !currentStatus,

      updatedAt: Timestamp.now()

    }

  );

};