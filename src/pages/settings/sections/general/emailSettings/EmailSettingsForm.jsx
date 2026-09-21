import {
  useEffect,
  useState
} from "react";

import {
  updateEmailSettings
} from "../../../../../services/superAdmin/companyProfile";

import {
  notifySuccess,
  notifyError
} from "../../../../../services/notificationService";

import EmailDomainVerification from "./EmailDomainVerification";

const DEFAULT_EMAIL_SETTINGS = {
  enabled: true,
  sendingMode: "platform",
  fromName: "",
  fromEmail: "",
  replyTo: "",
  domain: "",
  domainStatus: "unconfigured",
  domainVerification: {
    resendDomainId: null,
    records: [],
    verifiedAt: null
  }
};

const PUBLIC_EMAIL_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.ca",
  "yahoo.co.uk",
  "yahoo.es",
  "yahoo.com.mx",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "gmx.net",
  "mail.com"
]);

/* ======================================================
   HELPERS
====================================================== */

export function extractDomain(email) {
  if (
    !email ||
    !email.includes("@")
  ) {
    return "";
  }

  return email
    .split("@")[1]
    .trim()
    .toLowerCase();
}

function determineSendingMode(email) {
  const domain =
    extractDomain(email);

  if (!domain) {
    return "platform";
  }

  if (
    PUBLIC_EMAIL_PROVIDERS.has(
      domain
    )
  ) {
    return "platform";
  }

  return "custom_domain";
}

/* ======================================================
   NORMALIZE DOMAIN RECORD
====================================================== */

export function normalizeDomainRecord(
  record
) {
  if (!record) {
    return null;
  }

  return {
    record:
      record.record || null,

    name:
      record.name || null,

    type:
      record.type || null,

    value:
      record.value || null,

    ttl:
      record.ttl || null,

    priority:
      record.priority ?? null,

    status:
      record.status || "not_started"
  };
}

/* ======================================================
   COMPONENT
====================================================== */

const EmailSettingsForm = ({
  company
}) => {
  const companyId =
    company?.id;

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState(
      DEFAULT_EMAIL_SETTINGS
    );

  /* ======================================================
     LOAD COMPANY DATA
  ====================================================== */

  useEffect(() => {
    if (!company) {
      return;
    }

    const existingSettings =
      company.emailSettings || {};

    const fromEmail =
      existingSettings.fromEmail ||
      company.email ||
      "";

    const domain =
      existingSettings.domain ||
      extractDomain(fromEmail);

    /* ====================================================
       EXISTING SENDING MODE
    ==================================================== */

    let sendingMode =
      existingSettings.sendingMode;

    /*
     * Backward compatibility
     */
    if (!sendingMode) {
      if (
        existingSettings.domainStatus ===
        "verified"
      ) {
        sendingMode =
          "custom_domain";
      } else {
        sendingMode =
          determineSendingMode(
            fromEmail
          );
      }
    }

    /* ====================================================
       DOMAIN VERIFICATION
    ==================================================== */

    const domainVerification =
      existingSettings.domainVerification || {
        resendDomainId: null,
        records: [],
        verifiedAt: null
      };

    /* ====================================================
       FORM DATA
    ==================================================== */

    setFormData({
      enabled:
        existingSettings.enabled !==
        undefined
          ? existingSettings.enabled
          : true,

      sendingMode,

      fromName:
        existingSettings.fromName ||
        company.name ||
        "",

      fromEmail,

      replyTo:
        existingSettings.replyTo ||
        fromEmail,

      domain,

      domainStatus:
        existingSettings.domainStatus ||
        (
          sendingMode === "platform"
            ? "not_required"
            : "unconfigured"
        ),

      domainVerification
    });
  }, [company]);

  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value
      };

      /* ==================================================
         FROM EMAIL
      ================================================== */

      if (
        name === "fromEmail"
      ) {
        const domain =
          extractDomain(value);

        next.domain =
          domain;

        next.sendingMode =
          determineSendingMode(
            value
          );

        /* ================================================
           RESET DOMAIN CONFIGURATION
           WHEN DOMAIN CHANGES
        ================================================ */

        if (
          next.sendingMode ===
          "custom_domain"
        ) {
          if (
            domain !==
            prev.domain
          ) {
            next.domainStatus =
              "unconfigured";

            next.domainVerification = {
              resendDomainId: null,
              records: [],
              verifiedAt: null
            };
          }
        } else {
          next.domainStatus =
            "not_required";

          next.domainVerification = {
            resendDomainId: null,
            records: [],
            verifiedAt: null
          };
        }
      }

      return next;
    });
  };

  /* ======================================================
     HANDLE ENABLE
  ====================================================== */

  const handleEnabledChange = () => {
    setFormData((prev) => ({
      ...prev,
      enabled:
        !prev.enabled
    }));
  };

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {
    if (
      !formData.fromName.trim()
    ) {
      notifyError(
        "Información incompleta",
        "Debes indicar el nombre del remitente."
      );

      return false;
    }

    if (
      !formData.fromEmail.trim()
    ) {
      notifyError(
        "Información incompleta",
        "Debes indicar el correo de la empresa."
      );

      return false;
    }

    if (
      !formData.fromEmail.includes("@")
    ) {
      notifyError(
        "Correo inválido",
        "El correo de la empresa no tiene un formato válido."
      );

      return false;
    }

    if (
      !formData.replyTo.trim()
    ) {
      notifyError(
        "Información incompleta",
        "Debes indicar el correo de respuesta."
      );

      return false;
    }

    if (
      !formData.replyTo.includes("@")
    ) {
      notifyError(
        "Correo inválido",
        "El correo de respuesta no tiene un formato válido."
      );

      return false;
    }

    if (
      formData.sendingMode ===
      "custom_domain"
    ) {
      if (!formData.domain) {
        notifyError(
          "Dominio requerido",
          "No se pudo determinar el dominio del correo de envío."
        );

        return false;
      }
    }

    return true;
  };

  /* ======================================================
     BUILD EMAIL SETTINGS
  ====================================================== */

  const buildEmailSettings = () => {
    return {
      enabled:
        formData.enabled,

      sendingMode:
        formData.sendingMode,

      fromName:
        formData.fromName.trim(),

      fromEmail:
        formData.fromEmail.trim(),

      replyTo:
        formData.replyTo.trim(),

      domain:
        extractDomain(
          formData.fromEmail
        ),

      domainStatus:
        formData.sendingMode ===
        "platform"
          ? "not_required"
          : formData.domainStatus,

      domainVerification:
        formData.sendingMode ===
        "platform"
          ? {
              resendDomainId: null,
              records: [],
              verifiedAt: null
            }
          : formData.domainVerification
    };
  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async () => {
    if (!companyId) {
      notifyError(
        "Error",
        "No se pudo identificar la empresa."
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const emailSettings =
        buildEmailSettings();

      await updateEmailSettings(
        companyId,
        emailSettings
      );

      /*
       * No refreshSession().
       *
       * The company data is already saved
       * in Firestore. Refreshing the complete
       * authentication session can cause the
       * user to be redirected to login.
       */

      notifySuccess(
        "Configuración actualizada",
        "La configuración de correo fue guardada correctamente."
      );
    } catch (error) {
      console.error(
        "Error actualizando configuración de correo:",
        error
      );

      notifyError(
        "Error",
        "No se pudo actualizar la configuración de correo."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     DOMAIN STATE UPDATE
  ====================================================== */

  const handleDomainStateChange = (
    domainData
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...domainData
    }));
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="email-settings-container">

      {/* ==================================================
          PAGE INTRO
      ================================================== */}

      <div className="email-settings-intro">

        <div className="email-settings-intro-content">

          <h3>
            Configuración de correo
          </h3>

          <p>
            Define la identidad que utilizará la empresa
            para enviar comunicaciones a los clientes.
          </p>

        </div>

      </div>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="email-settings-header">

        <div className="email-settings-header-info">

          <div className="email-settings-header-icon">
            @
          </div>

          <div>

            <h3>
              {formData.fromName ||
                company?.name ||
                "Empresa"}
            </h3>

            <span>
              Configuración de comunicaciones
            </span>

          </div>

        </div>

        <button
          type="button"
          className="email-settings-save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? "Guardando..."
            : "Guardar cambios"}
        </button>

      </div>

      {/* ==================================================
          MAIN GRID
      ================================================== */}

      <div className="email-settings-main-grid">

        {/* ==================================================
            SENDER CARD
        ================================================== */}

        <div className="email-settings-card">

          <div className="email-settings-card-header">

            <h4>
              Remitente
            </h4>

            <p>
              Estos datos aparecerán como identidad del
              remitente en los correos enviados a los clientes.
            </p>

          </div>

          <div className="email-settings-form-grid">

            {/* ==================================================
                ENABLE
            ================================================== */}

            <div className="email-settings-form-group email-settings-full-width">

              <label>
                Estado del envío
              </label>

              <button
                type="button"
                className={
                  formData.enabled
                    ? "email-settings-toggle email-settings-toggle--active"
                    : "email-settings-toggle"
                }
                onClick={
                  handleEnabledChange
                }
              >

                <span className="email-settings-toggle-indicator" />

                <span>
                  {formData.enabled
                    ? "Envío de correos habilitado"
                    : "Envío de correos deshabilitado"}
                </span>

              </button>

            </div>

            {/* ==================================================
                FROM NAME
            ================================================== */}

            <div className="email-settings-form-group">

              <label>
                Nombre del remitente
              </label>

              <input
                type="text"
                name="fromName"
                value={
                  formData.fromName
                }
                onChange={
                  handleChange
                }
                placeholder="Nombre de la empresa"
              />

              <span className="email-settings-help-text">
                Es el nombre que verá el cliente al recibir el correo.
              </span>

            </div>

            {/* ==================================================
                FROM EMAIL
            ================================================== */}

            <div className="email-settings-form-group">

              <label>
                Correo de la empresa
              </label>

              <input
                type="email"
                name="fromEmail"
                value={
                  formData.fromEmail
                }
                onChange={
                  handleChange
                }
                placeholder="info@empresa.com"
              />

              <span className="email-settings-help-text">
                Puede ser un correo corporativo o una cuenta como Gmail,
                Outlook o Yahoo.
              </span>

            </div>

            {/* ==================================================
                REPLY TO
            ================================================== */}

            <div className="email-settings-form-group">

              <label>
                Correo de respuesta
              </label>

              <input
                type="email"
                name="replyTo"
                value={
                  formData.replyTo
                }
                onChange={
                  handleChange
                }
                placeholder="reservas@empresa.com"
              />

              <span className="email-settings-help-text">
                Las respuestas de los clientes llegarán a esta dirección.
              </span>

            </div>

            {/* ==================================================
                SENDING MODE
            ================================================== */}

            <div className="email-settings-form-group">

              <label>
                Método de envío
              </label>

              <div className="email-settings-sending-mode">

                {formData.sendingMode ===
                "platform" ? (

                  <div className="email-settings-mode-card">

                    <strong>
                      Envío mediante Skinneri
                    </strong>

                    <span>
                      Recomendado para Gmail, Outlook,
                      Yahoo y otros correos personales.
                    </span>

                  </div>

                ) : (

                  <div className="email-settings-mode-card">

                    <strong>
                      Envío desde dominio propio.
                    </strong>

                    <br />

                    <span>
                      Requiere verificar el dominio mediante
                      DNS antes de enviar.
                    </span>

                  </div>

                )}

              </div>

            </div>

            {/* ==================================================
                DOMAIN
            ================================================== */}

            <div className="email-settings-form-group">

              <label>
                Dominio
              </label>

              <input
                type="text"
                value={
                  formData.domain ||
                  "—"
                }
                readOnly
              />

              <span className="email-settings-help-text">
                Se obtiene automáticamente del correo de la empresa.
              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            DOMAIN VERIFICATION
        ================================================== */}

        <EmailDomainVerification
          companyId={companyId}
          formData={formData}
          onStateChange={
            handleDomainStateChange
          }
        />

      </div>

    </div>
  );
};

export default EmailSettingsForm;