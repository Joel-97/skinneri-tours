/*
==========================================================
IMPORTS
==========================================================
*/

import {

  createContext,
  useContext,
  useMemo,
  useState,
  useEffect

} from "react";

/*
==========================================================
CONTEXT
==========================================================
*/

const CurrencyContext =

  createContext(null);

/*
==========================================================
PROVIDER
==========================================================
*/

export function CurrencyProvider({

  currencies = [],
  children

}) {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    selectedCurrency,

    setSelectedCurrency

  ] = useState(null);

  /*
  ==========================================================
  INITIALIZE
  ==========================================================
  */

  useEffect(() => {

    if (

      currencies.length === 0

    ) {

      setSelectedCurrency(null);

      return;

    }

    const exists =

      currencies.some(

        (currency) =>

          currency.currencyCode ===

          selectedCurrency?.currencyCode

      );

    if (!exists) {

      setSelectedCurrency(

        currencies[0]

      );

    }

  }, [

    currencies,
    selectedCurrency

  ]);

  /*
  ==========================================================
  HELPERS
  ==========================================================
  */

  const selectCurrency = (

    currencyCode

  ) => {

    const currency =

      currencies.find(

        (item) =>

          item.currencyCode ===

          currencyCode

      );

    if (currency) {

      setSelectedCurrency(

        currency

      );

    }

  };

  /*
  ==========================================================
  VALUE
  ==========================================================
  */

  const value =

    useMemo(

      () => ({

        currencies,

        selectedCurrency,

        setSelectedCurrency,

        selectCurrency,

        hasMultipleCurrencies:

          currencies.length > 1

      }),

      [

        currencies,

        selectedCurrency

      ]

    );

  /*
  ==========================================================
  PROVIDER
  ==========================================================
  */

  return (

    <CurrencyContext.Provider

      value={value}

    >

      {children}

    </CurrencyContext.Provider>

  );

}

/*
==========================================================
HOOK
==========================================================
*/

export function useCurrency() {

  const context =

    useContext(

      CurrencyContext

    );

  if (!context) {

    throw new Error(

      "useCurrency must be used within a CurrencyProvider."

    );

  }

  return context;

}