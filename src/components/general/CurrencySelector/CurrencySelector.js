/*
==========================================================
IMPORTS
==========================================================
*/

import React from "react";

import { useCurrency }

  from "../../../context/CurrencyContext";

import "./currencySelector.css";

/*
==========================================================
CURRENCY SELECTOR
==========================================================
*/

const CurrencySelector = () => {

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  const {

    currencies,

    selectedCurrency,

    selectCurrency,

    hasMultipleCurrencies

  } = useCurrency();

  /*
  ==========================================================
  HIDE
  ==========================================================
  */

  if (

    !hasMultipleCurrencies

  ) {

    return null;

  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="currency-selector">

      {

        currencies.map(

          (currency) => {

            const isActive =

              currency.currencyCode ===

              selectedCurrency?.currencyCode;

            return (

              <button

                key={

                  currency.currencyCode

                }

                type="button"

                className={

                  `currency-selector-button ${

                    isActive

                      ? "active"

                      : ""

                  }`

                }

                onClick={() =>

                  selectCurrency(

                    currency.currencyCode

                  )

                }

              >

                {

                  currency.currencyCode

                }

              </button>

            );

          }

        )

      }

    </div>

  );

};

export default CurrencySelector;