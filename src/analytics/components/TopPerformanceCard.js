import React from "react";
import AnalyticsEmptyState from "./AnalyticsEmptyState";

import "../styles/topPerformanceCard.css";

const TopPerformanceCard = ({

  title,

  items = []

}) => {

  // ====================================================
  // MAX VALUE
  // ====================================================

  const maxValue =
    Math.max(

      ...items.map((item) => {

        const numericValue =
          Number(

            String(item.value)
              .replace("$", "")
              .replace(",", "")

          );

        return numericValue || 0;

      }),

      0

    );

  return (

    <div className="chart-card">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="chart-card-header">

        <div>

          <h3>
            {title}
          </h3>

          <p>
            Rendimiento destacado
          </p>

        </div>

      </div>

      {
        items.length === 0 && (

          <AnalyticsEmptyState

            title="Sin resultados"

            description="No hay información disponible para este módulo."

          />

        )
      }
      
      
      {/* =====================================
          LIST
      ===================================== */}
      {
        items.length > 0 && (
          <div className="top-performance-list">

            {items.map((item, index) => {

              // =================================
              // NUMERIC VALUE
              // =================================

              const numericValue =
                Number(

                  String(item.value)
                    .replace("$", "")
                    .replace(",", "")

                ) || 0;

              // =================================
              // PERCENTAGE
              // =================================

              const percentage =
                maxValue > 0

                  ? (
                      (
                        numericValue /
                        maxValue
                      ) * 100
                    )

                  : 0;

              return (

                <div
                  key={index}
                  className="top-performance-item"
                >

                  {/* =========================
                      TOP ROW
                  ========================= */}

                  <div className="top-performance-top">

                    {/* =====================
                        LEFT
                    ===================== */}

                    <div className="top-performance-left">

                      {/* =================
                          POSITION
                      ================= */}

                      <div className="top-performance-rank">

                        #{index + 1}

                      </div>

                      {/* ================
                          CONTENT
                      ================ */}

                      <div className="top-performance-content">

                        <p>
                          {item.name}
                        </p>

                        <span>
                          {item.subtitle}
                        </span>

                      </div>

                    </div>

                    {/* =====================
                        VALUE
                    ===================== */}

                    <div className="top-performance-value">

                      {item.value}

                    </div>

                  </div>

                  {/* =========================
                      PROGRESS BAR
                  ========================= */}

                  <div className="top-performance-bar">

                    <div

                      className="top-performance-bar-fill"

                      style={{
                        width: `${percentage}%`
                      }}

                    />

                  </div>

                </div>

              );

            })}

          </div>
        )
      }

    </div>

  );

};

export default TopPerformanceCard;