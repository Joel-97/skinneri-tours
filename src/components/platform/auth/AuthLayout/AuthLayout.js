/*
==========================================================
IMPORTS
==========================================================
*/

import { useTranslation } from "../../../../hooks/useTranslation";

import logo from "../../../../assets/Flor_morada.png";

import "./authLayout.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AuthLayout({ children }) {

  const { t } = useTranslation();

  return (

    <section className="auth-layout-container">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="auth-layout-background">

        {/* ======================================================
            BRANDING
        ====================================================== */}

        <div className="auth-layout-branding">

          <div className="auth-layout-branding-content">

            <div className="auth-layout-logo-container">

              <img
                src={logo}
                alt={t("auth.layout.title")}
                className="auth-layout-logo-image"
              />

            </div>

            <h1 className="auth-layout-title">

              {t("auth.layout.title")}

            </h1>

            <p className="auth-layout-description">

              {t("auth.layout.description")}

            </p>

            <span className="auth-layout-version">

              {t("auth.layout.version")}

            </span>

          </div>

        </div>

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <div className="auth-layout-content">

          <div className="auth-layout-card">

            {children}

          </div>

        </div>

      </div>

    </section>

  );

}