/*
==========================================================
FORMAT CURRENCY
==========================================================
*/

/*
==========================================================
FORMAT CURRENCY
==========================================================
*/

export function formatCurrency(

  value = 0,

  symbol = ""

) {

  const amount = Number(value);

  if (Number.isNaN(amount)) {

    return `${symbol}0.00`;

  }

  return `${symbol}${amount.toLocaleString(

    undefined,

    {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2

    }

  )}`;

}