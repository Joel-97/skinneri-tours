import React from "react";

import {

  ResponsiveContainer,

  PieChart,

  Pie,

  Cell,

  Tooltip

} from "recharts";

const COLORS = [

  "#0A1E5E",

  "#2563eb",

  "#7c3aed",

  "#16a34a"

];

const PaymentMethodsChart = ({

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
            Métodos de Pago
          </h3>

          <p>
            Distribución por método de pago
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

          <PieChart>

            <Pie

              data={data}

              dataKey="value"

              nameKey="name"

              innerRadius={70}

              outerRadius={100}

              paddingAngle={3}

            >

              {data.map((entry, index) => (

                <Cell
                  key={index}
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />

              ))}

            </Pie>

          <Tooltip

            formatter={(value, name, props) => [

              `$${value}`,

              `${props.payload.percentage}%`

            ]}

          />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

};

export default PaymentMethodsChart;