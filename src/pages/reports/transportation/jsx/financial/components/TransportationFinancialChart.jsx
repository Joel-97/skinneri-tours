import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import {
    FaChartLine
} from "react-icons/fa";

import Loading from "../../../../../../components/general/loading";


const TransportationFinancialChart = ({
    data = [],
    loading = false
}) => {

    /* =========================================================
       CURRENCY FORMAT
    ========================================================= */

    const formatCurrency = (
        value,
        currency = "USD"
    ) => {

        const amount =
            Number(value || 0);

        try {

            return new Intl.NumberFormat(
                "en-US",
                {
                    style: "currency",
                    currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            ).format(amount);

        } catch {

            return `${currency} ${amount.toFixed(2)}`;
        }
    };


    /* =========================================================
       AXIS FORMAT
    ========================================================= */

    const formatAxisValue = (
        value
    ) => {

        const amount =
            Number(value || 0);


        if (
            Math.abs(amount) >= 1000000
        ) {

            return `${(
                amount / 1000000
            ).toFixed(1)}M`;
        }


        if (
            Math.abs(amount) >= 1000
        ) {

            return `${(
                amount / 1000
            ).toFixed(1)}K`;
        }


        return amount.toFixed(0);
    };


    /* =========================================================
       TOOLTIP
    ========================================================= */

    const tooltipFormatter = (
        value,
        name
    ) => {

        const currency =
            data[0]?.currency ||
            "USD";


        const labels = {
            grossSales: "Ventas brutas",
            discounts: "Descuentos",
            taxes: "Impuestos",
            commissions: "Comisiones",
            total: "Total"
        };


        return [
            formatCurrency(
                value,
                currency
            ),
            labels[name] || name
        ];
    };


    /* =========================================================
       CUSTOM TOOLTIP CONTENT
    ========================================================= */

    const renderTooltip = ({
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


        const currency =
            data[0]?.currency ||
            "USD";


        const labels = {
            grossSales: "Ventas brutas",
            discounts: "Descuentos",
            taxes: "Impuestos",
            commissions: "Comisiones",
            total: "Total"
        };


        return (
            <div className="transportation-financial-chart-tooltip">

                <div className="transportation-financial-chart-tooltip-date">
                    {label}
                </div>


                {payload.map((item) => {

                    const key =
                        item.dataKey;

                    return (
                        <div
                            key={key}
                            className="transportation-financial-chart-tooltip-row"
                        >

                            <span>
                                {labels[key] || item.name}
                            </span>

                            <span className="transportation-financial-chart-tooltip-value">
                                {formatCurrency(
                                    item.value,
                                    currency
                                )}
                            </span>

                        </div>
                    );
                })}

            </div>
        );
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <section className="transportation-financial-chart">

            {/* =====================================================
                CHART HEADER
            ====================================================== */}

            <div className="transportation-financial-chart-header">

                <div className="transportation-financial-chart-title">

                    <FaChartLine />

                    <span>
                        Evolución financiera
                    </span>

                </div>

            </div>


            {/* =====================================================
                CHART CONTENT
            ====================================================== */}

            <div className="transportation-financial-chart-container">

                {loading ? (

                    <div className="transportation-financial-chart-empty">

                        <span>
                            <Loading />
                        </span>

                    </div>

                ) : data.length === 0 ? (

                    <div className="transportation-financial-chart-empty">

                        <FaChartLine />

                        <span>
                            No hay información suficiente
                            para mostrar la gráfica.
                        </span>

                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 20,
                                left: 10,
                                bottom: 10
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />


                            <XAxis
                                dataKey="label"
                                tick={{
                                    fontSize: 12
                                }}
                                tickLine={false}
                                axisLine={false}
                            />


                            <YAxis
                                tickFormatter={
                                    formatAxisValue
                                }
                                tick={{
                                    fontSize: 12
                                }}
                                tickLine={false}
                                axisLine={false}
                                width={70}
                            />


                            <Tooltip
                                formatter={
                                    tooltipFormatter
                                }
                                content={
                                    renderTooltip
                                }
                            />


                            <Legend />


                            {/* =====================================
                                GROSS SALES
                            ====================================== */}

                            <Line
                                type="monotone"
                                dataKey="grossSales"
                                name="Ventas brutas"
                                stroke="#08204B"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 5
                                }}
                            />


                            {/* =====================================
                                DISCOUNTS
                            ====================================== */}

                            <Line
                                type="monotone"
                                dataKey="discounts"
                                name="Descuentos"
                                stroke="#829CB0"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 5
                                }}
                            />


                            {/* =====================================
                                TAXES
                            ====================================== */}

                            <Line
                                type="monotone"
                                dataKey="taxes"
                                name="Impuestos"
                                stroke="#5B2D8B"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{
                                    r: 5
                                }}
                            />


                            {/* =====================================
                                TOTAL
                            ====================================== */}

                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Total"
                                stroke="#1F7A5A"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                    r: 5
                                }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                )}

            </div>

        </section>
    );
};


export default TransportationFinancialChart;