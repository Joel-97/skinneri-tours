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
   GET MAINTENANCE
================================= */

export const getMaintenance = async (
  companyId
) => {

  const snapshot = await getDocs(

    collection(

      db,

      "companies",

      companyId,

      "maintenance"

    )

  );

  return snapshot.docs.map(doc => ({

    id: doc.id,

    ...doc.data()

  }));

};

/* ===============================
   CREATE MAINTENANCE
================================= */

export const createMaintenance = async (

  companyId,

  data,

  user,

  options = {}

) => {

  const {

    force = false

  } = options;

  /* -----------------------------
     LAST MILEAGE
  ----------------------------- */

  const snapshot = await getDocs(

    query(

      collection(

        db,

        "companies",

        companyId,

        "maintenance"

      ),

      where(

        "vehicle.id",

        "==",

        data.vehicle.id

      )

    )

  );

  let highestMileage = 0;

  snapshot.forEach(doc => {

    const mileage =

      Number(

        doc.data().mileage

      ) || 0;

    if (

      mileage >

      highestMileage

    ) {

      highestMileage = mileage;

    }

  });

  /* -----------------------------
     VALIDATION
  ----------------------------- */

  const currentMileage =

    Number(data.mileage) || 0;

  if (

    !force &&

    highestMileage > 0 &&

    currentMileage < highestMileage

  ) {

    const error = new Error(

      "El kilometraje ingresado es menor que el último registrado para este vehículo."

    );

    error.code = "LOWER_MILEAGE";

    error.highestMileage = highestMileage;

    throw error;

  }

  /* -----------------------------
     CREATE
  ----------------------------- */

  return await addDoc(

    collection(

      db,

      "companies",

      companyId,

      "maintenance"

    ),

    {

      vehicle: {

        id: data.vehicle.id,

        plate: data.vehicle.plate,

        name: data.vehicle.name

      },

      category: {

        value: data.category.value,

        label: data.category.label

      },

      area: {

        value: data.area.value,

        label: data.area.label

      },

      date: data.date,

      mileage:

        currentMileage || null,

      nextMileage:

        Number(

          data.nextMileage

        ) || null,

      provider:

        data.provider?.trim() || "",

      cost:

        Number(

          data.cost

        ) || 0,

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
   UPDATE MAINTENANCE
================================= */

export const updateMaintenance = async (

  companyId,

  maintenanceId,

  data,

  user,

  options = {}

) => {

  const {

    force = false

  } = options;

  /* -----------------------------
     LAST MILEAGE
  ----------------------------- */

  const snapshot = await getDocs(

    query(

      collection(

        db,

        "companies",

        companyId,

        "maintenance"

      ),

      where(

        "vehicle.id",

        "==",

        data.vehicle.id

      )

    )

  );

  let highestMileage = 0;

  snapshot.forEach(doc => {

    if (

      doc.id ===

      maintenanceId

    ) return;

    const mileage =

      Number(

        doc.data().mileage

      ) || 0;

    if (

      mileage >

      highestMileage

    ) {

      highestMileage = mileage;

    }

  });

  /* -----------------------------
     VALIDATION
  ----------------------------- */

  const currentMileage =

    Number(data.mileage) || 0;

  if (

    !force &&

    highestMileage > 0 &&

    currentMileage < highestMileage

  ) {

    const error = new Error(

      "El kilometraje ingresado es menor que el último registrado para este vehículo."

    );

    error.code = "LOWER_MILEAGE";

    error.highestMileage = highestMileage;

    throw error;

  }

  /* -----------------------------
     UPDATE
  ----------------------------- */

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "maintenance",

      maintenanceId

    ),

    {

      vehicle: {

        id: data.vehicle.id,

        plate: data.vehicle.plate,

        name: data.vehicle.name

      },

      category: {

        value: data.category.value,

        label: data.category.label

      },

      area: {

        value: data.area.value,

        label: data.area.label

      },

      date: data.date,

      mileage:

        currentMileage || null,

      nextMileage:

        Number(

          data.nextMileage

        ) || null,

      provider:

        data.provider?.trim() || "",

      cost:

        Number(

          data.cost

        ) || 0,

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

export const toggleMaintenanceStatus = async (

  companyId,

  maintenanceId,

  currentStatus

) => {

  return await updateDoc(

    doc(

      db,

      "companies",

      companyId,

      "maintenance",

      maintenanceId

    ),

    {

      isActive: !currentStatus,

      updatedAt: Timestamp.now()

    }

  );

};

/* ===============================
   DELETE MAINTENANCE
================================= */

export const deleteMaintenance = async (

  companyId,

  maintenanceId

) => {

  return await deleteDoc(

    doc(

      db,

      "companies",

      companyId,

      "maintenance",

      maintenanceId

    )

  );

};