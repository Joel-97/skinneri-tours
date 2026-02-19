import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
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
    return (
      <div className="login-loading">
        Verificando sesión...
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="login-text">
          ¿No tienes acceso? Solicita registro.
        </p>

        <button
          onClick={() => navigate("/register")}
          className="login-secondary-button"
        >
          Solicitar acceso admin
        </button>
      </div>
    </div>
  );
};

export default Login;
