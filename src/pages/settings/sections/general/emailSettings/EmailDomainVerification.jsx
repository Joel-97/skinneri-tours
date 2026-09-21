import {
  useState
} from "react";

import {
  createEmailDomain,
  getEmailDomainStatus,
  verifyEmailDomain
} from "../../../../../services/communication/emailDomainService";

import {
  notifySuccess,
  notifyError
} from "../../../../../services/notificationService";

const EmailDomainVerification = ({
  companyId,
  formData,
  onStateChange
}) => {
  const [domainLoading, setDomainLoading] =
    useState(false);

  const [verificationLoading, setVerificationLoading] =
    useState(false);

  const [showDnsRecords, setShowDnsRecords] =
    useState(false);

  /* ======================================================
     NORMALIZE DOMAIN RECORD
  ====================================================== */

  const normalizeDomainRecord = (
    record
  ) => {
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
  };

  /* ======================================================
     UPDATE DOMAIN STATE
  ====================================================== */

  const updateDomainState = (
    domainData
  ) => {
    onStateChange(
      domainData
    );
  };

  /* ======================================================
     CONFIGURE DOMAIN
  ====================================================== */

  const handleConfigureDomain = async () => {
    if (!formData.domain) {
      notifyError(
        "Dominio requerido",
        "No se pudo determinar el dominio del correo."
      );

      return;
    }

    if (!companyId) {
      notifyError(
        "Error",
        "No se pudo identificar la empresa."
      );

      return;
    }

    try {
      setDomainLoading(true);

      const result =
        await createEmailDomain(
          formData.domain
        );

      updateDomainState({
        domainStatus:
          result.status ||
          "pending",

        domainVerification: {
          resendDomainId:
            result.resendDomainId ||
            null,

          records:
            Array.isArray(
              result.records
            )
              ? result.records
                  .map(
                    normalizeDomainRecord
                  )
                  .filter(Boolean)
              : [],

          verifiedAt:
            result.status ===
            "verified"
              ? new Date()
              : null
        }
      });

      /*
       * Intentionally no refreshSession().
       *
       * The domain configuration is reflected
       * in the local form state. Rebuilding the
       * authentication session is unnecessary.
       */

      notifySuccess(
        "Dominio configurado",
        "El dominio fue registrado correctamente. Ahora debes configurar los registros DNS."
      );

      setShowDnsRecords(true);
    } catch (error) {
      console.error(
        "Error configurando dominio:",
        error
      );

      notifyError(
        "No se pudo configurar el dominio",
        error?.message ||
          "Ocurrió un error al registrar el dominio."
      );
    } finally {
      setDomainLoading(false);
    }
  };

  /* ======================================================
     REFRESH DOMAIN STATUS
  ====================================================== */

  const handleRefreshDomainStatus =
    async () => {
      try {
        setVerificationLoading(true);

        const result =
          await getEmailDomainStatus();

        const records =
          Array.isArray(
            result.records
          )
            ? result.records
                .map(
                  normalizeDomainRecord
                )
                .filter(Boolean)
            : (
                formData
                  .domainVerification
                  ?.records || []
              );

        const verifiedAt =
          result.status ===
          "verified"
            ? (
                formData
                  .domainVerification
                  ?.verifiedAt ||
                new Date()
              )
            : null;

        updateDomainState({
          domain:
            result.domain ||
            formData.domain,

          domainStatus:
            result.status ||
            formData.domainStatus,

          domainVerification: {
            ...formData.domainVerification,

            resendDomainId:
              result.resendDomainId ||
              formData
                .domainVerification
                ?.resendDomainId ||
              null,

            records,

            verifiedAt
          }
        });

        if (
          result.status ===
          "verified"
        ) {
          notifySuccess(
            "Dominio verificado",
            "El dominio está listo para enviar correos."
          );
        } else {
          notifyError(
            "Verificación pendiente",
            "El dominio todavía no ha sido verificado. Comprueba los registros DNS."
          );
        }
      } catch (error) {
        console.error(
          "Error consultando estado del dominio:",
          error
        );

        notifyError(
          "No se pudo consultar el dominio",
          error?.message ||
            "Ocurrió un error al consultar el estado."
        );
      } finally {
        setVerificationLoading(
          false
        );
      }
    };

  /* ======================================================
     VERIFY DOMAIN
  ====================================================== */

  const handleVerifyDomain = async () => {
    try {
      setVerificationLoading(true);

      const result =
        await verifyEmailDomain();

      /*
       * The Firebase Function response
       * is expected to have the service
       * result inside data.
       */

      const verificationData =
        result?.data ||
        result;

      /* ==================================================
         RECORDS
      ================================================== */

      const records =
        Array.isArray(
          verificationData?.records
        )
          ? verificationData.records
              .map(
                normalizeDomainRecord
              )
              .filter(Boolean)
          : (
              formData
                .domainVerification
                ?.records || []
            );

      /* ==================================================
         VERIFIED AT
      ================================================== */

      const verifiedAt =
        verificationData?.status ===
        "verified"
          ? (
              formData
                .domainVerification
                ?.verifiedAt ||
              new Date()
            )
          : null;

      /* ==================================================
         UPDATE LOCAL STATE
      ================================================== */

      updateDomainState({
        domainStatus:
          verificationData?.status ||
          formData.domainStatus,

        domainVerification: {
          ...formData.domainVerification,

          resendDomainId:
            verificationData?.resendDomainId ||
            formData
              .domainVerification
              ?.resendDomainId ||
            null,

          records,

          verifiedAt
        }
      });

      /* ==================================================
         RESULT
      ================================================== */

      if (
        verificationData?.status ===
        "verified"
      ) {
        notifySuccess(
          "Dominio verificado",
          "El dominio fue verificado correctamente y ya puede utilizarse para enviar correos."
        );
      } else {
        notifyError(
          "Verificación pendiente",
          "Resend todavía no ha podido verificar el dominio. Si acabas de agregar los DNS, espera unos minutos y vuelve a intentarlo."
        );
      }
    } catch (error) {
      console.error(
        "Error verificando dominio:",
        error
      );

      notifyError(
        "No se pudo verificar el dominio",
        error?.message ||
          "Ocurrió un error durante la verificación."
      );
    } finally {
      setVerificationLoading(
        false
      );
    }
  };

  /* ======================================================
     STATUS LABEL
  ====================================================== */

  const getDomainStatusLabel = () => {
    if (
      formData.sendingMode ===
      "platform"
    ) {
      return "No requiere verificación";
    }

    switch (
      formData.domainStatus
    ) {
      case "verified":
        return "Dominio verificado";

      case "pending":
        return "Verificación pendiente";

      case "not_started":
        return "Verificación pendiente";

      default:
        return "Pendiente de configuración";
    }
  };

  /* ======================================================
     STATUS CLASS
  ====================================================== */

  const getDomainStatusClass = () => {
    if (
      formData.sendingMode ===
      "platform"
    ) {
      return "email-settings-status--platform";
    }

    switch (
      formData.domainStatus
    ) {
      case "verified":
        return "email-settings-status--verified";

      case "pending":
      case "not_started":
        return "email-settings-status--pending";

      default:
        return "email-settings-status--unconfigured";
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <div className="email-settings-card">

      <div className="email-settings-card-header">

        <h4>
          Configuración de envío
        </h4>

        <p>
          Estado actual del método utilizado para enviar
          las comunicaciones de la empresa.
        </p>

      </div>

      <div className="email-settings-domain-status">

        {/* ==================================================
            STATUS
        ================================================== */}

        <div
          className={
            `email-settings-status ${
              getDomainStatusClass()
            }`
          }
        >

          <span className="email-settings-status-dot" />

          <span>
            {getDomainStatusLabel()}
          </span>

        </div>

        {/* ==================================================
            PLATFORM MODE
        ================================================== */}

        {formData.sendingMode ===
        "platform" ? (

          <>

            <div className="email-settings-domain-info">

              <span className="email-settings-domain-label">
                Método seleccionado
              </span>

              <strong>
                Skinneri
              </strong>

            </div>

            <div className="email-settings-verification-message">

              <strong>
                Envío simplificado
              </strong>

              <p>
                Esta empresa utiliza un correo personal
                o proveedor público. Skinneri utilizará
                un remitente de plataforma y las respuestas
                de los clientes llegarán al correo configurado.
              </p>

            </div>

          </>

        ) : (

          <>

            {/* ==================================================
                CUSTOM DOMAIN INFO
            ================================================== */}

            <div className="email-settings-domain-info">

              <span className="email-settings-domain-label">
                Dominio configurado
              </span>

              <strong>
                {formData.domain ||
                  "Sin configurar"}
              </strong>

            </div>

            {/* ==================================================
                UNCONFIGURED
            ================================================== */}

            {formData.domainStatus ===
            "unconfigured" ? (

              <>

                <div className="email-settings-verification-message">

                  <strong>
                    Verificación del dominio
                  </strong>

                  <p>
                    Para enviar directamente desde este dominio,
                    será necesario verificarlo mediante la configuración
                    de registros DNS.
                  </p>

                </div>

                <button
                  type="button"
                  className="email-settings-domain-action"
                  onClick={
                    handleConfigureDomain
                  }
                  disabled={
                    domainLoading
                  }
                >
                  {domainLoading
                    ? "Configurando..."
                    : "Configurar dominio"}
                </button>

              </>

            ) : null}

            {/* ==================================================
                PENDING / NOT STARTED
            ================================================== */}

            {(
              formData.domainStatus ===
                "pending" ||
              formData.domainStatus ===
                "not_started"
            ) ? (

              <>

                <div className="email-settings-verification-message">

                  <strong>
                    Verificación pendiente
                  </strong>

                  <p>
                    Agrega los registros DNS proporcionados
                    por Skinneri en el proveedor donde
                    administras tu dominio.
                  </p>

                </div>

                <div className="email-settings-domain-actions">

                  <button
                    type="button"
                    className="email-settings-domain-action"
                    onClick={() =>
                      setShowDnsRecords(
                        !showDnsRecords
                      )
                    }
                    disabled={
                      !formData
                        .domainVerification
                        ?.records
                        ?.length
                    }
                  >
                    {showDnsRecords
                      ? "Ocultar instrucciones"
                      : "Ver instrucciones de configuración"}
                  </button>

                  <button
                    type="button"
                    className="email-settings-domain-action email-settings-domain-action--secondary"
                    onClick={
                      handleVerifyDomain
                    }
                    disabled={
                      verificationLoading
                    }
                  >
                    {verificationLoading
                      ? "Verificando..."
                      : "Verificar dominio"}
                  </button>

                </div>

                {/* ==================================================
                    DNS RECORDS
                ================================================== */}

                {showDnsRecords &&
                formData
                  .domainVerification
                  ?.records
                  ?.length ? (

                  <div className="email-settings-dns-records">

                    <div className="email-settings-dns-header">

                      <strong>
                        Registros DNS
                      </strong>

                      <br />

                      <span>
                        Agrega estos registros en
                        el proveedor de tu dominio.
                      </span>

                    </div>

                    <div className="email-settings-dns-list">

                      {formData
                        .domainVerification
                        .records
                        .map(
                          (
                            record,
                            index
                          ) => (

                            <div
                              key={
                                `${record.record || "record"}-${
                                  record.name || "name"
                                }-${
                                  record.type || "type"
                                }-${index}`
                              }
                              className="email-settings-dns-record"
                            >

                              {/* ==================================================
                                  RECORD TYPE
                              ================================================== */}

                              <div className="email-settings-dns-field">

                                <span className="email-settings-dns-label">
                                  Tipo
                                </span>

                                <strong className="email-settings-dns-type-value">
                                  {record.type ||
                                    "—"}
                                </strong>

                              </div>

                              {/* ==================================================
                                  NAME
                              ================================================== */}

                              <div className="email-settings-dns-field">

                                <span className="email-settings-dns-label">
                                  Nombre
                                </span>

                                <div className="email-settings-dns-code">
                                  {record.name ||
                                    "—"}
                                </div>

                              </div>

                              {/* ==================================================
                                  VALUE
                              ================================================== */}

                              <div className="email-settings-dns-field email-settings-dns-value">

                                <span className="email-settings-dns-label">
                                  Valor
                                </span>

                                <div className="email-settings-dns-value-box">

                                  <code>
                                    {record.value ||
                                      "—"}
                                  </code>

                                </div>

                              </div>

                              {/* ==================================================
                                  PRIORITY
                              ================================================== */}

                              {
                                record.priority !==
                                  null &&
                                record.priority !==
                                  undefined ? (

                                  <div className="email-settings-dns-field">

                                    <span className="email-settings-dns-label">
                                      Prioridad
                                    </span>

                                    <strong>
                                      {
                                        record.priority
                                      }
                                    </strong>

                                  </div>

                                ) : null
                              }

                            </div>

                          )
                        )}

                    </div>

                  </div>

                ) : null}

              </>

            ) : null}

            {/* ==================================================
                VERIFIED
            ================================================== */}

            {formData.domainStatus ===
            "verified" ? (

              <div className="email-settings-verification-message">

                <strong>
                  Dominio verificado
                </strong>

                <p>
                  El dominio{" "}

                  <strong>
                    {formData.domain}
                  </strong>

                  {" "}está verificado y puede utilizarse
                  para enviar correos directamente desde{" "}

                  <strong>
                    {formData.fromEmail}
                  </strong>.
                </p>

              </div>

            ) : null}

          </>

        )}

      </div>

    </div>
  );
};

export default EmailDomainVerification;