import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import Loading from "../components/general/loading"; 
import "../style/register.css";

const Register = () => {
  const navigate = useNavigate();
  const { registerAdmin, user, loading } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    await registerAdmin(email, password);
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
        <h2 className="register-title">Solicitud de acceso Admin</h2>

        <form onSubmit={handleSubmit} className="register-form">

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="register-input"
            required
          />

          <button type="submit" className="register-button">
            Solicitar acceso
          </button>

        </form>

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
  );
};

export default Register;
