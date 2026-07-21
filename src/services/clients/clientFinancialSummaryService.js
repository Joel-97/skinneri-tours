/*
==========================================================
CLIENT FINANCIAL SUMMARY SERVICE
==========================================================
*/

/*
==========================================================
GET CLIENT FINANCIAL SUMMARY
==========================================================
*/

export function getClientFinancialSummary(

  activity = []

) {

  /*
  ==========================================================
  GROUP BY CURRENCY
  ==========================================================
  */

  const currencies = new Map();

  activity.forEach((item) => {

    const currencyCode =

      item.currencyCode || "";

    if (!currencyCode) {

      return;

    }

    if (!currencies.has(currencyCode)) {

      currencies.set(

        currencyCode,

        {

          currencyCode,

          currencySymbol:

            item.currencySymbol || "",

          total: 0,

          activities: 0

        }

      );

    }

    const summary = currencies.get(currencyCode);

    summary.total += Number(

      item.total || 0

    );

    summary.activities += 1;

  });

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return Array.from(

    currencies.values()

  ).sort(

    (a, b) =>

      a.currencyCode.localeCompare(

        b.currencyCode

      )

  );

}