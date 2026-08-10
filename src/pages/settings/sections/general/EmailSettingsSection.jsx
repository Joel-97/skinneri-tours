import { useEffect, useState } from "react";

import { useAuth } from "../../../../context/AuthContext";

import { updateCompanyData } from "../../../../services/superAdmin/companyProfileOld";

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

  fromName: "",

  fromEmail: "",

  replyTo: "",

  domain: "",

  domainStatus: "unconfigured"

};


/*
==========================================================
HELPERS
==========================================================
*/

function extractDomain(email) {

  if (!email || !email.includes("@")) {

    return "";

  }

  return email

    .split("@")[1]

    .trim()

    .toLowerCase();

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

  const company = session?.company;

  const companyId = company?.id;


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


    setFormData({

      enabled:

        existingSettings.enabled !== undefined

          ? existingSettings.enabled

          : true,

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

        "unconfigured"

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


    setFormData((prev) => ({

      ...prev,

      [name]: value,

      ...(

        name === "fromEmail"

          ? {

              domain:

                extractDomain(

                  value

                )

            }

          : {}

      )

    }));

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

    if (!formData.fromName.trim()) {

      notifyError(

        "Información incompleta",

        "Debes indicar el nombre del remitente."

      );

      return false;

    }


    if (!formData.fromEmail.trim()) {

      notifyError(

        "Información incompleta",

        "Debes indicar el correo de envío."

      );

      return false;

    }


    if (

      !formData.fromEmail.includes("@")

    ) {

      notifyError(

        "Correo inválido",

        "El correo de envío no tiene un formato válido."

      );

      return false;

    }


    if (!formData.replyTo.trim()) {

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


    return true;

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


      const emailSettings = {

        enabled:

          formData.enabled,

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

          formData.domainStatus ||

          "unconfigured"

      };


      await updateCompanyData(

        companyId,

        {

          emailSettings

        }

      );


      await refreshSession(session.user);


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
  STATUS LABEL
  ========================================================
  */

  const getDomainStatusLabel = () => {

    switch (

      formData.domainStatus

    ) {

      case "verified":

        return "Dominio verificado";

      case "pending":

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

    switch (

      formData.domainStatus

    ) {

      case "verified":

        return "email-settings-status--verified";

      case "pending":

        return "email-settings-status--pending";

      default:

        return "email-settings-status--unconfigured";

    }

  };


  /*
  ========================================================
  RENDER
  ========================================================
  */

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

                Correo de envío

              </label>

              <input

                type="email"

                name="fromEmail"

                value={formData.fromEmail}

                onChange={handleChange}

                placeholder="info@empresa.com"

              />

              <span className="email-settings-help-text">

                Este será el correo que aparecerá como remitente.

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

                Se obtiene automáticamente del correo de envío.

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

              Verificación del dominio

            </h4>

            <p>

              El dominio debe estar autorizado antes de
              poder enviar correos desde esa dirección.

            </p>

          </div>


          <div className="email-settings-domain-status">

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


            <div className="email-settings-verification-message">

              <strong>

                Importante

              </strong>

              <p>

                Para que Skinneri pueda enviar correos
                utilizando este dominio, será necesario
                verificarlo mediante la configuración de
                registros DNS.

              </p>

            </div>

          </div>

        </div>


      </div>

    </div>

  );

};


export default EmailSettingsSection;