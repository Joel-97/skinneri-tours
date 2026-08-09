import React from "react";

import "../../style/general/searchInput.css";

const SearchInput = ({

  value = "",

  onChange,

  placeholder = "Buscar...",

  width,

  disabled = false,

  className = "",

  style = {}

}) => {

  return (

    <input

      type="text"

      className={`search-input ${className}`}

      value={value}

      placeholder={placeholder}

      disabled={disabled}

      onChange={(e) =>

        onChange?.(

          e.target.value

        )

      }

      style={{

        width,

        ...style

      }}

    />

  );

};

export default SearchInput;