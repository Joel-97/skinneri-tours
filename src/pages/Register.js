import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import Loading from "../components/general/loading";
import logoWord from '../assets/Flor_morada.png';
import { notifySuccess, notifyError } from "../services/notificationService";

import "../style/register.css";

const Register = () => {
  const navigate = useNavigate();
  const { registerAdmin, user, loading } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!companyName.trim()) {
      notifyError("Error", "Debes ingresar el nombre de la empresa");
      return;
    }

    if (password !== confirmPassword) {
      notifyError("Error","Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    await registerAdmin(email, password, companyName);

    // notifySuccess(
    //   "Solicitud enviada",
    //   "Tu solicitud será revisada por un administrador"
    // );

    navigate("/login");
  };
  

  if (loading) {
    return (
      <div className="section-loading">
        <Loading />
      </div>
    );
  }

  return (
<div className="register-container">

  <div className="register-card">

    <div className="register-header">

      <img
        src={logoWord}
        alt="Skinneri Tours"
        className="register-logo"
      />

      <h2 className="register-title">
        Solicitud de acceso
      </h2>

      <p className="register-subtitle">
        Crea una cuenta para solicitar acceso al panel
      </p>

    </div>

    <form onSubmit={handleSubmit} className="register-form">

      <div className="form-group">
        <label>Nombre de la empresa</label>
        <input
          type="text"
          placeholder="Nombre de la empresa"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="register-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="register-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Confirmar contraseña</label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="register-input"
          required
        />
      </div>

      <button
        type="submit"
        className="register-button"
      >
        Solicitar acceso
      </button>

    </form>

    <div className="register-footer">

      <p className="register-text">
        Tu cuenta será revisada por un administrador antes de activarse.
      </p>

      <button
        onClick={() => navigate("/login")}
        className="register-secondary-button"
      >
        Volver al login
      </button>

    </div>

  </div>

</div>
  );
};

export default Register;