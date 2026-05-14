import React from "react";

import {

  ResponsiveContainer,

  BarChart,

  Bar,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip

} from "recharts";

// ======================================================
// TOP DESTINATIONS CHART
// ======================================================

const TopDestinationsChart = ({

  data = []

}) => {

  return (

    <div className="chart-card">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="chart-card-header">

        <div>

          <h3>
            Top Destinos
          </h3>

          <p>
            Destinos con mayores ingresos
          </p>

        </div>

      </div>

      {/* =====================================
          CHART
      ===================================== */}

      <div className="chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <BarChart
            data={data}
          >

            <CartesianGrid

              strokeDasharray="3 3"

              vertical={false}

            />

            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip

              formatter={(value) =>

                [`$${value}`, "Ingresos"]

              }

            />

            <Bar

              dataKey="value"

              radius={[8, 8, 0, 0]}

              fill="#0A1E5E"

            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default TopDestinationsChart;