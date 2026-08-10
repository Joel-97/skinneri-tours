import React from "react";

import "../../style/home/kpiCard.css";

const KPICard = ({

  title,

  value,

  description,

  trend,

  badge = null,

  footer = null,

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

          trend !== undefined &&

          trend !== null && (

            <div

              className={`kpi-trend ${

                trend > 0

                  ? "positive"

                  : trend < 0

                    ? "negative"

                    : "neutral"

              }`}

            >

              {

                trend > 0

                  ? "+"

                  : ""

              }

              {trend}%

            </div>

          )

        }

      </div>

      <div className="kpi-card-body">

        <span className="kpi-title">

          {title}

        </span>

        {

          badge && (

            <span className="kpi-badge">

              {badge}

            </span>

          )

        }

        <h3>

          {value}

        </h3>

        {

          description && (

            <p>

              {description}

            </p>

          )

        }

        {

          footer && (

            <div className="kpi-footer">

              {footer}

            </div>

          )

        }

      </div>

    </div>

  );

};

export default KPICard;