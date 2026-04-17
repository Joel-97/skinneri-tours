import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import Loading from "../components/general/loading";
import logoWord from '../assets/Flor_morada.png';
import { notifySuccess, notifyError } from "../services/notificationService";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

import "../style/register.css";

const Register = () => {
  const navigate = useNavigate();
  const { registerAdmin, user, loading } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // 👁️ toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ⚠️ errores
  const [errors, setErrors] = useState({});

  /* =========================
     PASSWORD STRENGTH
  ========================== */

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabel = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"][strength];

  /* =========================
     VALIDACIÓN EN TIEMPO REAL
  ========================== */

  useEffect(() => {
    const newErrors = {};

    if (!companyName.trim()) newErrors.companyName = true;

    if (!email.includes("@")) newErrors.email = true;

    if (password.length < 6) newErrors.password = true;

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = true;
    }

    setErrors(newErrors);
  }, [email, password, confirmPassword, companyName]);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      return notifyError("Error", "Revisa los campos antes de continuar");
    }

    setSubmitting(true);

    try {
      await registerAdmin(email, password, companyName);

      // notifySuccess(
      //   "Solicitud enviada",
      //   "Tu solicitud será revisada por un administrador"
      // );

      navigate("/login");

    } catch (error) {
      notifyError("Error", error.message || "No se pudo registrar");
    } finally {
      setSubmitting(false);
    }
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
              className={`register-input ${errors.companyName ? "input-error" : companyName ? "input-valid" : ""}`}
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`register-input ${errors.email ? "input-error" : email ? "input-valid" : ""}`}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label>Contraseña</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`register-input ${errors.password ? "input-error" : password ? "input-valid" : ""}`}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            {/* 💪 indicador */}
            {password && (
              <div className="password-strength">
                <div className={`strength-bar strength-${strength}`}></div>
                <span>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label>Confirmar contraseña</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`register-input ${errors.confirmPassword ? "input-error" : confirmPassword ? "input-valid" : ""}`}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(prev => !prev)}
              >
                {showConfirmPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>

            {/* ⚠️ mensaje de error */}
            {errors.confirmPassword && confirmPassword && (
              <span className="input-error-text">
                Las contraseñas no coinciden
              </span>
            )}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={submitting || Object.keys(errors).length > 0}
          >
            {submitting ? "Enviando..." : "Solicitar acceso"}
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