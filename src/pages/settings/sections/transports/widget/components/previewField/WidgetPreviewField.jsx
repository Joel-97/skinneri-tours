/*
==========================================================
WIDGET PREVIEW FIELD
==========================================================
*/

import React from "react";

import "./WidgetPreviewField.css";


const WidgetPreviewField = ({
  label,
  placeholder,
  style,
  required = false
}) => {


  /*
  ========================================================
  SELECT DETECTION
  ========================================================
  */

  const selectPlaceholders = [

    "Selecciona un servicio",

    "Selecciona el lugar de recogida",

    "Selecciona el lugar de origen",

    "Selecciona el destino"

  ];


  const isSelect =
    selectPlaceholders.includes(
      placeholder
    );


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <div
      className="tw-preview-field"
    >


      {/* ==================================================
          LABEL
      ================================================== */}

      <label
        className="tw-preview-field__label"
      >

        {label}


        {
          required && (

            <span
              className="tw-preview-field__required"
            >
              {" *"}
            </span>

          )
        }

      </label>


      {/* ==================================================
          FIELD
      ================================================== */}

      <div
        className="tw-preview-field__input"
        style={style}
      >

        <span
          className="tw-preview-field__text"
        >
          {placeholder}
        </span>


        {
          isSelect && (

            <span
              className="tw-preview-field__chevron"
              aria-hidden="true"
            >
              ˅
            </span>

          )
        }

      </div>

    </div>

  );

};


export default WidgetPreviewField;