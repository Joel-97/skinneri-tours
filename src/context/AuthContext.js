import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { server } from '../services/serverName/Server';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);
export const UserAuth = useAuth;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [company, setCompany] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      try {
        if (!firebaseUser) {
          setUser(null);
          setAdminData(null);
          setCompany(null);
          setCompanyId(null);
          setIsSuperAdmin(false);
          return;
        }

        setUser(firebaseUser);

        // ===== OBTENER ADMIN =====
        const adminRef = doc(db, "admins", firebaseUser.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          setAdminData(null);
          setCompany(null);
          setCompanyId(null);
          setIsSuperAdmin(false);
          return;
        }

        const admin = adminSnap.data();
        setAdminData(admin);

        // ===== SUPERADMIN =====
        const superAdmin =
          admin.role === "superadmin" ||
          firebaseUser.email === "gomez.joel.0709@gmail.com";

        setIsSuperAdmin(superAdmin);

        // ===== SI NO ESTÁ APROBADO =====
        if (admin.status !== "approved") {
          setCompany(null);
          setCompanyId(null);
          return;
        }

        // ===== CARGAR COMPANY =====
        if (admin.companyId) {
          setCompanyId(admin.companyId);

          const companyRef = doc(db, "companies", admin.companyId);
          const companySnap = await getDoc(companyRef);

          if (companySnap.exists()) {
            setCompany(companySnap.data());
          } else {
            setCompany(null);
          }
        } else {
          setCompany(null);
          setCompanyId(null);
        }

      } catch (error) {
        console.error("Error cargando admin:", error);
        setAdminData(null);
        setCompany(null);
        setCompanyId(null);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /* ================= LOGIN ================= */
  const loginAdmin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;

    } catch (error) {
      console.error("Error login:", error.code);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        Swal.fire({
          icon: "error",
          title: "Datos incorrectos",
          text: "Correo o contraseña inválidos"
        });

      } else if (error.code === "auth/too-many-requests") {
        Swal.fire({
          icon: "warning",
          title: "Demasiados intentos",
          text: "Intenta nuevamente en unos minutos"
        });

      } else {
        Swal.fire({
          icon: "error",
          title: "Error al iniciar sesión",
          text: "Ocurrió un problema inesperado"
        });
      }

      return null;
    }
  };

  /* ================= REGISTER ================= */
  const registerAdmin = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const newUser = userCredential.user;

      await setDoc(doc(db, "admins", newUser.uid), {
        email: newUser.email,
        role: "admin",
        status: "pending",
        companyId: null,
        createdAt: new Date()
      });

      // Swal.fire({
      //   icon: "success",
      //   title: "Solicitud enviada",
      //   text: "Tu cuenta está pendiente de aprobación"
      // });

      return true;

    } catch (error) {
      console.error("Error creando admin:", error.code);

      if (error.code === "auth/email-already-in-use") {
        Swal.fire({
          icon: "error",
          title: "Correo en uso",
          text: "Este correo ya está registrado"
        });

      } else if (error.code === "auth/weak-password") {
        Swal.fire({
          icon: "warning",
          title: "Contraseña débil",
          text: "Debe tener al menos 6 caracteres"
        });

      } else {
        Swal.fire({
          icon: "error",
          title: "Error al registrarse",
          text: "Intenta nuevamente"
        });
      }

      throw error;
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    adminData,
    company,
    companyId,
    isSuperAdmin,
    loading,
    loginAdmin,
    logout,
    registerAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
