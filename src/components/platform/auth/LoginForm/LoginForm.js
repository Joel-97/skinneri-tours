/*
==========================================================
IMPORTS
==========================================================
*/

import { Link } from "react-router-dom";

import { useTranslation } from "../../../../hooks/useTranslation";

import useLoginForm from "../../../../hooks/platform/forms/useLoginForm";

import resolveErrorMessage from "../../../../utils/resolveErrorMessage";

import AUTH_ERROR_MESSAGES from "../../../../constants/errors/authErrorMessages";

import "./loginForm.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function LoginForm() {

  const { t } = useTranslation();

  const {

    form,

    loading,

    error,

    handleChange,

    submit

  } = useLoginForm();

  /*
  ==========================================================
  ERROR MESSAGE
  ==========================================================
  */

  const errorMessage = resolveErrorMessage(

    error,

    t,

    AUTH_ERROR_MESSAGES

  );

  /*
  ==========================================================
  SUBMIT
  ==========================================================
  */

  async function handleSubmit(event) {

    event.preventDefault();

    await submit();

  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <section className="login-form-container">

      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="login-form-header">

        <h2 className="login-form-title">

          {t("auth.login.title")}

        </h2>

        <p className="login-form-subtitle">

          {t("auth.login.subtitle")}

        </p>

      </header>

      {/* ==================================================
          ERROR
      =================================================== */}

      {

        error && (

          <div

            className="login-form-error"

            role="alert"

            aria-live="polite"

          >

            {errorMessage}

          </div>

        )

      }

      {/* ==================================================
          FORM
      =================================================== */}

      <form

        className="login-form-fields"

        onSubmit={handleSubmit}

        noValidate

      >

        {/* ==============================================
            EMAIL
        =============================================== */}

        <div className="login-form-group">

          <label

            htmlFor="email"

            className="login-form-label"

          >

            {t("auth.login.email")}

          </label>

          <input

            id="email"

            name="email"

            type="email"

            autoComplete="email"

            required

            value={form.email}

            onChange={handleChange}

            className="login-form-input"

          />

        </div>

        {/* ==============================================
            PASSWORD
        =============================================== */}

        <div className="login-form-group">

          <label

            htmlFor="password"

            className="login-form-label"

          >

            {t("auth.login.password")}

          </label>

          <input

            id="password"

            name="password"

            type="password"

            autoComplete="current-password"

            required

            value={form.password}

            onChange={handleChange}

            className="login-form-input"

          />

        </div>

        {/* ==============================================
            FORGOT PASSWORD
        =============================================== */}

        {/* <div className="login-form-forgot-password">

          <Link

            to="/forgot-password"

            className="login-form-forgot-password-link"

          >

            {t("auth.login.forgotPassword")}

          </Link>

        </div> */}

        {/* ==============================================
            ACTIONS
        =============================================== */}

        <div className="login-form-actions">

          <button

            type="submit"

            disabled={loading}

            className="login-form-submit-button"

          >

            {

              loading

                ? t("auth.messages.loading")

                : t("auth.login.submit")

            }

          </button>

        </div>

      </form>

      {/* ==================================================
          FOOTER
      =================================================== */}

      <footer className="login-form-footer">

        <span className="login-form-footer-text">

          {t("auth.login.noAccount")}

        </span>

        <Link

          to="/register"

          className="login-form-footer-link"

        >

          {t("auth.login.register")

          }

        </Link>

      </footer>

    </section>

  );

}