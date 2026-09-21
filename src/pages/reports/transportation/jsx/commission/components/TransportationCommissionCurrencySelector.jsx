import {
    Coins
} from "lucide-react";


const TransportationCommissionCurrencySelector = ({
    currencyOptions = [],
    selectedCurrency = "USD",
    onCurrencyChange
}) => {

    const safeCurrencyOptions =
        Array.isArray(currencyOptions)
            ? currencyOptions
            : [];


    const handleCurrencyChange = (
        event
    ) => {

        const value =
            event.target.value;


        if (
            typeof onCurrencyChange ===
            "function"
        ) {
            onCurrencyChange(value);
        }
    };


    return (
        <section className="transportation-commission-currency">

            <div className="transportation-commission-currency-content">

                {/* ==================================================
                    LABEL
                ================================================== */}

                <div className="transportation-commission-currency-label">

                    <div className="transportation-commission-currency-icon">

                        <Coins
                            size={18}
                            strokeWidth={2}
                        />

                    </div>


                    <div className="transportation-commission-currency-text">

                        <span className="transportation-commission-currency-title">

                            Moneda del reporte

                        </span>


                        <span className="transportation-commission-currency-description">

                            Los valores financieros se muestran en esta moneda

                        </span>

                    </div>

                </div>


                {/* ==================================================
                    SELECT
                ================================================== */}

                <div className="transportation-commission-currency-control">

                    <select
                        value={
                            selectedCurrency ||
                            "USD"
                        }
                        onChange={
                            handleCurrencyChange
                        }
                        aria-label="Moneda del reporte"
                    >

                        {
                            safeCurrencyOptions.map(
                                (option) => {

                                    const value =
                                        typeof option ===
                                        "string"
                                            ? option
                                            : option?.value;

                                    const label =
                                        typeof option ===
                                        "string"
                                            ? option
                                            : option?.label;


                                    if (!value) {
                                        return null;
                                    }


                                    return (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {
                                                label ||
                                                value
                                            }
                                        </option>
                                    );

                                }
                            )
                        }

                    </select>

                </div>

            </div>

        </section>
    );
};


export default TransportationCommissionCurrencySelector;