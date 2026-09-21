import {
    FaChartLine,
    FaReceipt,
    FaPercent,
    FaMoneyBillWave,
    FaCalculator,
    FaUsers
} from "react-icons/fa";


const SUMMARY_ICONS = {
    grossSales: FaChartLine,
    discounts: FaReceipt,
    taxes: FaPercent,
    commissions: FaMoneyBillWave,
    total: FaCalculator
};


const SUMMARY_CARD_CLASSES = {
    grossSales: "gross-sales",
    discounts: "discounts",
    taxes: "taxes",
    commissions: "commissions",
    total: "total"
};


const TransportationFinancialSummary = ({
    summaryCards = [],
    reservationCountLabel = "0",
    passengerCountLabel = "0"
}) => {

    return (
        <section className="transportation-financial-summary">

            {/* =====================================================
                MAIN SUMMARY CARDS
            ====================================================== */}

            <div className="transportation-financial-summary-main">

                {summaryCards.map((card) => {

                    const Icon =
                        SUMMARY_ICONS[card.key] ||
                        FaCalculator;

                    const cardClass =
                        SUMMARY_CARD_CLASSES[card.key] ||
                        "";

                    return (
                        <div
                            key={card.key}
                            className={[
                                "transportation-financial-summary-card",
                                cardClass
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >

                            <div className="transportation-financial-summary-card-content">

                                <div className="transportation-financial-summary-card-text">

                                    <span className="transportation-financial-summary-card-label">
                                        {card.label}
                                    </span>

                                    <strong className="transportation-financial-summary-card-value">
                                        {card.value}
                                    </strong>

                                </div>


                                <div className="transportation-financial-summary-card-icon">
                                    <Icon />
                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>


            {/* =====================================================
                SECONDARY SUMMARY
            ====================================================== */}

            <div className="transportation-financial-summary-secondary">

                {/* =================================================
                    RESERVATIONS
                ================================================== */}

                <div className="transportation-financial-summary-secondary-card">

                    <div className="transportation-financial-summary-secondary-icon">
                        <FaReceipt />
                    </div>


                    <div>

                        <span className="transportation-financial-summary-secondary-label">
                            Reservaciones
                        </span>

                        <strong className="transportation-financial-summary-secondary-value">
                            {reservationCountLabel}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    PASSENGERS
                ================================================== */}

                <div className="transportation-financial-summary-secondary-card">

                    <div className="transportation-financial-summary-secondary-icon">
                        <FaUsers />
                    </div>


                    <div>

                        <span className="transportation-financial-summary-secondary-label">
                            Pasajeros
                        </span>

                        <strong className="transportation-financial-summary-secondary-value">
                            {passengerCountLabel}
                        </strong>

                    </div>

                </div>

            </div>

        </section>
    );
};


export default TransportationFinancialSummary;