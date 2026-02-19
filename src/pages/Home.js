import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import "../style/home.css";
import Swal from "sweetalert2";
import Pending from "./Pending";
import Loading from "../components/general/loading"; 

const Home = () => {
  const navigate = useNavigate();

  const { user, adminData, companyId, isSuperAdmin, loading } = UserAuth();
  const [errorMessage, setErrorMessage] = useState(null);

  /* 🔐 SEGURIDAD DE ACCESO */
  useEffect(() => {
    if (loading) return;

    // no autenticado
    if (!user) {
      navigate("/signin");
      return;
    }

    // superadmin no debería entrar al home normal
    if (isSuperAdmin) {
      navigate("/superadmin");
      return;
    }

    // admin pending
    if (adminData?.status === "pending") {
      navigate("/pending");
      return;
    }

    // admin sin empresa asignada
    // if (!companyId) {
    //   Swal.fire({
    //     icon: "warning",
    //     title: "Sin aprobación",
    //     text: "Tu cuenta aún no se encuentra aprobada.",
    //   });
    //   return;
    // }

  }, [user, adminData, companyId, isSuperAdmin, loading, navigate]);

  /* mensajes guardados */
  useEffect(() => {
    const errorMessageFromStorage = localStorage.getItem("errorMessage");

    if (errorMessageFromStorage) {
      setErrorMessage(errorMessageFromStorage);
      localStorage.removeItem("errorMessage");
    }
  }, []);

  useEffect(() => {
    if (errorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Warning!",
        text: errorMessage,
        confirmButtonColor: "#173d38",
        confirmButtonText: "OK",
      });
    }
  }, [errorMessage]);

  if (loading) {
    return <div> <Loading /> </div>;
  }

  return (
    <div className="dialog">
      <Pending></Pending>
    </div>
  );
};

export default Home;
