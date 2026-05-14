import React from "react";

const AnalyticsCard = ({

  title,
  value,
  subtitle = "",
  trend = null,
  icon = null,
  accent = "#16a34a"

}) => {

  return (

    <div className="analytics-card">

      {/* =========================================
          ACCENT
      ========================================= */}

      <div
        className="analytics-card-accent"
        style={{
          background: accent
        }}
      />

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="analytics-card-header">

        <div>

          <p className="analytics-card-title">
            {title}
          </p>

          <h3 className="analytics-card-value">
            {value}
          </h3>

        </div>

        {icon && (

          <div className="analytics-card-icon">

            {icon}

          </div>

        )}

      </div>

      {/* =========================================
          FOOTER
      ========================================= */}

      {(subtitle || trend) && (

        <div className="analytics-card-footer">

          {subtitle && (

            <span className="analytics-card-subtitle">
              {subtitle}
            </span>

          )}

          {trend && (

            <span
              className={`analytics-card-trend ${
                trend > 0
                  ? "positive"
                  : "negative"
              }`}
            >

              {trend > 0 ? "+" : ""}
              {trend}%

            </span>

          )}

        </div>

      )}

    </div>

  );

};

export default AnalyticsCard;