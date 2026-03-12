import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import logoWord from "../assets/Flor_morada.png";
import "../style/pending.css";

import { UserAuth } from "../context/AuthContext";

const Pending = () => {

  const { logout } = UserAuth();
  const navigate = useNavigate();

  const [seconds, setSeconds] = useState(12);

  const handleLogout = async () => {

    try {

      await logout();

      navigate("/login");

    } catch (error) {

      console.error("Error al cerrar sesión:", error);

    }

  };

  /* contador regresivo */

  useEffect(() => {

    const interval = setInterval(() => {

      setSeconds(prev => prev - 1);

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  /* logout automático */

  useEffect(() => {

    if (seconds <= 0) {

      handleLogout();

    }

  }, [seconds]);

  return (

    <div className="pending-container">

      <div className="pending-card">

        <div className="pending-header">

          <img
            src={logoWord}
            alt="Sistema"
            className="pending-logo"
          />

        </div>

        <h2 className="pending-title">
          Cuenta en revisión ⏳
        </h2>

        <p className="pending-text">
          <br />
          Un administrador debe aprobar tu acceso y asignarte una empresa.
        </p>

        <div className="pending-info">

          <p>
            Recibirás acceso automáticamente una vez aprobada tu solicitud.
          </p>

        </div>

        <p className="pending-redirect">

          Serás redirigido al inicio de sesión en <strong>{seconds}</strong> segundos.

        </p>

        <button
          className="pending-button"
          onClick={handleLogout}
        >
          Aceptar
        </button>

      </div>

    </div>

  );

};

export default Pending;