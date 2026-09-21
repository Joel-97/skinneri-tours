/*
==========================================================
WIDGET APPEARANCE EDITOR
==========================================================
*/

import React from "react";

import {
  Palette
} from "lucide-react";

import {
  FONT_OPTIONS,
  BUTTON_STYLE_OPTIONS
} from "../../widgetConstants";

import "./WidgetAppearanceEditor.css";


const WidgetAppearanceEditor = ({
  appearance = {},
  companyBranding = {},
  primaryColor = "#2563EB",
  onAppearanceChange
}) => {


  /*
  ========================================================
  COLOR CONTROL
  ========================================================
  */

  const renderColorControl = (
    field
  ) => {

    const value =
      appearance[field] ||
      "#FFFFFF";


    return (

      <div
        className="widget-appearance-editor__color"
      >

        <input
          type="color"
          className="widget-appearance-editor__color-picker"
          value={value}
          onChange={(event) =>
            onAppearanceChange(
              field,
              event.target.value
            )
          }
          aria-label={`Seleccionar color para ${field}`}
        />


        <input
          type="text"
          className="widget-appearance-editor__color-input"
          value={value}
          onChange={(event) =>
            onAppearanceChange(
              field,
              event.target.value
            )
          }
          aria-label={`Código de color para ${field}`}
        />

      </div>

    );

  };


  /*
  ========================================================
  BORDER RADIUS
  ========================================================
  */

  const borderRadius =
    Number(
      appearance.borderRadius ?? 8
    );


  /*
  ========================================================
  FONT
  ========================================================
  */

  const fontFamily =
    appearance.fontFamily ||
    FONT_OPTIONS?.[0]?.value ||
    "Inter";


  /*
  ========================================================
  BUTTON STYLE
  ========================================================
  */

  const buttonStyle =
    appearance.buttonStyle ||
    BUTTON_STYLE_OPTIONS?.[0]?.value ||
    "filled";


  /*
  ========================================================
  COMPANY
  ========================================================
  */

  const companyName =
    companyBranding.name ||
    "Empresa";


  const companyLogo =
    companyBranding.logoURL ||
    "";


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div
      className="widget-appearance-editor"
    >


      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="widget-appearance-editor__header"
      >

        <Palette
          size={19}
          aria-hidden="true"
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


      {/* ==================================================
          COMPANY BRANDING
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Identidad de la empresa
        </label>


        <div
          className="widget-appearance-editor__company"
        >

          {
            companyLogo ? (

              <div
                className="widget-appearance-editor__company-logo"
              >

                <img
                  src={companyLogo}
                  alt={
                    `Logo de ${companyName}`
                  }
                />

              </div>

            ) : (

              <div
                className="widget-appearance-editor__company-placeholder"
              >
                Sin logo
              </div>

            )
          }


          <div
            className="widget-appearance-editor__company-info"
          >

            <strong
              className="widget-appearance-editor__company-name"
            >
              {companyName}
            </strong>


            <span
              className="widget-appearance-editor__company-description"
            >
              El logo y el color principal se obtienen de la configuración general de la empresa.
            </span>

          </div>

        </div>

      </div>


      {/* ==================================================
          PRIMARY COLOR
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Color principal
        </label>


        <div
          className="widget-appearance-editor__color"
        >

          <input
            type="color"
            className="widget-appearance-editor__color-picker"
            value={primaryColor}
            disabled
            aria-label="Color principal de la empresa"
          />


          <input
            type="text"
            className="widget-appearance-editor__color-input"
            value={primaryColor}
            readOnly
            disabled
            aria-label="Código del color principal"
          />

        </div>


        <p
          className="widget-appearance-editor__help"
        >
          Este color se hereda de la configuración general de la empresa y no se modifica desde el Widget.
        </p>

      </div>


      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Color de fondo
        </label>


        {
          renderColorControl(
            "backgroundColor"
          )
        }

      </div>


      {/* ==================================================
          TEXT COLOR
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Color del texto
        </label>


        {
          renderColorControl(
            "textColor"
          )
        }

      </div>


      {/* ==================================================
          FIELD BACKGROUND
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Fondo de los campos
        </label>


        {
          renderColorControl(
            "fieldBackgroundColor"
          )
        }

      </div>


      {/* ==================================================
          BORDER RADIUS
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Radio de bordes
        </label>


        <div
          className="widget-appearance-editor__range"
        >

          <input
            type="range"
            min="0"
            max="24"
            step="1"
            value={borderRadius}
            onChange={(event) =>
              onAppearanceChange(
                "borderRadius",
                Number(
                  event.target.value
                )
              )
            }
            aria-label="Radio de bordes"
          />


          <span
            className="widget-appearance-editor__range-value"
          >
            {borderRadius}px
          </span>

        </div>

      </div>


      {/* ==================================================
          FONT
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Fuente
        </label>


        <select
          className="widget-appearance-editor__select"
          value={fontFamily}
          onChange={(event) =>
            onAppearanceChange(
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
                  {
                    option.label
                  }
                </option>

              )
            )
          }

        </select>

      </div>


      {/* ==================================================
          BUTTON STYLE
      ================================================== */}

      <div
        className="widget-appearance-editor__group"
      >

        <label
          className="widget-appearance-editor__label"
        >
          Estilo del botón
        </label>


        <select
          className="widget-appearance-editor__select"
          value={buttonStyle}
          onChange={(event) =>
            onAppearanceChange(
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
                  {
                    option.label
                  }
                </option>

              )
            )
          }

        </select>

      </div>


    </div>

  );

};


export default WidgetAppearanceEditor;