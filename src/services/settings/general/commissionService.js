import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy
} from "firebase/firestore";

import { db } from "../../../firebase";


/* =========================================================
   COLLECTION
========================================================= */

const COMMISSIONS_COLLECTION =
  "commissions";


const getCommissionsCollection = (
  companyId
) =>
  collection(
    db,
    "companies",
    companyId,
    COMMISSIONS_COLLECTION
  );


const getCommissionDocument = (
  companyId,
  commissionId
) =>
  doc(
    db,
    "companies",
    companyId,
    COMMISSIONS_COLLECTION,
    commissionId
  );


/* =========================================================
   USER HELPERS
========================================================= */

const getUserId = (
  user
) =>
  user?.uid ||
  user?.id ||
  null;


const validateUser = (
  user
) => {
  const userId =
    getUserId(user);

  if (!userId) {
    const error =
      new Error(
        "Usuario no autenticado."
      );

    error.code =
      "user_required";

    throw error;
  }

  return userId;
};


/* =========================================================
   GET COMMISSIONS
========================================================= */

export const getCommissions = async (
  companyId,
  filters = {}
) => {
  try {
    const ref =
      getCommissionsCollection(
        companyId
      );

    let q = ref;

    if (
      filters.startDate &&
      filters.endDate
    ) {
      q = query(
        ref,
        where(
          "bookingDate",
          ">=",
          filters.startDate
        ),
        where(
          "bookingDate",
          "<=",
          filters.endDate
        ),
        orderBy(
          "bookingDate",
          "desc"
        )
      );
    }

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      commissionDoc => ({
        id:
          commissionDoc.id,

        ...commissionDoc.data()
      })
    );

  } catch (error) {
    console.error(
      "Error getting commissions:",
      error
    );

    throw error;
  }
};


/* =========================================================
   CREATE COMMISSION
========================================================= */

export const createCommission = async (
  companyId,
  data,
  user
) => {
  try {
    const userId =
      validateUser(user);

    const timestamp =
      Timestamp.now();

    const cleanData = {
      bookingId:
        data.bookingId,

      beneficiaryId:
        data.beneficiaryId,

      beneficiaryName:
        data.beneficiaryName,

      beneficiaryType:
        data.beneficiaryType ||
        "agent",

      serviceTypeId:
        data.serviceTypeId,

      serviceTypeName:
        data.serviceTypeName,

      amount:
        Number(
          data.amount || 0
        ),

      baseAmount:
        Number(
          data.baseAmount || 0
        ),

      type:
        data.type ||
        "percentage",

      value:
        Number(
          data.value || 0
        ),

      status:
        "pending",

      paidAt:
        null,

      bookingDate:
        data.bookingDate ||
        null,

      createdAt:
        timestamp,

      updatedAt:
        timestamp,

      createdBy:
        userId
    };

    return await addDoc(
      getCommissionsCollection(
        companyId
      ),
      cleanData
    );

  } catch (error) {
    console.error(
      "Error creating commission:",
      error
    );

    throw error;
  }
};


/* =========================================================
   UPDATE COMMISSION
========================================================= */

export const updateCommission = async (
  companyId,
  commissionId,
  data,
  user
) => {
  try {
    const userId =
      validateUser(user);

    return await updateDoc(
      getCommissionDocument(
        companyId,
        commissionId
      ),
      {
        ...data,

        updatedAt:
          Timestamp.now(),

        updatedBy:
          userId
      }
    );

  } catch (error) {
    console.error(
      "Error updating commission:",
      error
    );

    throw error;
  }
};


/* =========================================================
   MARK COMMISSION AS PAID
========================================================= */

export const markCommissionAsPaid = async (
  companyId,
  commissionId,
  user
) => {
  try {
    const userId =
      validateUser(user);

    return await updateDoc(
      getCommissionDocument(
        companyId,
        commissionId
      ),
      {
        status:
          "paid",

        paidAt:
          Timestamp.now(),

        updatedAt:
          Timestamp.now(),

        updatedBy:
          userId
      }
    );

  } catch (error) {
    console.error(
      "Error marking commission as paid:",
      error
    );

    throw error;
  }
};


/* =========================================================
   MARK COMMISSION AS PENDING
========================================================= */

export const markCommissionAsPending = async (
  companyId,
  commissionId,
  user
) => {
  try {
    const userId =
      validateUser(user);

    return await updateDoc(
      getCommissionDocument(
        companyId,
        commissionId
      ),
      {
        status:
          "pending",

        paidAt:
          null,

        updatedAt:
          Timestamp.now(),

        updatedBy:
          userId
      }
    );

  } catch (error) {
    console.error(
      "Error reverting commission:",
      error
    );

    throw error;
  }
};


/* =========================================================
   DELETE COMMISSION
========================================================= */

export const deleteCommission = async (
  companyId,
  commissionId
) => {
  try {
    return await updateDoc(
      getCommissionDocument(
        companyId,
        commissionId
      ),
      {
        isDeleted:
          true,

        updatedAt:
          Timestamp.now()
      }
    );

  } catch (error) {
    console.error(
      "Error deleting commission:",
      error
    );

    throw error;
  }
};


/* =========================================================
   GET COMMISSION BY BOOKING
========================================================= */

export const getCommissionByBooking = async (
  companyId,
  bookingId
) => {
  const ref =
    getCommissionsCollection(
      companyId
    );

  const q =
    query(
      ref,
      where(
        "bookingId",
        "==",
        bookingId
      )
    );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    commissionDoc => ({
      id:
        commissionDoc.id,

      ...commissionDoc.data()
    })
  );
};