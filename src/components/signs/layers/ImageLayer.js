import React from "react";

const ImageLayer = ({ layer }) => {

  return (
    <img
      src={layer.src}

      alt="sign-layer"

      crossOrigin="anonymous"

      style={{
        width: "100%",
        height: "100%",

        objectFit: "contain",

        userSelect: "none",

        pointerEvents: "none",
      }}
    />
  );
};

export default ImageLayer;