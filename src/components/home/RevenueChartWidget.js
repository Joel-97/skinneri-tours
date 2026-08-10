import React from "react";

import {
  HiOutlinePresentationChartLine
} from "react-icons/hi2";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

import DashboardWidget from "./DashboardWidget";

import { useCurrency }
  from "../../context/CurrencyContext";

import { formatCurrency }
  from "../../utils/formatCurrency";

import "../../style/home/revenueChartWidget.css";

/* ======================================================
   REVENUE CHART WIDGET
====================================================== */

const RevenueChartWidget = ({

  loading

}) => {

  /*
  ==========================================================
  CURRENCY
  ==========================================================
  */

  const {

    selectedCurrency

  } = useCurrency();

  /*
  ==========================================================
  DATA
  ==========================================================
  */

  const chartData =

    selectedCurrency?.chart || [];

  const currencySymbol =

    selectedCurrency?.currencySymbol || "";

  const totalRevenue =

    selectedCurrency?.totalRevenue || 0;

  const averageDaily =

    selectedCurrency?.averageDaily || 0;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <DashboardWidget

      title="Ingresos — Últimos 7 Días"

      subtitle={

        selectedCurrency

          ? `Moneda: ${selectedCurrency.currencyCode}`

          : "Tendencia financiera reciente"

      }

      className="revenue-chart-widget"

    >

      {

        loading

          ? (

            <div className="chart-loading-state">

              <div className="skeleton skeleton-chart-modern"></div>

            </div>

          )

          : chartData.length === 0

            ? (

              <div className="widget-empty-state">

                <div className="widget-empty-icon">

                  <HiOutlinePresentationChartLine />

                </div>

                <h3>

                  No hay suficientes datos

                </h3>

                <p>

                  Todavía no hay información suficiente para mostrar el gráfico.

                </p>

              </div>

            )

            : (

              <>

                {/* =====================================
                    METRICS
                ====================================== */}

                <div className="chart-metrics-grid">

                  <div className="chart-metric-card">

                    <span>

                      Total generado

                    </span>

                    <strong>

                      {

                        formatCurrency(

                          totalRevenue,

                          currencySymbol

                        )

                      }

                    </strong>

                  </div>

                  <div className="chart-metric-card">

                    <span>

                      Promedio diario

                    </span>

                    <strong>

                      {

                        formatCurrency(

                          averageDaily,

                          currencySymbol

                        )

                      }

                    </strong>

                  </div>

                </div>

                {/* =====================================
                    CHART
                ====================================== */}

                <div className="revenue-chart-container">

                  <ResponsiveContainer

                    width="100%"

                    height={320}

                  >

                    <AreaChart

                      data={chartData}

                    >

                      <defs>

                        <linearGradient

                          id="revenueGradient"

                          x1="0"

                          y1="0"

                          x2="0"

                          y2="1"

                        >

                          <stop

                            offset="0%"

                            stopColor="#2563eb"

                            stopOpacity={0.35}

                          />

                          <stop

                            offset="100%"

                            stopColor="#2563eb"

                            stopOpacity={0}

                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid

                        strokeDasharray="3 3"

                        vertical={false}

                        stroke="#e2e8f0"

                      />

                      <XAxis

                        dataKey="date"

                        tickLine={false}

                        axisLine={false}

                        tick={{ fontSize: 12 }}

                      />

                      <YAxis

                        tickLine={false}

                        axisLine={false}

                        tick={{ fontSize: 12 }}

                        tickFormatter={(value) =>

                          formatCurrency(

                            value,

                            currencySymbol

                          )

                        }

                      />

                      <Tooltip

                        content={

                          <CustomTooltip

                            currencySymbol={

                              currencySymbol

                            }

                          />

                        }

                      />

                      <Area

                        type="monotone"

                        dataKey="revenue"

                        stroke="#2563eb"

                        strokeWidth={3}

                        fill="url(#revenueGradient)"

                        dot={{ r: 4 }}

                        activeDot={{ r: 6 }}

                      />

                    </AreaChart>

                  </ResponsiveContainer>

                </div>

              </>

            )

      }

    </DashboardWidget>

  );

};

/*
==========================================================
CUSTOM TOOLTIP
==========================================================
*/

const CustomTooltip = ({

  active,

  payload,

  label,

  currencySymbol

}) => {

  if (

    !active ||

    !payload ||

    !payload.length

  ) {

    return null;

  }

  return (

    <div className="chart-tooltip-modern">

      <span className="tooltip-date">

        {label}

      </span>

      <strong>

        {

          formatCurrency(

            payload[0].value,

            currencySymbol

          )

        }

      </strong>

    </div>

  );

};

export default RevenueChartWidget;