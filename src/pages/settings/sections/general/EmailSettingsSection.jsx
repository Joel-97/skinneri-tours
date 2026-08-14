import {
    useEffect,
    useState
} from "react";

import {
    useAuth
} from "../../../../context/AuthContext";

import {
    updateEmailSettings
} from "../../../../services/superAdmin/companyProfile";

import {
    createEmailDomain,
    getEmailDomainStatus,
    verifyEmailDomain
} from "../../../../services/communication/emailDomainService";

import {
    notifySuccess,
    notifyError
} from "../../../../services/notificationService";

import "../../../../style/settings/general/emailSettings.css";


/*
==========================================================
DEFAULT EMAIL SETTINGS
==========================================================
*/

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


/*
==========================================================
PUBLIC EMAIL PROVIDERS
==========================================================
*/

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


/*
==========================================================
HELPERS
==========================================================
*/

function extractDomain(
    email
) {

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


/*
==========================================================
DETERMINE SENDING MODE
==========================================================
*/

function determineSendingMode(
    email
) {

    const domain =

        extractDomain(

            email

        );


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


/*
==========================================================
NORMALIZE DOMAIN RECORD
==========================================================
*/

function normalizeDomainRecord(
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


/*
==========================================================
COMPONENT
==========================================================
*/

const EmailSettingsSection = () => {

    /*
    ========================================================
    AUTH
    ========================================================
    */

    const {

        session,

        refreshSession

    } = useAuth();


    const company =

        session?.company;


    const companyId =

        company?.id;


    /*
    ========================================================
    STATE
    ========================================================
    */

    const [

        loading,

        setLoading

    ] = useState(false);


    const [

        domainLoading,

        setDomainLoading

    ] = useState(false);


    const [

        verificationLoading,

        setVerificationLoading

    ] = useState(false);


    const [

        showDnsRecords,

        setShowDnsRecords

    ] = useState(false);


    const [

        formData,

        setFormData

    ] = useState(

        DEFAULT_EMAIL_SETTINGS

    );


    /*
    ========================================================
    LOAD COMPANY DATA
    ========================================================
    */

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

            extractDomain(

                fromEmail

            );


        /*
        ====================================================
        EXISTING SENDING MODE
        ====================================================
        */

        let sendingMode =

            existingSettings.sendingMode;


        /*
        ----------------------------------------------------
        BACKWARD COMPATIBILITY
        ----------------------------------------------------
        */

        if (!sendingMode) {

            if (

                existingSettings.domainStatus ===

                "verified"

            ) {

                sendingMode =

                    "custom_domain";

            }

            else {

                sendingMode =

                    determineSendingMode(

                        fromEmail

                    );

            }

        }


        /*
        ====================================================
        DOMAIN VERIFICATION
        ====================================================
        */

        const domainVerification =

            existingSettings.domainVerification || {

                resendDomainId: null,

                records: [],

                verifiedAt: null

            };


        /*
        ====================================================
        FORM DATA
        ====================================================
        */

        setFormData({

            enabled:

                existingSettings.enabled !== undefined

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


    /*
    ========================================================
    HANDLE CHANGE
    ========================================================
    */

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


            /*
            ====================================================
            FROM EMAIL
            ====================================================
            */

            if (

                name === "fromEmail"

            ) {

                const domain =

                    extractDomain(

                        value

                    );


                next.domain =

                    domain;


                next.sendingMode =

                    determineSendingMode(

                        value

                    );


                /*
                ------------------------------------------------
                RESET DOMAIN CONFIGURATION WHEN DOMAIN CHANGES
                ------------------------------------------------
                */

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

                }

                else {

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


    /*
    ========================================================
    HANDLE ENABLE
    ========================================================
    */

    const handleEnabledChange = () => {

        setFormData((prev) => ({

            ...prev,

            enabled:

                !prev.enabled

        }));

    };


    /*
    ========================================================
    VALIDATION
    ========================================================
    */

    const validateForm = () => {

        /*
        ======================================================
        FROM NAME
        ======================================================
        */

        if (

            !formData.fromName.trim()

        ) {

            notifyError(

                "Información incompleta",

                "Debes indicar el nombre del remitente."

            );

            return false;

        }


        /*
        ======================================================
        FROM EMAIL
        ======================================================
        */

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


        /*
        ======================================================
        REPLY TO
        ======================================================
        */

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


        /*
        ======================================================
        CUSTOM DOMAIN
        ======================================================
        */

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


    /*
    ========================================================
    BUILD EMAIL SETTINGS
    ========================================================
    */

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


    /*
    ========================================================
    SAVE
    ========================================================
    */

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


            /*
            ====================================================
            SAVE COMPANY
            ====================================================
            */

            await updateEmailSettings(

                companyId,

                emailSettings

            );


            /*
            ====================================================
            REFRESH SESSION
            ====================================================
            */

            await refreshSession(

                session.user

            );


            /*
            ====================================================
            SUCCESS
            ====================================================
            */

            notifySuccess(

                "Configuración actualizada",

                "La configuración de correo fue guardada correctamente."

            );

        }

        catch (error) {

            console.error(

                "Error actualizando configuración de correo:",

                error

            );


            notifyError(

                "Error",

                "No se pudo actualizar la configuración de correo."

            );

        }

        finally {

            setLoading(false);

        }

    };


    /*
    ========================================================
    CREATE EMAIL DOMAIN
    ========================================================
    */

    const handleConfigureDomain = async () => {

        if (

            !formData.domain

        ) {

            notifyError(

                "Dominio requerido",

                "No se pudo determinar el dominio del correo."

            );

            return;

        }


        try {

            setDomainLoading(true);


            /*
            ==================================================
            CREATE DOMAIN
            ==================================================
            */

            const result =

                await createEmailDomain(

                    formData.domain

                );


            /*
            ==================================================
            UPDATE LOCAL STATE
            ==================================================
            */

            setFormData((prev) => ({

                ...prev,

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

            }));

            /*
            ==================================================
            REFRESH SESSION
            ==================================================
            */

            await refreshSession(

                session.user

            );


            /*
            ==================================================
            SUCCESS
            ==================================================
            */

            notifySuccess(

                "Dominio configurado",

                "El dominio fue registrado correctamente. Ahora debes configurar los registros DNS."

            );


            /*
            ==================================================
            SHOW DNS
            ==================================================
            */

            setShowDnsRecords(true);

        }

        catch (error) {

            console.error(

                "Error configurando dominio:",

                error

            );


            notifyError(

                "No se pudo configurar el dominio",

                error?.message ||

                "Ocurrió un error al registrar el dominio."

            );

        }

        finally {

            setDomainLoading(false);

        }

    };


    /*
    ========================================================
    REFRESH DOMAIN STATUS
    ========================================================
    */

    const handleRefreshDomainStatus = async () => {

        try {

            setVerificationLoading(true);


            const result =

                await getEmailDomainStatus();


            /*
            ==================================================
            UPDATE LOCAL STATE
            ==================================================
            */

            setFormData((prev) => ({

                ...prev,

                domain:

                    result.domain ||

                    prev.domain,

                domainStatus:

                    result.status ||

                    prev.domainStatus,

                domainVerification: {

                    ...prev.domainVerification,

                    resendDomainId:

                        result.resendDomainId ||

                        prev.domainVerification
                            ?.resendDomainId ||

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

                            : prev.domainVerification
                                ?.records ||

                            [],

                    verifiedAt:

                        result.status ===

                        "verified"

                            ? (

                                prev.domainVerification
                                    ?.verifiedAt ||

                                new Date()

                            )

                            : null

                }

            }));


            /*
            ==================================================
            RESULT
            ==================================================
            */

            if (

                result.status ===

                "verified"

            ) {

                notifySuccess(

                    "Dominio verificado",

                    "El dominio está listo para enviar correos."

                );

            }

            else {

                notifyError(

                    "Verificación pendiente",

                    "El dominio todavía no ha sido verificado. Comprueba los registros DNS."

                );

            }

        }

        catch (error) {

            console.error(

                "Error consultando estado del dominio:",

                error

            );


            notifyError(

                "No se pudo consultar el dominio",

                error?.message ||

                "Ocurrió un error al consultar el estado."

            );

        }

        finally {

            setVerificationLoading(false);

        }

    };


    /*
    ========================================================
    REQUEST DOMAIN VERIFICATION
    ========================================================
    */

    const handleVerifyDomain = async () => {

        try {

            setVerificationLoading(true);


            /*
            ==================================================
            VERIFY DOMAIN
            ==================================================
            */

            const result =

                await verifyEmailDomain();


            /*
            ==================================================
            NORMALIZE RESPONSE
            ==================================================
            
            The Firebase Function response is expected to
            have the service result inside `data`.
            */

            const verificationData =

                result?.data ||

                result;

            /*
            ==================================================
            UPDATE LOCAL STATE
            ==================================================
            */

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

                        formData.domainVerification
                            ?.records ||

                        []

                    );


            const verifiedAt =

                verificationData?.status ===

                "verified"

                    ? (

                        formData.domainVerification
                            ?.verifiedAt ||

                        new Date()

                    )

                    : null;


            setFormData((prev) => ({

                ...prev,

                domainStatus:

                    verificationData?.status ||

                    prev.domainStatus,

                domainVerification: {

                    ...prev.domainVerification,

                    resendDomainId:

                        verificationData?.resendDomainId ||

                        prev.domainVerification
                            ?.resendDomainId ||

                        null,

                    records,

                    verifiedAt

                }

            }));


            /*
            ==================================================
            RESULT
            ==================================================
            */

            if (

                verificationData?.status ===

                "verified"

            ) {

                notifySuccess(

                    "Dominio verificado",

                    "El dominio fue verificado correctamente y ya puede utilizarse para enviar correos."

                );

            }

            else {

                notifyError(

                    "Verificación pendiente",

                    "Resend todavía no ha podido verificar el dominio. Si acabas de agregar los DNS, espera unos minutos y vuelve a intentarlo."

                );

            }

        }

        catch (error) {

            console.error(

                "Error verificando dominio:",

                error

            );


            notifyError(

                "No se pudo verificar el dominio",

                error?.message ||

                "Ocurrió un error durante la verificación."

            );

        }

        finally {

            setVerificationLoading(false);

        }

    };


    /*
    ========================================================
    STATUS LABEL
    ========================================================
    */

    const getDomainStatusLabel = () => {

        /*
        ======================================================
        PLATFORM
        ======================================================
        */

        if (

            formData.sendingMode ===

            "platform"

        ) {

            return "No requiere verificación";

        }


        /*
        ======================================================
        CUSTOM DOMAIN
        ======================================================
        */

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


    /*
    ========================================================
    STATUS CLASS
    ========================================================
    */

    const getDomainStatusClass = () => {

        /*
        ======================================================
        PLATFORM
        ======================================================
        */

        if (

            formData.sendingMode ===

            "platform"

        ) {

            return "email-settings-status--platform";

        }


        /*
        ======================================================
        CUSTOM DOMAIN
        ======================================================
        */

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


    /********************************************************
     * RENDER
     ********************************************************/

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
                      className="email-settings-save-button"
                      onClick={handleSave}
                      disabled={loading}
                  >
                      {
                          loading
                              ? "Guardando..."
                              : "Guardar cambios"
                      }
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
                                  onClick={handleEnabledChange}
                              >

                                  <span
                                      className="email-settings-toggle-indicator"
                                  />

                                  <span>

                                      {
                                          formData.enabled
                                              ? "Envío de correos habilitado"
                                              : "Envío de correos deshabilitado"
                                      }

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
                                  value={formData.fromName}
                                  onChange={handleChange}
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
                                  value={formData.fromEmail}
                                  onChange={handleChange}
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
                                  value={formData.replyTo}
                                  onChange={handleChange}
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

                                  {
                                      formData.sendingMode === "platform"

                                          ? (

                                              <div className="email-settings-mode-card">

                                                  <strong>
                                                      Envío mediante Skinneri
                                                  </strong>

                                                  <span>
                                                      Recomendado para Gmail, Outlook,
                                                      Yahoo y otros correos personales.
                                                  </span>

                                              </div>

                                          )

                                          : (

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

                                          )
                                  }

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
                      DOMAIN STATUS
                  ================================================== */}

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

                              <span
                                  className="email-settings-status-dot"
                              />

                              <span>
                                  {getDomainStatusLabel()}
                              </span>

                          </div>


                          {/* ==================================================
                              PLATFORM MODE
                          ================================================== */}

                          {
                              formData.sendingMode === "platform"

                                  ? (

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

                                  )

                                  : (

                                      <>

                                          {/* ==================================================
                                              CUSTOM DOMAIN INFO
                                          ================================================== */}

                                          <div className="email-settings-domain-info">

                                              <span className="email-settings-domain-label">
                                                  Dominio configurado
                                              </span>

                                              <strong>
                                                  {
                                                      formData.domain ||
                                                      "Sin configurar"
                                                  }
                                              </strong>

                                          </div>


                                          {/* ==================================================
                                              UNCONFIGURED
                                          ================================================== */}

                                          {
                                              formData.domainStatus === "unconfigured"

                                                  ? (

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
                                                              onClick={handleConfigureDomain}
                                                              disabled={domainLoading}
                                                          >

                                                              {
                                                                  domainLoading
                                                                      ? "Configurando..."
                                                                      : "Configurar dominio"
                                                              }

                                                          </button>

                                                      </>

                                                  )

                                                  : null
                                          }


                                          {/* ==================================================
                                              PENDING / NOT STARTED
                                          ================================================== */}

                                          {
                                              (
                                                  formData.domainStatus === "pending" ||
                                                  formData.domainStatus === "not_started"
                                              )

                                                  ? (

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
                                                                      !formData.domainVerification
                                                                          ?.records
                                                                          ?.length
                                                                  }
                                                              >

                                                                  {
                                                                      showDnsRecords
                                                                          ? "Ocultar instrucciones"
                                                                          : "Ver instrucciones de configuración"
                                                                  }

                                                              </button>


                                                              <button
                                                                  type="button"
                                                                  className="email-settings-domain-action email-settings-domain-action--secondary"
                                                                  onClick={handleVerifyDomain}
                                                                  disabled={verificationLoading}
                                                              >

                                                                  {
                                                                      verificationLoading
                                                                          ? "Verificando..."
                                                                          : "Verificar dominio"
                                                                  }

                                                              </button>

                                                          </div>


                                                          {/* ==================================================
                                                              DNS RECORDS
                                                          ================================================== */}

                                                          {
                                                              showDnsRecords &&
                                                              formData.domainVerification
                                                                  ?.records
                                                                  ?.length

                                                                  ? (

                                                                      <div className="email-settings-dns-records">

                                                                          <div className="email-settings-dns-header">

                                                                              <strong>
                                                                                  Registros DNS
                                                                              </strong>
                                                                              <br/>

                                                                              <span>
                                                                                  Agrega estos registros en
                                                                                  el proveedor de tu dominio.
                                                                              </span>

                                                                          </div>


                                                                          <div className="email-settings-dns-list">

                                                                              {
                                                                                  formData.domainVerification.records.map(
                                                                                      (record, index) => (

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
                                                                                                      {record.type || "—"}
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
                                                                                                      {record.name || "—"}
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
                                                                                                          {record.value || "—"}
                                                                                                      </code>

                                                                                                  </div>

                                                                                              </div>


                                                                                              {/* ==================================================
                                                                                                  PRIORITY
                                                                                              ================================================== */}

                                                                                              {
                                                                                                  record.priority !== null &&
                                                                                                  record.priority !== undefined

                                                                                                      ? (

                                                                                                          <div className="email-settings-dns-field">

                                                                                                              <span className="email-settings-dns-label">
                                                                                                                  Prioridad
                                                                                                              </span>

                                                                                                              <strong>
                                                                                                                  {record.priority}
                                                                                                              </strong>

                                                                                                          </div>

                                                                                                      )

                                                                                                      : null
                                                                                              }

                                                                                          </div>

                                                                                      )
                                                                                  )
                                                                              }

                                                                          </div>

                                                                      </div>

                                                                  )

                                                                  : null
                                                          }

                                                      </>

                                                  )

                                                  : null
                                          }


                                          {/* ==================================================
                                              VERIFIED
                                          ================================================== */}

                                          {
                                              formData.domainStatus === "verified"

                                                  ? (

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

                                                  )

                                                  : null
                                          }

                                      </>

                                  )

                          }

                      </div>

                  </div>


              </div>

          </div>

      );

};


export default EmailSettingsSection;