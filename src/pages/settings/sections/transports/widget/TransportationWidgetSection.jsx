/*
==========================================================
TRANSPORTATION WIDGET SECTION
==========================================================
*/

import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Code,
  Copy,
  ExternalLink,
  Palette,
  RotateCcw,
  Save
} from "lucide-react";

import { useAuth }
  from "../../../../../context/AuthContext";

import {
  notifyConfirm,
  notifyError,
  notifySuccess
} from "../../../../../services/notificationService";

import {
  getTransportationIntegration
} from "../../../../../services/platform/transportationIntegrationService";

import {
  getTransportationWidgetConfiguration,
  updateTransportationWidgetAppearance
} from "../../../../../services/platform/transportationWidgetService";

import CatalogHeader
  from "../../../components/CatalogHeader";

import CatalogToolbar
  from "../../../components/CatalogToolbar";

import WidgetAppearanceEditor
  from "./components/appearanceEditor/WidgetAppearanceEditor";

import WidgetPreview
  from "./components/preview/WidgetPreview";

import {
  DEFAULT_APPEARANCE,
  DEFAULT_COMPANY_BRANDING
} from "./widgetConstants";

import "./transportationWidgetSection.css";


/*
==========================================================
COMPONENT
==========================================================
*/

const TransportationWidgetSection = () => {

  /*
  ========================================================
  CONTEXT
  ========================================================
  */

  const { session } =
    useAuth();

  const company =
    session?.company;

  const companyId =
    company?.id || "";


  /*
  ========================================================
  STATE
  ========================================================
  */

  const [
    widgetId,
    setWidgetId
  ] = useState("");

  const [
    appearance,
    setAppearance
  ] = useState({
    ...DEFAULT_APPEARANCE
  });

  const [
    companyBranding,
    setCompanyBranding
  ] = useState({
    ...DEFAULT_COMPANY_BRANDING
  });

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    resetting,
    setResetting
  ] = useState(false);


  /*
  ========================================================
  FETCH WIDGET CONFIGURATION
  ========================================================
  */

  const fetchWidgetConfiguration =
    useCallback(
      async () => {

        if (!companyId) {

          setLoading(false);

          return;

        }

        try {

          setLoading(true);


          /*
          --------------------------------------------------
          GET TRANSPORTATION INTEGRATION
          --------------------------------------------------
          */

          const integrationResult =
            await getTransportationIntegration(
              companyId
            );

          const integration =
            integrationResult?.data;

          const currentWidgetId =
            integration?.widgetId || "";


          /*
          --------------------------------------------------
          NO WIDGET
          --------------------------------------------------
          */

          if (!currentWidgetId) {

            setWidgetId("");

            setAppearance({
              ...DEFAULT_APPEARANCE
            });

            setCompanyBranding({

              ...DEFAULT_COMPANY_BRANDING,

              name:
                company?.name || "",

              logoURL:
                company?.logoURL || "",

              primaryColor:
                company?.primaryColor ||
                DEFAULT_COMPANY_BRANDING.primaryColor

            });

            return;

          }


          /*
          --------------------------------------------------
          SAVE WIDGET ID
          --------------------------------------------------
          */

          setWidgetId(
            currentWidgetId
          );


          /*
          --------------------------------------------------
          GET PUBLIC WIDGET CONFIGURATION
          --------------------------------------------------
          */

          const widgetResult =
            await getTransportationWidgetConfiguration(
              currentWidgetId
            );

          const widgetData =
            widgetResult?.data;

          const widgetAppearance =
            widgetData?.appearance || {};

          const widgetCompany =
            widgetData?.company || {};


          /*
          --------------------------------------------------
          COMPANY BRANDING
          
          Logo and primary color come from the company
          configuration.
          --------------------------------------------------
          */

          setCompanyBranding({

            ...DEFAULT_COMPANY_BRANDING,

            name:
              widgetCompany?.name ||
              company?.name ||
              "",

            logoURL:
              widgetCompany?.logoURL ||
              company?.logoURL ||
              "",

            primaryColor:
              widgetCompany?.primaryColor ||
              company?.primaryColor ||
              DEFAULT_COMPANY_BRANDING.primaryColor

          });


          /*
          --------------------------------------------------
          APPEARANCE
          --------------------------------------------------
          */

          setAppearance({

            ...DEFAULT_APPEARANCE,

            ...widgetAppearance

          });

        }

        catch (error) {

          console.error(
            "Unable to load transportation Widget configuration:",
            error
          );

          notifyError(
            error?.message ||
            "No fue posible cargar la configuración del Widget."
          );

        }

        finally {

          setLoading(false);

        }

      },
      [
        companyId,
        company?.name,
        company?.logoURL,
        company?.primaryColor
      ]
    );


  /*
  ========================================================
  LOAD
  ========================================================
  */

  useEffect(() => {

    fetchWidgetConfiguration();

  }, [
    fetchWidgetConfiguration
  ]);


  /*
  ========================================================
  HANDLE APPEARANCE CHANGE
  ========================================================
  */

  const handleAppearanceChange = (
    field,
    value
  ) => {

    setAppearance(
      current => ({

        ...current,

        [field]:
          value

      })
    );

  };


  /*
  ========================================================
  SAVE
  ========================================================
  */

  const handleSave = async () => {

    if (
      !widgetId ||
      saving ||
      resetting
    ) {

      return;

    }

    try {

      setSaving(true);


      /*
      --------------------------------------------------
      ONLY SAVE WIDGET-SPECIFIC APPEARANCE
      --------------------------------------------------
      */

      const appearanceToSave = {

        backgroundColor:
          appearance?.backgroundColor ||
          DEFAULT_APPEARANCE.backgroundColor,

        textColor:
          appearance?.textColor ||
          DEFAULT_APPEARANCE.textColor,

        fieldBackgroundColor:
          appearance?.fieldBackgroundColor ||
          DEFAULT_APPEARANCE.fieldBackgroundColor,

        borderRadius:
          Number(
            appearance?.borderRadius ??
            DEFAULT_APPEARANCE.borderRadius
          ),

        fontFamily:
          appearance?.fontFamily ||
          DEFAULT_APPEARANCE.fontFamily,

        buttonStyle:
          appearance?.buttonStyle ||
          DEFAULT_APPEARANCE.buttonStyle

      };


      await updateTransportationWidgetAppearance(

        widgetId,

        appearanceToSave

      );


      /*
      --------------------------------------------------
      SUCCESS
      --------------------------------------------------
      */

      notifySuccess(
        "Configuración guardada",
        "La apariencia del Widget fue actualizada correctamente."
      );

    }

    catch (error) {

      console.error(
        "Unable to save transportation Widget appearance:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible guardar la configuración del Widget."
      );

    }

    finally {

      setSaving(false);

    }

  };


  /*
  ========================================================
  RESET DEFAULTS
  ========================================================
  */

  const handleReset = async () => {

    if (
      !widgetId ||
      resetting ||
      saving
    ) {

      return;

    }


    const confirmed =
      await notifyConfirm(
        "¿Deseas restaurar la apariencia predeterminada del Widget?"
      );


    if (!confirmed) {

      return;

    }


    try {

      setResetting(true);


      /*
      --------------------------------------------------
      SAVE DEFAULT APPEARANCE
      --------------------------------------------------
      */

      await updateTransportationWidgetAppearance(

        widgetId,

        {
          ...DEFAULT_APPEARANCE
        }

      );


      /*
      --------------------------------------------------
      UPDATE LOCAL STATE
      --------------------------------------------------
      */

      setAppearance({
        ...DEFAULT_APPEARANCE
      });


      notifySuccess(
        "Configuración restaurada",
        "La apariencia predeterminada del Widget fue restaurada."
      );

    }

    catch (error) {

      console.error(
        "Unable to reset transportation Widget appearance:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible restaurar la configuración."
      );

    }

    finally {

      setResetting(false);

    }

  };


  /*
  ========================================================
  COPY WIDGET ID
  ========================================================
  */

  const handleCopyWidgetId = async () => {

    if (!widgetId) {

      return;

    }


    try {

      await navigator.clipboard.writeText(
        widgetId
      );


      notifySuccess(
        "Widget ID copiado",
        "El identificador fue copiado al portapapeles."
      );

    }

    catch (error) {

      console.error(
        "Unable to copy Widget ID:",
        error
      );

      notifyError(
        "No fue posible copiar el Widget ID."
      );

    }

  };


  /*
  ========================================================
    WIDGET URL
  ========================================================
  */

  const widgetUrl =
    widgetId
      ? `https://widget.skinneri.com/transportation/${widgetId}`
      : "";

  const widgetEmbedCode =
    widgetId
      ? `<script src="https://widget.skinneri.com/transportation-widget.js" data-widget-id="${widgetId}"></script>`
      : "";

  const handleCopyWidgetEmbedCode = async () => {

    if (!widgetEmbedCode) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        widgetEmbedCode
      );

      notifySuccess(
        "Código copiado",
        "El código de integración fue copiado al portapapeles."
      );

    }

    catch (error) {

      console.error(
        "Unable to copy Widget embed code:",
        error
      );

      notifyError(
        "No fue posible copiar el código de integración."
      );

    }

  };

  /*
  ========================================================
  PRIMARY COLOR
  ========================================================
  */

  const primaryColor =
    companyBranding?.primaryColor ||
    DEFAULT_COMPANY_BRANDING.primaryColor;


  /*
  ========================================================
  NO WIDGET
  ========================================================
  */

  if (
    !loading &&
    !widgetId
  ) {

    return (

      <div className="catalog-container">

        <CatalogHeader
          title="Widget de transportes"
          description="Configura la apariencia del Widget que utilizarán los clientes para solicitar reservas."
        />

        <div className="catalog-content">

          <div className="catalog-empty">

            <Palette
              size={32}
              aria-hidden="true"
            />

            <p>

              <strong>
                No existe un Widget configurado.
              </strong>

            </p>

            <p>
              Primero debes crear o vincular el Widget desde la sección de Integraciones.
            </p>

          </div>

        </div>

      </div>

    );

  }


  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {

    return (

      <div className="catalog-container">

        <CatalogHeader
          title="Widget de transportes"
          description="Configura la apariencia del Widget que utilizarán los clientes para solicitar reservas."
        />

        <div className="catalog-content">

          <div className="catalog-empty">

            <p>
              Cargando configuración del Widget...
            </p>

          </div>

        </div>

      </div>

    );

  }


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div className="catalog-container">

      {/*
      ======================================================
      HEADER
      ======================================================
      */}

      <CatalogHeader
        title="Widget de transportes"
        description="Personaliza la apariencia del Widget que utilizarán tus clientes para solicitar reservas."
      >

        <CatalogToolbar>

          <button
            type="button"
            className="catalog-action"
            onClick={handleReset}
            disabled={
              resetting ||
              saving
            }
          >

            <RotateCcw
              size={16}
              aria-hidden="true"
            />

            {
              resetting
                ? "Restaurando..."
                : "Restaurar valores"
            }

          </button>


          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={
              saving ||
              resetting
            }
          >

            <Save
              size={16}
              aria-hidden="true"
            />

            {
              saving
                ? "Guardando..."
                : "Guardar cambios"
            }

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* 
======================================================
WIDGET INFORMATION
======================================================
*/}

      <div className="catalog-content">

        <div className="transportation-widget-section__info">

          <div className="transportation-widget-section__info-item">

            <span className="transportation-widget-section__info-label">
              Empresa
            </span>

            <strong>
              {
                companyBranding?.name ||
                "Empresa"
              }
            </strong>

          </div>


          <div className="transportation-widget-section__info-item">

            <span className="transportation-widget-section__info-label">
              Color corporativo
            </span>

            <div className="transportation-widget-section__info-color">

              <span
                className="transportation-widget-section__color-dot"
                style={{
                  backgroundColor:
                    primaryColor
                }}
                aria-hidden="true"
              />

              <code>
                {primaryColor}
              </code>

            </div>

          </div>


          <div className="transportation-widget-section__info-item">

            <span className="transportation-widget-section__info-label">
              Widget ID
            </span>

            <code>
              {widgetId}
            </code>

          </div>


          <button
            type="button"
            className="catalog-action"
            onClick={handleCopyWidgetId}
          >

            <Copy
              size={15}
              aria-hidden="true"
            />

            Copiar ID

          </button>


          {
            widgetUrl && (

              <a
                className="catalog-action transportation-widget-section__external-link"
                href={widgetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >

                <ExternalLink
                  size={15}
                  aria-hidden="true"
                />

                Abrir Widget

              </a>

            )
          }

        </div>

      </div>


      {/* 
======================================================
WEBSITE INTEGRATION
======================================================
*/}

      <div className="catalog-content">

        <div className="transportation-widget-section__integration">

          <div className="transportation-widget-section__integration-header">

            <div>

              <h4>
                Integrar en tu sitio web
              </h4>

              <p>
                Copia este código y pégalo en el lugar de tu sitio web donde quieras mostrar el formulario de transporte.
              </p>

            </div>

          </div>


          <div className="transportation-widget-section__integration-code">

            <pre>
              <code>
                {widgetEmbedCode}
              </code>
            </pre>


            <button
              type="button"
              className="catalog-action transportation-widget-section__copy-code"
              onClick={handleCopyWidgetEmbedCode}
              disabled={!widgetEmbedCode}
            >

              <Code
                size={15}
                aria-hidden="true"
              />

              Copiar código

            </button>

          </div>


          <div className="transportation-widget-section__integration-help">

            <strong>
              ¿Cómo funciona?
            </strong>

            <p>
              El Widget se cargará automáticamente dentro de tu sitio web. No necesitas configurar ninguna API key ni agregar código adicional.
            </p>

          </div>

        </div>

      </div>


      {/*
      ======================================================
      EDITOR + PREVIEW
      ======================================================
      */}

      <div className="transportation-widget-section__layout">

        {/*
        ====================================================
        APPEARANCE EDITOR
        ====================================================
        */}

        <div className="transportation-widget-section__panel">

          <WidgetAppearanceEditor

            appearance={
              appearance
            }

            companyBranding={
              companyBranding
            }

            primaryColor={
              primaryColor
            }

            onAppearanceChange={
              handleAppearanceChange
            }

          />

        </div>


        {/*
        ====================================================
        PREVIEW
        ====================================================
        */}

        <div className="transportation-widget-section__panel">

          <div className="transportation-widget-section__preview-header">

            <div>

              <h4>
                Vista previa
              </h4>

              <p>
                Así se verá el formulario para tus clientes.
              </p>

            </div>

          </div>


          <WidgetPreview

            companyBranding={
              companyBranding
            }

            appearance={
              appearance
            }

            primaryColor={
              primaryColor
            }

          />

        </div>

      </div>

    </div>

  );

};


export default TransportationWidgetSection;