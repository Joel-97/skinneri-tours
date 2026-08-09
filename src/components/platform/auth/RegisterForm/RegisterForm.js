/*
==========================================================
IMPORTS
==========================================================
*/

import { Link } from "react-router-dom";

import { useTranslation } from "../../../../hooks/useTranslation";

import useRegisterForm from "../../../../hooks/platform/forms/useRegisterForm";

import resolveErrorMessage from "../../../../utils/resolveErrorMessage";

import PLATFORM_ERROR_MESSAGES from "../../../../constants/errors/platformErrors";

import "./registerForm.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function RegisterForm() {

  const { t } = useTranslation();

  const {

    form,

    loading,

    success,

    error,

    handleChange,

    submit

  } = useRegisterForm();

  /*
  ==========================================================
  ERROR MESSAGE
  ==========================================================
  */

  const errorMessage = resolveErrorMessage(

    error,

    t,

    PLATFORM_ERROR_MESSAGES

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

    <section className="register-form-container">

      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="register-form-header">

        <h2 className="register-form-title">

          {t("auth.register.title")}

        </h2>

        <p className="register-form-subtitle">

          {t("auth.register.subtitle")}

        </p>

      </header>

      {/* ==================================================
          SUCCESS
      =================================================== */}

      {

        success && (

          <div
            className="register-form-success"
            role="status"
            aria-live="polite"
          >

            <div className="register-form-success-icon">

              ✓

            </div>

            <div className="register-form-success-content">

              <div className="register-form-success-title">

                {t("auth.messages.success")}

              </div>

              <div className="register-form-success-message">

                {t("auth.register.requestSubmitted")}

              </div>

            </div>

          </div>

        )

      }

      {/* ==================================================
          ERROR
      =================================================== */}

      {

        error && (

          <div
            className="register-form-error"
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

        className="register-form-fields"

        onSubmit={handleSubmit}

        noValidate

      >

        {/* ==================================================
            NAME
        =================================================== */}

        <div className="register-form-group">

          <label
            htmlFor="displayName"
            className="register-form-label"
          >

            {t("auth.register.displayName")}

          </label>

          <input

            id="displayName"

            name="displayName"

            type="text"

            autoComplete="name"

            required

            value={form.displayName}

            onChange={handleChange}

            className="register-form-input"

          />

        </div>

        {/* ==================================================
            EMAIL
        =================================================== */}

        <div className="register-form-group">

          <label
            htmlFor="email"
            className="register-form-label"
          >

            {t("auth.register.email")}

          </label>

          <input

            id="email"

            name="email"

            type="email"

            autoComplete="email"

            required

            value={form.email}

            onChange={handleChange}

            className="register-form-input"

          />

        </div>

        {/* ==================================================
            INFORMATION
        =================================================== */}

        <div className="register-form-information">

          <p className="register-form-information-text">

            {t("auth.register.approvalInformation")}

          </p>

        </div>

        {/* ==================================================
            ACTIONS
        =================================================== */}

        <div className="register-form-actions">

          <button

            type="submit"

            disabled={loading}

            className="register-form-submit-button"

          >

            {

              loading

                ? t("auth.messages.loading")

                : t("auth.register.submit")

            }

          </button>

        </div>

      </form>

      {/* ==================================================
          FOOTER
      =================================================== */}

      <footer className="register-form-footer">

        <span className="register-form-footer-text">

          {t("auth.register.alreadyAccount")}

        </span>

        <Link

          to="/login"

          className="register-form-footer-link"

        >

          {t("auth.register.login")}

        </Link>

      </footer>

    </section>

  );

}