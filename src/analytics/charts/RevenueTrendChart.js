import React from "react";

import {

  ResponsiveContainer,

  LineChart,

  Line,

  XAxis,

  YAxis,

  CartesianGrid,

  Tooltip

} from "recharts";

const RevenueTrendChart = ({

  data = [],
  title =
    "Tendencia de ingresos",

}) => {

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
            Resumen de ingresos a lo largo del tiempo
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

          <LineChart data={data}>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0A1E5E"
              strokeWidth={3}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default RevenueTrendChart;