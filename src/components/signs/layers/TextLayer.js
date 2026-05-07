import React from "react";

const TextLayer = ({ layer, text }) => {

  return (
    <div
      style={{
        width: "100%",
        height: "100%",

        fontSize: `${layer.fontSize}px`,
        fontWeight: layer.fontWeight,
        color: layer.color,

        textAlign: layer.textAlign,

        fontFamily: layer.fontFamily,

        display: "flex",

        alignItems: "center",

        justifyContent:
          layer.textAlign === "center"
            ? "center"
            : layer.textAlign === "right"
            ? "flex-end"
            : "flex-start",

        whiteSpace: "pre-wrap",

        overflow: "hidden",

        cursor: "move",

        userSelect: "none",
      }}
    >
      {text}
    </div>
  );
};

export default TextLayer;