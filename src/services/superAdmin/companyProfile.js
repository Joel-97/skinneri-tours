import { db } from "../../firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// ======================================================
// DEFAULT COMPANY DATA
// ======================================================

const DEFAULT_COMPANY_DATA = {
  // ======================================================
  // GENERAL
  // ======================================================

  name: "",
  legalName: "",

  identificationType: "",
  identificationNumber: "",

  email: "",
  phone: "",
  website: "",

  // ======================================================
  // ADDRESS
  // ======================================================

  address: "",
  city: "",
  province: "",
  country: "",
  postalCode: "",

  // ======================================================
  // SYSTEM
  // ======================================================

  defaultCurrencyId: "",

  timezone: "",

  primaryColor: "#0A1E5E",

  logoURL: "",

  // ======================================================
  // SUBSCRIPTION
  // ======================================================

  subscriptionPlan: "trial",

  isActive: true
};

// ======================================================
// CREATE COMPANY
// ======================================================

export const createCompany = async (data = {}) => {
  try {
    const companyData = {
      ...DEFAULT_COMPANY_DATA,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const newCompanyRef = await addDoc(
      collection(db, "companies"),
      companyData
    );

    return {
      id: newCompanyRef.id,
      ...companyData
    };

  } catch (error) {
    console.error("Error creando empresa:", error);
    throw error;
  }
};

// ======================================================
// UPDATE COMPANY DATA
// ======================================================

export const updateCompanyData = async (
  companyId,
  data
) => {
  try {
    const companyRef = doc(db, "companies", companyId);

    await updateDoc(companyRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error actualizando empresa:", error);
    throw error;
  }
};

// ======================================================
// APPROVE ADMIN
// ======================================================

export const approveAdmin = async ({
  adminId,
  companyId = null,
  companyData = null
}) => {
  try {
    let assignedCompanyId = companyId;

    // ==================================================
    // CREATE COMPANY IF DOES NOT EXIST
    // ==================================================

    if (!assignedCompanyId) {
      if (!companyData?.name) {
        throw new Error("Company name is required");
      }

      const newCompany = await createCompany(companyData);

      assignedCompanyId = newCompany.id;
    }

    // ==================================================
    // UPDATE ADMIN
    // ==================================================

    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      status: "approved",
      companyId: assignedCompanyId,
      updatedAt: serverTimestamp()
    });

    return assignedCompanyId;

  } catch (error) {
    console.error("Error aprobando admin:", error);
    throw error;
  }
};

// ======================================================
// REJECT ADMIN
// ======================================================

export const rejectAdmin = async (adminId) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      status: "rejected",
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error rechazando admin:", error);
    throw error;
  }
};

// ======================================================
// UPDATE ADMIN DATA
// ======================================================

export const updateAdminData = async (adminId, data) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error actualizando admin:", error);
    throw error;
  }
};

// ======================================================
// DISABLE ADMIN
// ======================================================

export const disableAdmin = async (adminId) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      status: "disabled",
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error deshabilitando admin:", error);
    throw error;
  }
};

// ======================================================
// ENABLE ADMIN
// ======================================================

export const enableAdmin = async (adminId) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      status: "approved",
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error habilitando admin:", error);
    throw error;
  }
};

// ======================================================
// CHANGE ADMIN COMPANY
// ======================================================

export const changeAdminCompany = async (
  adminId,
  companyId
) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      companyId,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error cambiando empresa del admin:", error);
    throw error;
  }
};

// ======================================================
// CHANGE ADMIN ROLE
// ======================================================

export const changeAdminRole = async (
  adminId,
  role
) => {
  try {
    const adminRef = doc(db, "admins", adminId);

    await updateDoc(adminRef, {
      role,
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    console.error("Error cambiando rol del admin:", error);
    throw error;
  }
};