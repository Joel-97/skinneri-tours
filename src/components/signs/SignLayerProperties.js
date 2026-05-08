import React from "react";

import Select from "react-select";
import { dynamicFields } from "../signs/config/dynamicFields";
import "../../style/settings/template/signLayerProperties.css";

const fontOptions = [
  {
    value: "Inter",
    label: "Inter",
  },

  {
    value: "Poppins",
    label: "Poppins",
  },

  {
    value: "Montserrat",
    label: "Montserrat",
  },

  {
    value: "Roboto",
    label: "Roboto",
  },

  {
    value: "Oswald",
    label: "Oswald",
  },

  {
    value: "Bebas Neue",
    label: "Bebas Neue",
  },

  {
    value: "Arial",
    label: "Arial",
  },

  {
    value: "Times New Roman",
    label: "Times New Roman",
  },
];

const SignLayerProperties = ({
  selectedLayer,
  updateLayer,
}) => {

  if (!selectedLayer) {

    return (

      <div className="sign-layer-properties-empty">

        <p className="sign-layer-properties-empty-text">
          Selecciona una capa
        </p>

      </div>
    );
  }

  const isTextLayer =
    selectedLayer.type === "text";

  const isShapeLayer =
    selectedLayer.type === "shape";

  const isImageLayer =
    selectedLayer.type === "image";

  const dynamicFieldLabel =
    dynamicFields.find(
      (field) =>
        field.value === selectedLayer.text
    )?.label;

  return (

    <div className="sign-layer-properties">

      {/* HEADER */}
      <div>

        <h2>
          Propiedades
        </h2>

        <p className="sign-layer-properties-id">
          {selectedLayer.id}
        </p>

      </div>

      {/* ------------------------------------------------ */}
      {/* TEXT LAYER */}
      {/* ------------------------------------------------ */}

      {isTextLayer && (

        <>

          {/* TEXT */}
          <div className="slp-section">

            <label>
              Texto
            </label>

            <textarea

              value={
                dynamicFieldLabel ||
                selectedLayer.text
              }

              readOnly={
                !!dynamicFieldLabel
              }

              onChange={(e) =>

                updateLayer(selectedLayer.id, {
                  text: e.target.value,
                })
              }

              className="slp-input slp-textarea"
            />

          </div>

          {/* FONT FAMILY */}
          <div className="slp-section">

            <label>
              Fuente
            </label>

            <Select
              options={fontOptions}

              value={
                fontOptions.find(
                  (option) =>
                    option.value ===
                    selectedLayer.fontFamily
                ) || fontOptions[0]
              }

              onChange={(selected) =>
                updateLayer(selectedLayer.id, {
                  fontFamily:
                    selected.value,
                })
              }

              classNamePrefix="slp-select"
            />

          </div>

          {/* FONT SIZE */}
          <div className="slp-section">

            <label>
              Tamaño
            </label>

            <input
              type="number"

              value={
                selectedLayer.fontSize
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  fontSize: Number(
                    e.target.value
                  ),
                })
              }

              className="slp-input"
            />

          </div>

          {/* WIDTH */}
          <div className="slp-section">

            <label>
              Ancho
            </label>

            <input
              type="number"

              value={
                selectedLayer.width || 300
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  width: Number(
                    e.target.value
                  ),
                })
              }

              className="slp-input"
            />

          </div>

          {/* HEIGHT */}
          <div className="slp-section">

            <label>
              Altura
            </label>

            <input
              type="number"

              value={
                selectedLayer.height || 120
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  height: Number(
                    e.target.value
                  ),
                })
              }

              className="slp-input"
            />

          </div>

          {/* FONT WEIGHT */}
          <div className="slp-section">

            <label>
              Grosor
            </label>

            <select
              value={
                selectedLayer.fontWeight
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  fontWeight: Number(
                    e.target.value
                  ),
                })
              }

              className="slp-input"
            >

              <option value={400}>
                Regular
              </option>

              <option value={600}>
                Semi Bold
              </option>

              <option value={700}>
                Bold
              </option>

              <option value={900}>
                Black
              </option>

            </select>

          </div>

          {/* COLOR */}
          <div className="slp-section">

            <label>
              Color
            </label>

            <input
              type="color"

              value={
                selectedLayer.color
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  color:
                    e.target.value,
                })
              }

              className="slp-color-input"
            />

          </div>

          {/* ALIGN */}
          <div className="slp-section">

            <label>
              Alineación
            </label>

            <select
              value={
                selectedLayer.textAlign
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  textAlign:
                    e.target.value,
                })
              }

              className="slp-input"
            >

              <option value="left">
                Left
              </option>

              <option value="center">
                Center
              </option>

              <option value="right">
                Right
              </option>

            </select>

          </div>

        </>
      )}

      {/* ------------------------------------------------ */}
      {/* SHAPE LAYER */}
      {/* ------------------------------------------------ */}

      {isShapeLayer && (

        <>

          {/* COLOR */}
          <div className="slp-section">

            <label>
              Background Color
            </label>

            <input
              type="color"

              value={
                selectedLayer.backgroundColor
              }

              onChange={(e) =>
                updateLayer(selectedLayer.id, {
                  backgroundColor:
                    e.target.value,
                })
              }

              className="slp-color-input"
            />

          </div>

        </>
      )}

      {/* ------------------------------------------------ */}
      {/* IMAGE LAYER */}
      {/* ------------------------------------------------ */}

      {isImageLayer && (

        <>

          <div className="slp-section">

            <label>
              Imagen cargada
            </label>

            <p className="slp-image-text">
              Esta imagen puede moverse
              y redimensionarse.
            </p>

          </div>

        </>

      )}

    </div>
  );
};

export default SignLayerProperties;