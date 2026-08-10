import React from "react";

const StatsGrid = ({ items = [] }) => {

  return (

    <div className="stats-grid">

      {items.map((item, index) => (

        <div
          key={index}
          className="stats-card"
        >

          <span className="stats-label">

            {item.label}

          </span>

          <h3 className="stats-value">

            {item.value}

          </h3>

        </div>

      ))}

    </div>

  );

};

export default StatsGrid;