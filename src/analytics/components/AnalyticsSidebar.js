import React from "react";

import "../styles/analyticsSidebar.css";

const AnalyticsSidebar = ({

  value,

  onChange

}) => {

  // ====================================================
  // ITEMS
  // ====================================================

  const items = [

    {
      value: "general",
      label: "General"
    },

    {
      value: "transportation",
      label: "Transportes"
    },

    {
      value: "adventure",
      label: "Aventuras"
    }

  ];

  return (

    <div className="analytics-sidebar">

      {/* =====================================
          TITLE
      ===================================== */}

      <div className="analytics-sidebar-header">

        <h3>
          Analíticas
        </h3>

      </div>

      {/* =====================================
          NAVIGATION
      ===================================== */}

      <div className="analytics-sidebar-nav">

        {items.map((item) => (

          <button

            key={item.value}

            type="button"

            className={

              value === item.value

                ? "analytics-sidebar-item active"

                : "analytics-sidebar-item"

            }

            onClick={() =>

              onChange(
                item.value
              )

            }

          >

            {item.label}

          </button>

        ))}

      </div>

    </div>

  );

};

export default AnalyticsSidebar;