import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import logoWord from '../assets/Flor_morada.png';
import Loading from "../components/general/loading"; 

import "../style/login.css";

const Login = () => {
  const navigate = useNavigate();

  const {
    loginAdmin,
    user,
    adminData,
    isSuperAdmin,
    loading
  } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (isSuperAdmin) {
      navigate("/superadmin", { replace: true });
      return;
    }

    if (!adminData) return;

    const status = adminData.status?.trim().toLowerCase();

    if (status === "pending") {
      navigate("/pending", { replace: true });
      return;
    }

    if (status === "approved") {
      navigate("/home", { replace: true });
      return;
    }

  }, [user, adminData, isSuperAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await loginAdmin(email, password);
    } catch (error) {
      console.error(error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return <div> <Loading /> </div>;
  }

  return (
  <div className="login-container">

    <div className="login-card">

      <div className="login-header">

        <img
          src={logoWord}
          alt="Skinneri Tours"
          className="login-logo"
        />

        <h2 className="login-title">Panel administrativo</h2>

        <p className="login-subtitle">
          Ingresa con tus credenciales
        </p>

      </div>

      <form onSubmit={handleSubmit} className="login-form">

        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
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
            className="login-input"
            required
          />
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={submitting}
        >
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

      </form>

      <div className="login-footer">

        <p className="login-text">
          ¿No tienes acceso?
        </p>

        <button
          onClick={() => navigate("/register")}
          className="login-secondary-button"
        >
          Solicitar acceso
        </button>

      </div>

    </div>

  </div>
  );
};

export default Login;
