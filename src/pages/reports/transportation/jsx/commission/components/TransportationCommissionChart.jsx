import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    TrendingUp
} from "lucide-react";

import {
    formatCommissionCurrency,
    formatCommissionNumber
} from "../utils/transportationCommissionUtils";

import Loading from "../../../../../../components/general/loading";


const TransportationCommissionChart = ({
    data = [],
    loading = false
}) => {

    const safeData =
        Array.isArray(data)
            ? data
            : [];


    const formatDateLabel = (value) => {

        if (!value) {
            return "";
        }

        const date =
            new Date(`${value}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "es-CR",
            {
                day: "2-digit",
                month: "short"
            }
        );
    };


    const formatCurrency = (
        value,
        currency = "USD"
    ) => {

        const numericValue =
            Number(value) || 0;

        return formatCommissionCurrency(
            numericValue,
            currency
        );
    };


    const formatNumber = (value) => {

        return formatCommissionNumber(
            Number(value) || 0
        );
    };


    const CustomTooltip = ({
        active,
        payload,
        label
    }) => {

        if (
            !active ||
            !payload ||
            payload.length === 0
        ) {
            return null;
        }


        const firstPayload =
            payload[0]?.payload || {};


        const currency =
            firstPayload.currency ||
            "USD";


        return (
            <div className="transportation-commission-chart-tooltip">

                <div className="transportation-commission-chart-tooltip-date">
                    {formatDateLabel(label)}
                </div>


                <div className="transportation-commission-chart-tooltip-row">

                    <span>
                        Ventas brutas
                    </span>

                    <strong className="transportation-commission-chart-tooltip-value">
                        {formatCurrency(
                            firstPayload.grossSales,
                            currency
                        )}
                    </strong>

                </div>


                <div className="transportation-commission-chart-tooltip-row">

                    <span>
                        Comisiones
                    </span>

                    <strong className="transportation-commission-chart-tooltip-value">
                        {formatCurrency(
                            firstPayload.commissions,
                            currency
                        )}
                    </strong>

                </div>


                <div className="transportation-commission-chart-tooltip-row">

                    <span>
                        Reservaciones
                    </span>

                    <strong className="transportation-commission-chart-tooltip-value">
                        {formatNumber(
                            firstPayload.reservationCount
                        )}
                    </strong>

                </div>


                <div className="transportation-commission-chart-tooltip-row">

                    <span>
                        Tasa efectiva
                    </span>

                    <strong className="transportation-commission-chart-tooltip-value">
                        {
                            (
                                Number(
                                    firstPayload.commissionRate
                                ) || 0
                            ).toFixed(2)
                        }%
                    </strong>

                </div>

            </div>
        );
    };


    if (loading) {

        return (
            <section className="transportation-commission-chart">

                <div className="transportation-commission-chart-header">

                    <h2 className="transportation-commission-chart-title">

                        <TrendingUp
                            size={16}
                            strokeWidth={2}
                        />

                        Evolución de comisiones

                    </h2>

                </div>


                <div className="transportation-commission-chart-empty">

                    <span>
                        <Loading />
                    </span>

                </div>

            </section>
        );
    }


    if (safeData.length === 0) {

        return (
            <section className="transportation-commission-chart">

                <div className="transportation-commission-chart-header">

                    <h2 className="transportation-commission-chart-title">

                        <TrendingUp
                            size={16}
                            strokeWidth={2}
                        />

                        Evolución de comisiones

                    </h2>

                </div>


                <div className="transportation-commission-chart-empty">

                    <TrendingUp
                        size={24}
                        strokeWidth={1.7}
                    />

                    <span>
                        No hay información suficiente para mostrar el gráfico.
                    </span>

                </div>

            </section>
        );
    }


    return (
        <section className="transportation-commission-chart">

            <div className="transportation-commission-chart-header">

                <h2 className="transportation-commission-chart-title">

                    <TrendingUp
                        size={16}
                        strokeWidth={2}
                    />

                    Evolución de comisiones

                </h2>

            </div>


            <div className="transportation-commission-chart-container">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <LineChart
                        data={safeData}
                        margin={{
                            top: 10,
                            right: 20,
                            left: 10,
                            bottom: 5
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />


                        <XAxis
                            dataKey="date"
                            tickFormatter={
                                formatDateLabel
                            }
                            axisLine={false}
                            tickLine={false}
                        />


                        <YAxis
                            yAxisId="currency"
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                                formatCurrency(
                                    value,
                                    safeData[0]?.currency ||
                                    "USD"
                                )
                            }
                        />


                        <YAxis
                            yAxisId="percentage"
                            orientation="right"
                            domain={[
                                0,
                                "auto"
                            ]}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) =>
                                `${value}%`
                            }
                        />


                        <Tooltip
                            content={
                                <CustomTooltip />
                            }
                        />


                        <Legend />


                        <Line
                            yAxisId="currency"
                            type="monotone"
                            dataKey="grossSales"
                            name="Ventas brutas"
                            stroke="#08204B"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4
                            }}
                        />


                        <Line
                            yAxisId="currency"
                            type="monotone"
                            dataKey="commissions"
                            name="Comisiones"
                            stroke="#5B2D8B"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 4
                            }}
                        />


                        <Line
                            yAxisId="percentage"
                            type="monotone"
                            dataKey="commissionRate"
                            name="Tasa efectiva"
                            stroke="#829CB0"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            dot={false}
                            activeDot={{
                                r: 4
                            }}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

        </section>
    );
};


export default TransportationCommissionChart;