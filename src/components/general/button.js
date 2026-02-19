import React from "react";

const Button = ({ className, backgroundColor, borderColor, textColor,
  width, height, marginLeft, marginRight, marginTop, marginBottom, fontSize, onClick, children }) => {

  return (
    <button
      className={`${className}`}
      style={{
        width: `${width || "auto"}`,
        height: `${height + "vh" || "auto"}`,
        marginLeft: `${marginLeft || "auto"}`,
        marginTop: `${marginTop + "vh" || "auto"}`,
        marginRight: `${marginRight + "vw" || "auto"}`,
        marginBottom: `${marginBottom + "vh" || "auto"}`,
        border: `${borderColor}`,
        backgroundColor: `${backgroundColor}`,
        color: `${textColor}`,
        fontSize: `${fontSize + "vw" || "auto"}`
      }}

      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;