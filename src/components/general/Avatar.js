import React, { useState } from "react";

const Avatar = ({

  src,

  name = "",

  alt = "",

  size = 40

}) => {

  const [imageError, setImageError] = useState(false);

  /*
  ==========================================================
  INITIALS
  ==========================================================
  */

  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");

  /*
  ==========================================================
  STYLES
  ==========================================================
  */

  const avatarStyle = {

    width: size,

    height: size,

    minWidth: size,

    minHeight: size,

    borderRadius: "50%",

    overflow: "hidden",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    background: "#E2E8F0",

    color: "#475569",

    fontWeight: 600,

    fontSize: size * 0.38,

    userSelect: "none"

  };

  /*
  ==========================================================
  IMAGE
  ==========================================================
  */

  if (src && !imageError) {

    return (

      <img

        src={src}

        alt={alt || name}

        style={avatarStyle}

        onError={() => setImageError(true)}

      />

    );

  }

  /*
  ==========================================================
  FALLBACK
  ==========================================================
  */

  return (

    <div style={avatarStyle}>

      {initials || "?"}

    </div>

  );

};

export default Avatar;