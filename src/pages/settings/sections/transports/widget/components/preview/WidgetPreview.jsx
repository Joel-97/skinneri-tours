/*
==========================================================
WIDGET PREVIEW
==========================================================
*/

import React from "react";

import WidgetPreviewField
  from "../previewField/WidgetPreviewField";

import WidgetPreviewSection
  from "../previewSection/WidgetPreviewSection";

import skinneriLogo
  from "../../../../../../../assets/Flor_morada.png";

import "./WidgetPreview.css";


const WidgetPreview = ({
  companyBranding = {},
  appearance = {},
  primaryColor = "#2563EB"
}) => {


  /*
  ========================================================
  COMPANY
  ========================================================
  */

  const companyName =
    companyBranding?.name ||
    "Empresa";


  const companyLogo =
    companyBranding?.logoURL ||
    "";


  /*
  ========================================================
  APPEARANCE VALUES
  ========================================================
  */

  const backgroundColor =
    appearance?.backgroundColor ||
    "#FFFFFF";


  const textColor =
    appearance?.textColor ||
    "#111827";


  const fieldBackgroundColor =
    appearance?.fieldBackgroundColor ||
    "#FFFFFF";


  const borderRadius =
    Number(
      appearance?.borderRadius ?? 8
    );


  const fontFamily =
    appearance?.fontFamily ||
    "Inter";


  const buttonStyle =
    appearance?.buttonStyle ||
    "filled";


  /*
  ========================================================
  PREVIEW STYLE
  ========================================================
  */

  const previewStyle = {

    "--tw-preview-primary":
      primaryColor,

    "--tw-preview-background":
      backgroundColor,

    "--tw-preview-text":
      textColor,

    "--tw-preview-field-background":
      fieldBackgroundColor,

    "--tw-preview-radius":
      `${borderRadius}px`,

    "--tw-preview-font":
      fontFamily

  };


  /*
  ========================================================
  FIELD STYLE
  ========================================================
  */

  const fieldStyle = {

    backgroundColor:
      fieldBackgroundColor,

    color:
      textColor,

    borderColor:
      "#CBD5E1",

    borderRadius:
      `${borderRadius}px`,

    fontFamily:
      fontFamily

  };


  /*
  ========================================================
  BUTTON STYLE
  ========================================================
  */

  const buttonStyleObject = {

    backgroundColor:
      buttonStyle === "filled"
        ? primaryColor
        : "transparent",

    color:
      buttonStyle === "filled"
        ? "#FFFFFF"
        : primaryColor,

    border:
      `1px solid ${primaryColor}`,

    borderRadius:
      `${borderRadius}px`,

    fontFamily:
      fontFamily

  };


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div
      className="tw-preview"
    >

      <div
        className="tw-preview__card"
        style={previewStyle}
      >


        {/* ==================================================
            COMPANY BRANDING
        ================================================== */}

        <div
          className="tw-preview__company"
        >

          {
            companyLogo && (

              <div
                className="tw-preview__company-logo"
              >

                <img
                  src={companyLogo}
                  alt={
                    `Logo de ${companyName}`
                  }
                />

              </div>

            )
          }


          <div
            className="tw-preview__company-name"
          >
            {companyName}
          </div>

        </div>


        {/* ==================================================
            HEADER
        ================================================== */}

        <header
          className="tw-preview__header"
        >

          <h3>
            Solicita tu transporte
          </h3>

          <p>
            Completa los datos de tu reserva.
          </p>

        </header>


        {/* ==================================================
            SERVICE
        ================================================== */}

        <WidgetPreviewSection

          title="Servicio de transporte"

          description="Elige el servicio de transporte que deseas solicitar."

        >

          <WidgetPreviewField

            label="Servicio"

            placeholder="Selecciona un servicio"

            required

            style={fieldStyle}

          />

        </WidgetPreviewSection>


        {/* ==================================================
            TRIP DETAILS
        ================================================== */}

        <WidgetPreviewSection

          title="Detalles del viaje"

          description="Indicanos dónde y cuándo necesitas transporte."

        >

          <div
            className="tw-preview-section__grid"
          >

            <WidgetPreviewField

              label="Lugar de recogida"

              placeholder="Selecciona el lugar de recogida"

              required

              style={fieldStyle}

            />


            <WidgetPreviewField

              label="Lugar de destino"

              placeholder="Selecciona el destino"

              required

              style={fieldStyle}

            />

          </div>


          <div
            className="tw-preview-section__grid"
          >

            <WidgetPreviewField

              label="Fecha y hora"

              placeholder="dd/mm/aaaa --:--"

              required

              style={fieldStyle}

            />


            <WidgetPreviewField

              label="Pasajeros"

              placeholder="1"

              required

              style={fieldStyle}

            />

          </div>

        </WidgetPreviewSection>


        {/* ==================================================
            PASSENGER INFORMATION
        ================================================== */}

        <WidgetPreviewSection

          title="Información del pasajero"

          description="Ingresa la información de contacto para tu reserva."

        >

          <WidgetPreviewField

            label="Nombre"

            placeholder="Tu nombre completo"

            required

            style={fieldStyle}

          />


          <div
            className="tw-preview-section__grid"
          >

            <WidgetPreviewField

              label="Correo electrónico"

              placeholder="tu@ejemplo.com"

              required

              style={fieldStyle}

            />


            <WidgetPreviewField

              label="Teléfono"

              placeholder="+506 8888 8888"

              required

              style={fieldStyle}

            />

          </div>

        </WidgetPreviewSection>


        {/* ==================================================
            ADDITIONAL INFORMATION
        ================================================== */}

        <WidgetPreviewSection

          title="Información adicional"

          description="Agrega los datos de tu vuelo o cualquier solicitud especial."

        >

          <WidgetPreviewField

            label="Número de vuelo"

            placeholder="Opcional"

            style={fieldStyle}

          />


          <div
            className="tw-preview-field"
          >

            <label
              className="tw-preview-field__label"
            >
              Notas
            </label>


            <div
              className="tw-preview-field__input tw-preview-field__textarea"
              style={fieldStyle}
            >

              <span
                className="tw-preview-field__text"
              >
                Información adicional o solicitudes especiales
              </span>

            </div>

          </div>

        </WidgetPreviewSection>


        {/* ==================================================
            BUTTON
        ================================================== */}

        <button
          type="button"
          className="tw-preview__button"
          style={buttonStyleObject}
        >
          Solicitar transporte
        </button>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer
          className="tw-preview__footer"
        >

          <div
            className="tw-preview__footer-line"
          />


          <div
            className="tw-preview__footer-brand"
          >

            <img
              src={skinneriLogo}
              alt="Skinneri"
              className="tw-preview__skinneri-logo"
            />


            <span>
              Creado por Skinneri
            </span>

          </div>

        </footer>


      </div>

    </div>

  );

};


export default WidgetPreview;