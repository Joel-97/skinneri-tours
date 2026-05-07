import React from "react";

import SignLayerRenderer from "./SignLayerRenderer";

import "../../style/settings/template/signCanvas.css";

const SignCanvas = ({
  template,
  setTemplate,
  signData,
  selectedLayerId,
  setSelectedLayerId,
}) => {

  /*
  |--------------------------------------------------------------------------
  | SAFETY
  |--------------------------------------------------------------------------
  */

  if (!template) {
    return null;
  }

  const canvas = template.canvas || {};

  const background = template.background || {};

  const layers = Array.isArray(template.layers)
    ? template.layers
    : [];

  /*
  |--------------------------------------------------------------------------
  | UPDATE LAYER
  |--------------------------------------------------------------------------
  */

  const updateLayer = (layerId, updates) => {

    const updatedLayers = layers.map((layer) => {

      if (layer.id === layerId) {

        return {
          ...layer,
          ...updates,
        };
      }

      return layer;
    });

    setTemplate({
      ...template,
      layers: updatedLayers,
    });
  };

  return (
    <div
      className="sign-canvas"

      style={{
        width: canvas.width || 900,

        height: canvas.height || 1400,

        background:
          background.color || "#ffffff",
      }}
    >

      {layers.map((layer) => {

        if (!layer) return null;

        return (
          <SignLayerRenderer
            key={layer.id}

            layer={layer}

            signData={signData}

            updateLayer={updateLayer}

            selectedLayerId={selectedLayerId}

            setSelectedLayerId={
              setSelectedLayerId
            }
          />
        );
      })}

    </div>
  );
};

export default SignCanvas;