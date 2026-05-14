import React from "react";

import "../../style/home/kpiCard.css";

const KPICard = ({
  title,
  value,
  description,
  trend,
  type = "default",
  icon
}) => {

  return (

    <div className={`kpi-card-modern ${type}`}>

      <div className="kpi-card-top">

        <div className="kpi-card-icon">
          {icon}
        </div>

        {
        trend !== undefined && trend !== null && (

            <div
            className={`kpi-trend ${
                trend > 0 ? "positive" : trend < 0 ? "negative" : "neutral"
            }`}
            >
            {trend > 0 ? "+" : ""}
            {trend}%
            </div>

        )
        }

      </div>

      <div className="kpi-card-body">

        <span className="kpi-title">
          {title}
        </span>

        <h3>
          {value}
        </h3>

        <p>
          {description}
        </p>

      </div>

    </div>

  );

};

export default KPICard;