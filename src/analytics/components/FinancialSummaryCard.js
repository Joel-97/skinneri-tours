import React from "react";

const FinancialSummaryCard = ({

  items = []

}) => {

  return (

    <div className="chart-card">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="chart-card-header">

        <div>

          <h3>
            Resumen Financiero
          </h3>

          <p>
            Estado financiero general
          </p>

        </div>

      </div>

      {/* =====================================
          LIST
      ===================================== */}

      <div className="financial-summary-list">

        {items.map((item, index) => (

          <div
            key={index}
            className="financial-summary-item"
          >

            {/* =============================
                LABEL
            ============================= */}

            <span className="financial-summary-label">

              {item.label}

            </span>

            {/* =============================
                VALUE
            ============================= */}

            <span className="financial-summary-value">

              {item.value}

            </span>

          </div>

        ))}

      </div>

    </div>

  );

};

export default FinancialSummaryCard;