import React from "react";

import Select from "react-select";

import "../../style/settings/template/signToolbar.css";

import { dynamicFields } from "./config/dynamicFields";

const SignToolbar = ({
  onAddDynamicField,

  onAddStaticText,

  onAddShape,

  onAddImage,
}) => {

  return (
    <div className="sign-toolbar">

      {/* ------------------------------------------------ */}
      {/* DYNAMIC FIELDS */}
      {/* ------------------------------------------------ */}

      <div className="sign-toolbar-section">

        <div className="sign-toolbar-title">
          Campos Dinámicos
        </div>

        <div className="sign-toolbar-select-wrapper">

          <Select
            options={dynamicFields}

            placeholder="Seleccionar campo..."

            onChange={(selectedOption) => {

              if (!selectedOption) return;

              onAddDynamicField(
                selectedOption.value
              );
            }}

            classNamePrefix="sign-select"
          />

        </div>

      </div>

      {/* ------------------------------------------------ */}
      {/* STATIC ELEMENTS */}
      {/* ------------------------------------------------ */}

      <div className="sign-toolbar-section">

        <div className="sign-toolbar-title">
          Elementos de Diseño
        </div>

        <div className="sign-toolbar-group">

          <button
            className="sign-toolbar-button"
            onClick={onAddStaticText}
          >
            + Texto Libre
          </button>

          <button
            className="sign-toolbar-button"
            onClick={onAddShape}
          >
            + Shape
          </button>

          <button
            className="sign-toolbar-button"
            onClick={onAddImage}
          >
            + Imagen
          </button>

        </div>

      </div>

    </div>
  );
};

export default SignToolbar;