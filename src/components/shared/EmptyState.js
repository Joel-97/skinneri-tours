import React from "react";

import "../../styles/shared/emptyState.css";

const EmptyState = ({
  icon = "📭",
  title = "No hay información",
  description = "Todavía no hay contenido disponible.",
  compact = false,
  children
}) => {

  return (

    <div className={`empty-state-wrapper ${compact ? "compact" : ""}`}>

      <div className="empty-state-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      {
        children && (
          <div className="empty-state-actions">
            {children}
          </div>
        )
      }

    </div>

  );

};

export default EmptyState;