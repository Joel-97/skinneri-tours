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

/* ===============================
   GET COMMISSIONS
   (opcionalmente filtradas por rango)
================================= */

export const getCommissions = async (companyId, filters = {}) => {
  try {
    const ref = collection(db, "companies", companyId, "commissions");

    let q = ref;

    // 🔎 Filtros opcionales
    if (filters.startDate && filters.endDate) {
      q = query(
        ref,
        where("bookingDate", ">=", filters.startDate),
        where("bookingDate", "<=", filters.endDate),
        orderBy("bookingDate", "desc")
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (error) {
    console.error("Error getting commissions:", error);
    throw error;
  }
};


/* ===============================
   CREATE COMMISSION
================================= */

export const createCommission = async (companyId, data, user) => {
  try {
    const cleanData = {
      bookingId: data.bookingId,

      beneficiaryId: data.beneficiaryId,
      beneficiaryName: data.beneficiaryName,
      beneficiaryType: data.beneficiaryType || "agent",

      serviceTypeId: data.serviceTypeId,
      serviceTypeName: data.serviceTypeName,

      amount: Number(data.amount || 0),
      baseAmount: Number(data.baseAmount || 0),

      type: data.type || "percentage", // percentage | fixed
      value: Number(data.value || 0),

      status: "pending",
      paidAt: null,

      bookingDate: data.bookingDate || null,

      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid
    };

    return await addDoc(
      collection(db, "companies", companyId, "commissions"),
      cleanData
    );

  } catch (error) {
    console.error("Error creating commission:", error);
    throw error;
  }
};


/* ===============================
   UPDATE COMMISSION (opcional)
================================= */

export const updateCommission = async (companyId, commissionId, data, user) => {
  try {
    return await updateDoc(
      doc(db, "companies", companyId, "commissions", commissionId),
      {
        ...data,
        updatedAt: Timestamp.now(),
        updatedBy: user.uid
      }
    );
  } catch (error) {
    console.error("Error updating commission:", error);
    throw error;
  }
};


/* ===============================
   MARK AS PAID
================================= */

export const markCommissionAsPaid = async (companyId, commissionId, user) => {
  try {
    return await updateDoc(
      doc(db, "companies", companyId, "commissions", commissionId),
      {
        status: "paid",
        paidAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        updatedBy: user.uid
      }
    );
  } catch (error) {
    console.error("Error marking commission as paid:", error);
    throw error;
  }
};


/* ===============================
   MARK AS PENDING (rollback)
================================= */

export const markCommissionAsPending = async (companyId, commissionId, user) => {
  try {
    return await updateDoc(
      doc(db, "companies", companyId, "commissions", commissionId),
      {
        status: "pending",
        paidAt: null,
        updatedAt: Timestamp.now(),
        updatedBy: user.uid
      }
    );
  } catch (error) {
    console.error("Error reverting commission:", error);
    throw error;
  }
};


/* ===============================
   DELETE COMMISSION (opcional)
================================= */

export const deleteCommission = async (companyId, commissionId) => {
  try {
    return await updateDoc(
      doc(db, "companies", companyId, "commissions", commissionId),
      {
        isDeleted: true,
        updatedAt: Timestamp.now()
      }
    );
  } catch (error) {
    console.error("Error deleting commission:", error);
    throw error;
  }
};

/* ===============================
   OBTIENE LAS RESERVAS POR BOOKING ID
================================= */

export const getCommissionByBooking = async (companyId, bookingId) => {

  const ref = collection(db, "companies", companyId, "commissions");

  const q = query(ref, where("bookingId", "==", bookingId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};