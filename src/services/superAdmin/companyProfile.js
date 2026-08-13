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
  // ====================================================
  // GENERAL
  // ====================================================

  name: "",
  legalName: "",

  identificationType: "",
  identificationNumber: "",

  email: "",
  phone: "",
  website: "",

  // ====================================================
  // ADDRESS
  // ====================================================

  address: "",
  city: "",
  province: "",
  country: "",
  postalCode: "",

  // ====================================================
  // SYSTEM
  // ====================================================

  defaultCurrencyId: "",

  timezone: "",

  primaryColor: "#0A1E5E",

  logoURL: "",

  // ====================================================
  // EMAIL SETTINGS
  // ====================================================

  emailSettings: {
    enabled: false,

    fromName: "",
    fromEmail: "",
    replyTo: "",

    domain: "",
    domainStatus: "not_started",

    sendingMode: "platform",

    domainVerification: {
      resendDomainId: null,
      records: [],
      verifiedAt: null
    }
  },

  // ====================================================
  // SUBSCRIPTION
  // ====================================================

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

      // -----------------------------------------------
      // Preserve nested emailSettings defaults
      // -----------------------------------------------

      emailSettings: {
        ...DEFAULT_COMPANY_DATA.emailSettings,
        ...(data.emailSettings || {}),

        domainVerification: {
          ...DEFAULT_COMPANY_DATA.emailSettings.domainVerification,
          ...(data.emailSettings?.domainVerification || {})
        }
      },

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
//
// Mantiene compatibilidad con todos los lugares que ya
// utilizan updateCompanyData().
//
// Si se actualiza emailSettings, sus propiedades se
// escriben individualmente mediante Field Paths para
// evitar reemplazar accidentalmente todo el objeto.
// ======================================================

export const updateCompanyData = async (
  companyId,
  data = {}
) => {
  try {
    if (!companyId) {
      throw new Error("companyId es requerido");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Los datos de la empresa deben ser un objeto");
    }

    const companyRef = doc(
      db,
      "companies",
      companyId
    );

    const updateData = {
      updatedAt: serverTimestamp()
    };

    // ==================================================
    // NORMAL COMPANY FIELDS
    // ==================================================

    Object.entries(data).forEach(([key, value]) => {
      if (key !== "emailSettings") {
        updateData[key] = value;
      }
    });

    // ==================================================
    // EMAIL SETTINGS
    // ==================================================
    //
    // We use Firestore field paths:
    //
    // emailSettings.enabled
    // emailSettings.fromName
    // emailSettings.domain
    // etc.
    //
    // This prevents replacing the complete emailSettings
    // object when only one property changes.
    // ==================================================

    if (
      data.emailSettings &&
      typeof data.emailSettings === "object"
    ) {
      Object.entries(data.emailSettings).forEach(
        ([key, value]) => {
          // --------------------------------------------
          // Nested domainVerification
          // --------------------------------------------

          if (
            key === "domainVerification" &&
            value &&
            typeof value === "object"
          ) {
            Object.entries(value).forEach(
              ([verificationKey, verificationValue]) => {
                updateData[
                  `emailSettings.domainVerification.${verificationKey}`
                ] = verificationValue;
              }
            );

            return;
          }

          // --------------------------------------------
          // Normal emailSettings property
          // --------------------------------------------

          updateData[`emailSettings.${key}`] = value;
        }
      );
    }

    // ==================================================
    // UPDATE FIRESTORE
    // ==================================================

    await updateDoc(
      companyRef,
      updateData
    );

    return true;
  } catch (error) {
    console.error("Error updating company");

    throw error;
  }
};

// ======================================================
// UPDATE EMAIL SETTINGS
// ======================================================
//
// Dedicated helper for the communication settings.
//
// This does NOT replace updateCompanyData().
// Existing code can continue using updateCompanyData()
// without breaking.
// ======================================================

export const updateEmailSettings = async (
  companyId,
  emailSettings = {}
) => {
  try {
    if (!companyId) {
      throw new Error("companyId es requerido");
    }

    if (
      !emailSettings ||
      typeof emailSettings !== "object"
    ) {
      throw new Error(
        "emailSettings debe ser un objeto"
      );
    }

    const companyRef = doc(
      db,
      "companies",
      companyId
    );


    const updateData = {
      updatedAt: serverTimestamp()
    };

    // ==================================================
    // EMAIL SETTINGS
    // ==================================================

    Object.entries(emailSettings).forEach(
      ([key, value]) => {
        // --------------------------------------------
        // Nested domainVerification
        // --------------------------------------------

        if (
          key === "domainVerification" &&
          value &&
          typeof value === "object"
        ) {
          Object.entries(value).forEach(
            ([verificationKey, verificationValue]) => {
              updateData[
                `emailSettings.domainVerification.${verificationKey}`
              ] = verificationValue;
            }
          );

          return;
        }

        // --------------------------------------------
        // Normal property
        // --------------------------------------------

        updateData[`emailSettings.${key}`] = value;
      }
    );

    // ==================================================
    // SAVE
    // ==================================================

    await updateDoc(
      companyRef,
      updateData
    );

    return true;
  } catch (error) {
    console.error("Error updating email settings");

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
        throw new Error(
          "Company name is required"
        );
      }

      const newCompany = await createCompany(
        companyData
      );

      assignedCompanyId = newCompany.id;
    }

    // ==================================================
    // UPDATE ADMIN
    // ==================================================

    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      status: "approved",
      companyId: assignedCompanyId,
      updatedAt: serverTimestamp()
    });

    return assignedCompanyId;
  } catch (error) {
    console.error(
      "Error aprobando admin:",
      error
    );

    throw error;
  }
};

// ======================================================
// REJECT ADMIN
// ======================================================

export const rejectAdmin = async (
  adminId
) => {
  try {
    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      status: "rejected",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error rechazando admin:",
      error
    );

    throw error;
  }
};

// ======================================================
// UPDATE ADMIN DATA
// ======================================================

export const updateAdminData = async (
  adminId,
  data = {}
) => {
  try {
    if (!adminId) {
      throw new Error(
        "adminId es requerido"
      );
    }

    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error actualizando admin:",
      error
    );

    throw error;
  }
};

// ======================================================
// DISABLE ADMIN
// ======================================================

export const disableAdmin = async (
  adminId
) => {
  try {
    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      status: "disabled",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error deshabilitando admin:",
      error
    );

    throw error;
  }
};

// ======================================================
// ENABLE ADMIN
// ======================================================

export const enableAdmin = async (
  adminId
) => {
  try {
    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      status: "approved",
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error habilitando admin:",
      error
    );

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
    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      companyId,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error cambiando empresa del admin:",
      error
    );

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
    const adminRef = doc(
      db,
      "admins",
      adminId
    );

    await updateDoc(adminRef, {
      role,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(
      "Error cambiando rol del admin:",
      error
    );

    throw error;
  }
};