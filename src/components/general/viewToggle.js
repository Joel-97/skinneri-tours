import React from "react";
import "../../style/general/viewToggle.css";

const ViewToggle = ({
  value,
  onChange,
  options = [
    { value: "grid", label: "Grid" },
    { value: "table", label: "Lista" }
  ],
  className = ""
}) => {
  return (
    <div className={`view-toggle ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`toggle-btn ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;