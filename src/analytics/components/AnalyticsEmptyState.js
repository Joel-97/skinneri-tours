import React from "react";

import "../styles/analyticsEmptyState.css";

// ======================================================
// ANALYTICS EMPTY STATE
// ======================================================

const AnalyticsEmptyState = ({

  title =
    "Sin información",

  description =

    "No hay datos disponibles para mostrar."

}) => {

  return (

    <div className="analytics-empty-state">

      {/* =====================================
          ICON
      ===================================== */}

      <div className="analytics-empty-icon">

        📊

      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <h4>
        {title}
      </h4>

      <p>
        {description}
      </p>

    </div>

  );

};

export default AnalyticsEmptyState;