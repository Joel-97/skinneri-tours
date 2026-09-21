import {
    Coins
} from "lucide-react";


const TransportationFinancialCurrencySelector = ({
    currencyOptions = [],
    selectedCurrency = "",
    onCurrencyChange
}) => {

    return (
        <section className="transportation-financial-currency">

            <div className="transportation-financial-currency-content">

                <div className="transportation-financial-currency-label">

                    <div className="transportation-financial-currency-icon">
                        <Coins
                            size={18}
                            strokeWidth={2}
                        />
                    </div>


                    <div>
                        <span className="transportation-financial-currency-title">
                            Moneda del reporte
                        </span>

                        <span className="transportation-financial-currency-description">
                            Los valores financieros se muestran en esta moneda
                        </span>
                    </div>

                </div>


                <div className="transportation-financial-currency-control">

                    <select
                        value={
                            selectedCurrency
                        }

                        onChange={
                            (event) =>
                                onCurrencyChange(
                                    event.target.value
                                )
                        }

                        aria-label="Moneda del reporte"
                    >

                        {currencyOptions.map(
                            (option) => (
                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

            </div>

        </section>
    );
};


export default TransportationFinancialCurrencySelector;