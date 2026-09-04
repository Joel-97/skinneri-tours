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
  Palette,
  RotateCcw,
  Save,
  Copy,
  ExternalLink
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  getTransportationIntegration
} from "../../../../../services/platform/transportationIntegrationService";

import {
  getTransportationWidgetConfiguration,
  updateTransportationWidgetAppearance
} from "../../../../../services/platform/transportationWidgetService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";
import "../../../../../style/settings/transportation/widget/transportationWidgetSection.css";


/*
==========================================================
DEFAULT APPEARANCE
==========================================================
*/

const DEFAULT_APPEARANCE = Object.freeze({

  primaryColor: "#2563EB",

  backgroundColor: "#FFFFFF",

  textColor: "#111827",

  fieldBackgroundColor: "#FFFFFF",

  borderRadius: 8,

  fontFamily: "Inter",

  buttonStyle: "filled"

});


/*
==========================================================
FONT OPTIONS
==========================================================
*/

const FONT_OPTIONS = [

  {
    value: "Inter",
    label: "Inter"
  },

  {
    value: "Arial",
    label: "Arial"
  },

  {
    value: "Helvetica",
    label: "Helvetica"
  },

  {
    value: "system-ui",
    label: "System"
  }

];


/*
==========================================================
BUTTON STYLE OPTIONS
==========================================================
*/

const BUTTON_STYLE_OPTIONS = [

  {
    value: "filled",
    label: "Relleno"
  },

  {
    value: "outline",
    label: "Contorno"
  }

];


/*
==========================================================
COMPONENT
==========================================================
*/

const TransportationWidgetSection = () => {

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  const { session } = useAuth();

  const company = session?.company;


  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [widgetId, setWidgetId] =
    useState("");

  const [appearance, setAppearance] =
    useState({
      ...DEFAULT_APPEARANCE
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [resetting, setResetting] =
    useState(false);


  /*
  ==========================================================
  FETCH WIDGET
  ==========================================================
  */

  const fetchWidgetConfiguration =
    useCallback(
      async () => {

        if (!company?.id) {

          setLoading(false);

          return;

        }

        try {

          setLoading(true);


          /*
          --------------------------------------------------
          GET INTEGRATION
          --------------------------------------------------
          */

          const integrationResult =
            await getTransportationIntegration(
              company.id
            );


          const integration =
            integrationResult?.data;


          const currentWidgetId =
            integration?.widgetId;


          /*
          --------------------------------------------------
          VALIDATE WIDGET
          --------------------------------------------------
          */

          if (!currentWidgetId) {

            setWidgetId("");

            setAppearance({
              ...DEFAULT_APPEARANCE
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
            widgetData?.appearance;


          /*
          --------------------------------------------------
          MERGE WITH DEFAULTS
          --------------------------------------------------
          */

          setAppearance({

            ...DEFAULT_APPEARANCE,

            ...(widgetAppearance || {})

          });

        }

        catch (error) {

          console.error(error);

          notifyError(
            error?.message ||
            "No fue posible cargar la configuración del Widget."
          );

        }

        finally {

          setLoading(false);

        }

      },
      [company]
    );


  /*
  ==========================================================
  EFFECT
  ==========================================================
  */

  useEffect(() => {

    fetchWidgetConfiguration();

  }, [
    fetchWidgetConfiguration
  ]);


  /*
  ==========================================================
  HANDLE CHANGE
  ==========================================================
  */

  const handleAppearanceChange = (
    field,
    value
  ) => {

    setAppearance(
      current => ({

        ...current,

        [field]: value

      })
    );

  };


  /*
  ==========================================================
  SAVE
  ==========================================================
  */

  const handleSave = async () => {

    if (
      !widgetId ||
      saving
    ) {
      return;
    }


    try {

      setSaving(true);


      /*
      ------------------------------------------------------
      SAVE APPEARANCE
      ------------------------------------------------------
      */

      await updateTransportationWidgetAppearance(

        widgetId,

        appearance

      );


      notifySuccess(
        "Configuración guardada",
        "La apariencia del Widget fue actualizada correctamente."
      );

    }

    catch (error) {

      console.error(error);

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
  ==========================================================
  RESET DEFAULTS
  ==========================================================
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
      ------------------------------------------------------
      RESET
      ------------------------------------------------------
      */

      await updateTransportationWidgetAppearance(

        widgetId,

        {
          ...DEFAULT_APPEARANCE
        }

      );


      /*
      ------------------------------------------------------
      UPDATE LOCAL STATE
      ------------------------------------------------------
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

      console.error(error);

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
  ==========================================================
  COPY WIDGET ID
  ==========================================================
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

      console.error(error);

      notifyError(
        "No fue posible copiar el Widget ID."
      );

    }

  };


  /*
  ==========================================================
  WIDGET URL
  ==========================================================
  */

  const widgetUrl =
    widgetId

      ? `https://widget.skinneri.com/transportation/${widgetId}`

      : "";


  /*
  ==========================================================
  PREVIEW BUTTON STYLE
  ==========================================================
  */

  const previewButtonStyle = {

    backgroundColor:
      appearance.buttonStyle === "filled"

        ? appearance.primaryColor

        : "transparent",

    color:
      appearance.buttonStyle === "filled"

        ? "#FFFFFF"

        : appearance.primaryColor,

    border:
      `1px solid ${appearance.primaryColor}`,

    borderRadius:
      `${appearance.borderRadius}px`

  };


  /*
  ==========================================================
  PREVIEW STYLE
  ==========================================================
  */

  const previewStyle = {

    backgroundColor:
      appearance.backgroundColor,

    color:
      appearance.textColor,

    fontFamily:
      appearance.fontFamily,

    borderRadius:
      `${appearance.borderRadius}px`

  };


  /*
  ==========================================================
  FIELD PREVIEW STYLE
  ==========================================================
  */

  const fieldPreviewStyle = {

    backgroundColor:
      appearance.fieldBackgroundColor,

    borderColor:
      "#D8DEE8",

    borderRadius:
      `${appearance.borderRadius}px`,

    color:
      appearance.textColor,

    fontFamily:
      appearance.fontFamily

  };


  /*
  ==========================================================
  NO WIDGET
  ==========================================================
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
            />

            <p>

              <strong>
                No existe un Widget configurado.
              </strong>

            </p>

            <p>

              Primero debes crear o vincular el Widget
              desde la sección de Integraciones.

            </p>

          </div>

        </div>

      </div>

    );

  }


  /*
  ==========================================================
  LOADING
  ==========================================================
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
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="catalog-container">


      {/* ==================================================
          HEADER
      ================================================== */}

      <CatalogHeader

        title="Widget de transportes"

        description="Personaliza la apariencia del Widget que utilizarán tus clientes para solicitar reservas."

      >

        <CatalogToolbar>

          <button

            className="catalog-action"

            onClick={handleReset}

            disabled={
              resetting ||
              saving
            }

          >

            <RotateCcw
              size={16}
            />

            {resetting
              ? "Restaurando..."
              : "Restaurar valores"}

          </button>


          <button

            className="btn-primary"

            onClick={handleSave}

            disabled={
              saving ||
              resetting
            }

          >

            <Save
              size={16}
            />

            {saving
              ? "Guardando..."
              : "Guardar cambios"}

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          WIDGET INFORMATION
      ================================================== */}

      <div className="catalog-content">

        <div className="widget-info-bar">


          <div className="widget-info-item">

            <span className="widget-info-label">
              Widget ID
            </span>

            <code>
              {widgetId}
            </code>

          </div>


          <button

            className="catalog-action"

            onClick={handleCopyWidgetId}

          >

            <Copy
              size={15}
            />

            Copiar ID

          </button>


          {
            widgetUrl && (

              <a

                className="catalog-action widget-external-link"

                href={widgetUrl}

                target="_blank"

                rel="noopener noreferrer"

              >

                <ExternalLink
                  size={15}
                />

                Abrir Widget

              </a>

            )
          }


        </div>

      </div>


      {/* ==================================================
          CONFIGURATION + PREVIEW
      ================================================== */}

      <div className="widget-editor-layout">


        {/* ==================================================
            CONFIGURATION
        ================================================== */}

        <div className="catalog-content">

          <div className="widget-editor-panel">


            <div className="widget-section-title">

              <Palette
                size={19}
              />

              <div>

                <h4>
                  Apariencia
                </h4>

                <p>
                  Personaliza los colores y estilos básicos del Widget.
                </p>

              </div>

            </div>


            {/* ==============================================
                PRIMARY COLOR
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Color principal
              </label>

              <div className="widget-color-control">

                <input

                  type="color"

                  value={
                    appearance.primaryColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "primaryColor",
                      event.target.value
                    )

                  }

                />

                <input

                  type="text"

                  value={
                    appearance.primaryColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "primaryColor",
                      event.target.value
                    )

                  }

                />

              </div>

            </div>


            {/* ==============================================
                BACKGROUND COLOR
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Color de fondo
              </label>

              <div className="widget-color-control">

                <input

                  type="color"

                  value={
                    appearance.backgroundColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "backgroundColor",
                      event.target.value
                    )

                  }

                />

                <input

                  type="text"

                  value={
                    appearance.backgroundColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "backgroundColor",
                      event.target.value
                    )

                  }

                />

              </div>

            </div>


            {/* ==============================================
                TEXT COLOR
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Color del texto
              </label>

              <div className="widget-color-control">

                <input

                  type="color"

                  value={
                    appearance.textColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "textColor",
                      event.target.value
                    )

                  }

                />

                <input

                  type="text"

                  value={
                    appearance.textColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "textColor",
                      event.target.value
                    )

                  }

                />

              </div>

            </div>


            {/* ==============================================
                FIELD BACKGROUND
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Fondo de los campos
              </label>

              <div className="widget-color-control">

                <input

                  type="color"

                  value={
                    appearance.fieldBackgroundColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "fieldBackgroundColor",
                      event.target.value
                    )

                  }

                />

                <input

                  type="text"

                  value={
                    appearance.fieldBackgroundColor
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "fieldBackgroundColor",
                      event.target.value
                    )

                  }

                />

              </div>

            </div>


            {/* ==============================================
                BORDER RADIUS
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Radio de bordes
              </label>

              <div className="widget-range-control">

                <input

                  type="range"

                  min="0"

                  max="24"

                  step="1"

                  value={
                    appearance.borderRadius
                  }

                  onChange={(event) =>

                    handleAppearanceChange(
                      "borderRadius",
                      Number(event.target.value)
                    )

                  }

                />

                <span>
                  {appearance.borderRadius}px
                </span>

              </div>

            </div>


            {/* ==============================================
                FONT
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Fuente
              </label>

              <select

                value={
                  appearance.fontFamily
                }

                onChange={(event) =>

                  handleAppearanceChange(
                    "fontFamily",
                    event.target.value
                  )

                }

              >

                {
                  FONT_OPTIONS.map(
                    option => (

                      <option

                        key={
                          option.value
                        }

                        value={
                          option.value
                        }

                      >

                        {option.label}

                      </option>

                    )
                  )
                }

              </select>

            </div>


            {/* ==============================================
                BUTTON STYLE
            ============================================== */}

            <div className="widget-form-group">

              <label>
                Estilo del botón
              </label>

              <select

                value={
                  appearance.buttonStyle
                }

                onChange={(event) =>

                  handleAppearanceChange(
                    "buttonStyle",
                    event.target.value
                  )

                }

              >

                {
                  BUTTON_STYLE_OPTIONS.map(
                    option => (

                      <option

                        key={
                          option.value
                        }

                        value={
                          option.value
                        }

                      >

                        {option.label}

                      </option>

                    )
                  )
                }

              </select>

            </div>


          </div>

        </div>


        {/* ==================================================
            PREVIEW
        ================================================== */}

        <div className="catalog-content">

          <div className="widget-preview-panel">


            <div className="widget-preview-header">

              <div>

                <h4>
                  Vista previa
                </h4>

                <p>
                  Así se verá el formulario para tus clientes.
                </p>

              </div>

            </div>


            <div className="widget-preview-area">


              <div

                className="widget-preview-card"

                style={
                  previewStyle
                }

              >

                {/* ==========================================
                    PREVIEW TITLE
                ========================================== */}

                <div className="widget-preview-card-header">

                  <h3>
                    Solicita tu transporte
                  </h3>

                  <p>
                    Completa los datos de tu reserva.
                  </p>

                </div>


                {/* ==========================================
                    SERVICE
                ========================================== */}

                <div className="widget-preview-field">

                  <label>
                    Servicio
                  </label>

                  <div

                    className="widget-preview-input"

                    style={
                      fieldPreviewStyle
                    }

                  >

                    Selecciona un servicio

                  </div>

                </div>


                {/* ==========================================
                    FROM
                ========================================== */}

                <div className="widget-preview-field">

                  <label>
                    Desde
                  </label>

                  <div

                    className="widget-preview-input"

                    style={
                      fieldPreviewStyle
                    }

                  >

                    Selecciona el lugar de origen

                  </div>

                </div>


                {/* ==========================================
                    TO
                ========================================== */}

                <div className="widget-preview-field">

                  <label>
                    Hasta
                  </label>

                  <div

                    className="widget-preview-input"

                    style={
                      fieldPreviewStyle
                    }

                  >

                    Selecciona el destino

                  </div>

                </div>


                {/* ==========================================
                    DATE
                ========================================== */}

                <div className="widget-preview-field">

                  <label>
                    Fecha y hora
                  </label>

                  <div

                    className="widget-preview-input"

                    style={
                      fieldPreviewStyle
                    }

                  >

                    Selecciona fecha y hora

                  </div>

                </div>


                {/* ==========================================
                    PASSENGERS
                ========================================== */}

                <div className="widget-preview-field">

                  <label>
                    Pasajeros
                  </label>

                  <div

                    className="widget-preview-input"

                    style={
                      fieldPreviewStyle
                    }

                  >

                    1

                  </div>

                </div>


                {/* ==========================================
                    BUTTON
                ========================================== */}

                <button

                  type="button"

                  className="widget-preview-button"

                  style={
                    previewButtonStyle
                  }

                >

                  Solicitar reserva

                </button>


              </div>

            </div>

          </div>

        </div>


      </div>


    </div>

  );

};


export default TransportationWidgetSection;