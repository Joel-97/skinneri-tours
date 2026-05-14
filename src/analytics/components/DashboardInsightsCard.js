import React from "react";

import "../styles/dashboardInsightsCard.css";

const DashboardInsightsCard = ({

  insights = []

}) => {

  return (

    <div className="chart-card dashboard-insights-card">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="chart-card-header">

        <div>

          <h3>
            Perspectivas automáticas
          </h3>

          <p>
            Interpretación inteligente del dashboard
          </p>

        </div>

      </div>

      {/* =====================================
          INSIGHTS
      ===================================== */}

      <div className="dashboard-insights-list">

        {

          insights.map((insight, index) => (

            <div

              key={index}

              className={`dashboard-insight-item ${insight.type}`}

            >

              {/* =============================
                  ICON
              ============================= */}

              <div className="dashboard-insight-icon">

                {insight.type === "success" && "↗"}

                {insight.type === "warning" && "!"}

                {insight.type === "info" && "i"}

              </div>

              {/* =============================
                  CONTENT
              ============================= */}

              <div className="dashboard-insight-content">

                <h4>
                  {insight.title}
                </h4>

                <p>
                  {insight.description}
                </p>

              </div>

            </div>

          ))

        }

      </div>

    </div>

  );

};

export default DashboardInsightsCard;