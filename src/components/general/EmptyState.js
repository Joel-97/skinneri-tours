import React from "react";

const EmptyState = ({

  icon = "📄",

  title = "No hay datos para mostrar.",

  description = "",

  action = null

}) => {

  return (

    <div className="table-empty-state">

      <div className="table-empty-icon">

        {icon}

      </div>

      <h4>

        {title}

      </h4>

      {

        description && (

          <p>

            {description}

          </p>

        )

      }

      {

        action && (

          <div className="table-empty-action">

            {action}

          </div>

        )

      }

    </div>

  );

};

export default EmptyState;