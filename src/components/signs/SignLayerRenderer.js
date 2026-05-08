import React from "react";

import { Rnd } from "react-rnd";

import TextLayer from "./layers/TextLayer";
import ShapeLayer from "./layers/ShapeLayer";
import ImageLayer from "./layers/ImageLayer";

import { replacePlaceholders }
  from "./utils/replacePlaceholders";

const SignLayerRenderer = ({
  layer,
  signData,
  updateLayer,

  selectedLayerId,
  setSelectedLayerId,

  saveHistory,
}) => {

  /*
  |--------------------------------------------------------------------------
  | SELECTED
  |--------------------------------------------------------------------------
  */

  const isSelected =
    selectedLayerId === layer.id;

  /*
  |--------------------------------------------------------------------------
  | IMAGE VALIDATION
  |--------------------------------------------------------------------------
  */

  const isImageLayer =
    layer.type === "image";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <Rnd

      size={{
        width:
          layer.width || 300,

        height:
          layer.height || 300,
      }}

      position={{
        x: layer.x || 0,

        y: layer.y || 0,
      }}

      bounds="parent"

      lockAspectRatio={
        isImageLayer
      }

      /*
      -----------------------------------
      DRAG START
      -----------------------------------
      */

      onDragStart={() => {

        saveHistory();
      }}

      /*
      -----------------------------------
      DRAG STOP
      -----------------------------------
      */

      onDragStop={(e, d) => {

        updateLayer(layer.id, {

          x: d.x,

          y: d.y,
        });
      }}

      /*
      -----------------------------------
      RESIZE START
      -----------------------------------
      */

      onResizeStart={() => {

        saveHistory();
      }}

      /*
      -----------------------------------
      RESIZE STOP
      -----------------------------------
      */

      onResizeStop={(
        e,
        direction,
        ref,
        delta,
        position
      ) => {

        updateLayer(layer.id, {

          width:
            parseInt(
              ref.style.width
            ),

          height:
            parseInt(
              ref.style.height
            ),

          ...position,
        });
      }}

      /*
      -----------------------------------
      SELECT
      -----------------------------------
      */

      onClick={() => {

        setSelectedLayerId(
          layer.id
        );
      }}

      style={{

        border: isSelected
          ? "2px solid #2563eb"
          : "1px dashed transparent",

        borderRadius:
          isSelected
            ? "10px"
            : "0px",

        zIndex:
          isSelected
            ? 100
            : 1,

        overflow: "hidden",

        transition:
          "border 0.15s ease",
      }}
    >

      {/* ---------------------------------- */}
      {/* TEXT */}
      {/* ---------------------------------- */}

      {layer.type === "text" && (

        <TextLayer
          layer={layer}

          text={replacePlaceholders(
            layer.text,
            signData
          )}
        />

      )}

      {/* ---------------------------------- */}
      {/* SHAPE */}
      {/* ---------------------------------- */}

      {layer.type === "shape" && (

        <ShapeLayer
          layer={layer}
        />

      )}

      {/* ---------------------------------- */}
      {/* IMAGE */}
      {/* ---------------------------------- */}

      {layer.type === "image" && (

        <ImageLayer
          layer={{
            ...layer,

            /*
            -----------------------------------
            FALLBACK
            -----------------------------------
            */

            src:
              layer.src || "",
          }}
        />

      )}

    </Rnd>
  );
};

export default SignLayerRenderer;