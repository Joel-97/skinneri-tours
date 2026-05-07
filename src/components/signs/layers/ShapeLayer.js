import React from "react";

const ShapeLayer = ({ layer }) => {

  return (
    <div
      style={{
        width: "100%",
        height: "100%",

        backgroundColor:
          layer.backgroundColor,

        opacity:
          layer.opacity ?? 1,

        borderRadius:
          layer.borderRadius ?? 0,
      }}
    />
  );
};

export default ShapeLayer;