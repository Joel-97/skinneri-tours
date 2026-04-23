import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../../firebase";

/* ===============================
   GET COMMISSION AGENTS
================================= */

export const getCommissionAgents = async (companyId) => {

  const snapshot = await getDocs(
    collection(db, "companies", companyId, "commissionAgents")
  );

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};


/* ===============================
   CREATE COMMISSION AGENT
================================= */

export const createCommissionAgent = async (companyId, data, user) => {

  const cleanData = {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",

    // 🔥 tipo de agente
    type: data.type || "person", // person | agency

    // 🔥 comisión (nuevo modelo)
    commissionType: data.commissionType || "percentage", // percentage | fixed
    commissionValue: Number(data.commissionValue || 0),

    // 🔥 estado
    isActive: data.isActive ?? true
  };

  return await addDoc(
    collection(db, "companies", companyId, "commissionAgents"),
    {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      updatedBy: user.uid
    }
  );
};


/* ===============================
   UPDATE COMMISSION AGENT
================================= */

export const updateCommissionAgent = async (companyId, agentId, data, user) => {

  const cleanData = {
    name: data.name || "",
    phone: data.phone || "",
    email: data.email || "",

    // 🔥 tipo de agente
    type: data.type || "person",

    // 🔥 comisión (corregido)
    commissionType: data.commissionType || "percentage",
    commissionValue: Number(data.commissionValue || 0),

    // 🔥 estado
    isActive: data.isActive ?? true
  };

  return await updateDoc(
    doc(db, "companies", companyId, "commissionAgents", agentId),
    {
      ...cleanData,
      updatedAt: Timestamp.now(),
      updatedBy: user.uid
    }
  );
};


/* ===============================
   TOGGLE STATUS
================================= */

export const toggleCommissionAgentStatus = async (companyId, agentId, currentStatus) => {

  return await updateDoc(
    doc(db, "companies", companyId, "commissionAgents", agentId),
    {
      isActive: !currentStatus,
      updatedAt: Timestamp.now()
    }
  );
};