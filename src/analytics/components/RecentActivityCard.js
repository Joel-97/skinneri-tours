import React from "react";

const RecentActivityCard = ({

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
            Actividad Reciente
          </h3>

          <p>
            Últimos eventos del sistema
          </p>

        </div>

      </div>

      {/* =====================================
          LIST
      ===================================== */}

      <div className="recent-activity-list">

        {items.map((item, index) => (

          <div
            key={index}
            className="recent-activity-item"
          >

            {/* =============================
                DOT
            ============================= */}

            <div
              className="recent-activity-dot"
            />

            {/* =============================
                CONTENT
            ============================= */}

            <div className="recent-activity-content">

              <p>
                {item.title}
              </p>

              <span>
                {item.time}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default RecentActivityCard;