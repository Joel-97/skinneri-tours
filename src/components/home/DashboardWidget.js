import React from "react";

import "../../style/home/widget.css";

const DashboardWidget = ({
  title,
  subtitle,
  children,
  className = ""
}) => {

  return (

    <div className={`dashboard-widget-base ${className}`}>

      {
        (title || subtitle) && (

          <div className="dashboard-widget-header">

            <div>

              {
                title && (
                  <h2>{title}</h2>
                )
              }

              {
                subtitle && (
                  <p>{subtitle}</p>
                )
              }

            </div>

          </div>

        )
      }

      <div className="dashboard-widget-content">
        {children}
      </div>

    </div>

  );

};

export default DashboardWidget;