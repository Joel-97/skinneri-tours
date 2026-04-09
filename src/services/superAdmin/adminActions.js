import { db } from "../../firebase";
import { doc, updateDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { server } from '../serverName/Server';

// -------------------- CREAR EMPRESA --------------------
export const createCompany = async (companyName) => {
  try {
    const newCompanyRef = await addDoc(collection(db, "companies"), {
      name: companyName,
      createdAt: new Date()
    });

    return { id: newCompanyRef.id, name: companyName };
  } catch (error) {
    console.error("Error creando empresa:", error);
    throw error;
  }
};

// -------------------- APROBAR ADMIN --------------------
export const approveAdmin = async (adminId, companyId = null, companyName = null) => {
  try {
    let assignedCompanyId = companyId;

    // Si no hay companyId, creamos una empresa nueva
    if (!assignedCompanyId) {
      if (!companyName) throw new Error("No se proporcionó nombre de empresa");
      const newCompany = await createCompany(companyName);
      assignedCompanyId = newCompany.id;
    }

    // Actualizar el admin
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, {
      status: "approved",
      companyId: assignedCompanyId
    });

    return assignedCompanyId; // opcional, para usarlo en la UI
  } catch (error) {
    console.error("Error aprobando admin:", error);
    throw error;
  }
};

// -------------------- RECHAZAR ADMIN --------------------
export const rejectAdmin = async (adminId) => {
  try {
    const adminRef = doc(db, "admins", adminId);
    await updateDoc(adminRef, { status: "rejected" });
  } catch (error) {
    console.error("Error rechazando admin:", error);
    throw error;
  }
};

// -------------------- ACTUALIZAR ADMIN --------------------
export const updateAdminData = async (adminId, data) => {
  const adminRef = doc(db, "admins", adminId);
  await updateDoc(adminRef, data);
};

// -------------------- DESHABILITAR ADMIN --------------------
export const disableAdmin = async (adminId) => {
  const adminRef = doc(db, "admins", adminId);

  await updateDoc(adminRef, {
    status: "disabled"
  });
};

// -------------------- HABILITAR ADMIN --------------------
export const enableAdmin = async (adminId) => {
  const adminRef = doc(db, "admins", adminId);

  await updateDoc(adminRef, {
    status: "approved"
  });
};

// -------------------- MOVER (CAMBIAR) DE EMPRESA ADMIN --------------------
export const changeAdminCompany = async (adminId, companyId) => {
  const adminRef = doc(db, "admins", adminId);

  await updateDoc(adminRef, {
    companyId
  });
};

// -------------------- CAMBIAR EL ROL DEL USUARIO EN LA EMPRESA --------------------
export const changeAdminRole = async (adminId, role) => {
  const adminRef = doc(db, "admins", adminId);

  await updateDoc(adminRef, {
    role
  });
};