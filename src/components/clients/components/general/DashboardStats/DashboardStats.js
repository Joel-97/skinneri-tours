import React from "react";

import "./DashboardStats.css";

/*
==========================================================
DASHBOARD STATS
==========================================================
*/

const DashboardStats = ({

  items = []

}) => {

  return (

    <section className="dashboard-stats">

      {

        items.map((item, index) => {

          const Icon = item.icon;

          return (

            <div

              key={index}

              className={`dashboard-stat-card ${item.color || ""}`}

            >

              {/* ==========================================
                  HEADER
              ========================================== */}

              <div className="dashboard-stat-header">

                <div className="dashboard-stat-icon">

                  {

                    Icon && (

                      <Icon

                        size={22}

                        strokeWidth={2}

                      />

                    )

                  }

                </div>

                {

                  item.badge && (

                    <span className="dashboard-stat-badge">

                      {item.badge}

                    </span>

                  )

                }

              </div>

              {/* ==========================================
                  BODY
              ========================================== */}

              <div className="dashboard-stat-body">

                <span className="dashboard-stat-title">

                  {item.title}

                </span>

                <h2 className="dashboard-stat-value">

                  {item.value}

                </h2>

                {

                  item.subtitle && (

                    <p className="dashboard-stat-subtitle">

                      {item.subtitle}

                    </p>

                  )

                }

              </div>

              {/* ==========================================
                  FOOTER
              ========================================== */}

              <div className="dashboard-stat-progress">

                <div className="dashboard-stat-bar" />

              </div>

            </div>

          );

        })

      }

    </section>

  );

};

export default DashboardStats;