import {
    CircleDollarSign
} from "lucide-react";


const TransportationCommissionSummary = ({
    summaryCards = []
}) => {

    return (
        <section className="transportation-commission-summary">

            {/* ==================================================
                MAIN SUMMARY
            ================================================== */}

            <div className="transportation-commission-summary-main">

                {
                    summaryCards.map(
                        (card, index) => {

                            const Icon =
                                card.icon ||
                                CircleDollarSign;


                            return (
                                <article
                                    key={
                                        card.key ||
                                        card.label ||
                                        index
                                    }
                                    className={
                                        `transportation-commission-summary-card ${
                                            card.type
                                                ? `transportation-commission-summary-card--${card.type}`
                                                : ""
                                        }`
                                    }
                                >

                                    {/* ==================================================
                                        ICON
                                    ================================================== */}

                                    <div className="transportation-commission-summary-card-icon">

                                        <Icon
                                            size={18}
                                            strokeWidth={2}
                                        />

                                    </div>


                                    {/* ==================================================
                                        CONTENT
                                    ================================================== */}

                                    <div className="transportation-commission-summary-card-content">

                                        <span className="transportation-commission-summary-card-label">

                                            {
                                                card.label ||
                                                "-"
                                            }

                                        </span>


                                        <strong className="transportation-commission-summary-card-value">

                                            {
                                                card.value ??
                                                "0"
                                            }

                                        </strong>

                                    </div>

                                </article>
                            );

                        }
                    )
                }

            </div>

        </section>
    );
};


export default TransportationCommissionSummary;