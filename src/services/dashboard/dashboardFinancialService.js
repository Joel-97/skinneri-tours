/*
==========================================================
DASHBOARD FINANCIAL SERVICE
==========================================================
*/

/*
==========================================================
GET DASHBOARD FINANCIAL METRICS
==========================================================
*/

export function getDashboardFinancialMetrics(

  reservations = []

) {

  /*
  ==========================================================
  TODAY
  ==========================================================
  */

  const todayString =

    new Date()

      .toLocaleDateString(

        "sv-SE"

      );

  /*
  ==========================================================
  CURRENCIES
  ==========================================================
  */

  const currencies = new Map();

  /*
  ==========================================================
  PROCESS RESERVATIONS
  ==========================================================
  */

  reservations.forEach((reservation) => {

    const currencyCode =

      reservation.currency;

    if (!currencyCode) {

      return;

    }

    /*
    ========================================================
    CREATE CURRENCY
    ========================================================
    */

    if (!currencies.has(currencyCode)) {

      currencies.set(

        currencyCode,

        {

          currencyCode,

          currencySymbol:

            reservation.symbol || "",

          totalRevenue: 0,

          todayRevenue: 0,

          totalReservations: 0,

          averageTicket: 0,

          averageDaily: 0,

          chart: new Map()

        }

      );

    }

    const currency =

      currencies.get(currencyCode);

    const total = Number(

      reservation.total || 0

    );

    /*
    ========================================================
    TOTALS
    ========================================================
    */

    currency.totalRevenue += total;

    currency.totalReservations++;

    /*
    ========================================================
    TODAY

    Se compara utilizando dateString para evitar
    problemas de zona horaria.
    ========================================================
    */

    if (

      reservation.dateString ===

      todayString

    ) {

      currency.todayRevenue += total;

    }

    /*
    ========================================================
    CHART
    ========================================================
    */

    const chartKey =

      reservation.dateString ||

      "";

    if (chartKey) {

      if (

        !currency.chart.has(chartKey)

      ) {

        currency.chart.set(

          chartKey,

          {

            date: chartKey,

            revenue: 0

          }

        );

      }

      currency.chart

        .get(chartKey)

        .revenue += total;

    }

  });

  /*
  ==========================================================
  FINALIZE
  ==========================================================
  */

  const currencyList =

    Array.from(

      currencies.values()

    )

      .map((currency) => {

        const chart =

          Array.from(

            currency.chart.values()

          )

            .sort(

              (a, b) =>

                a.date.localeCompare(

                  b.date

                )

            )

            .slice(-7);

        return {

          currencyCode:

            currency.currencyCode,

          currencySymbol:

            currency.currencySymbol,

          totalRevenue:

            currency.totalRevenue,

          todayRevenue:

            currency.todayRevenue,

          totalReservations:

            currency.totalReservations,

          averageTicket:

            currency.totalReservations > 0

              ? currency.totalRevenue /

                currency.totalReservations

              : 0,

          averageDaily:

            chart.length > 0

              ? chart.reduce(

                  (sum, day) =>

                    sum + day.revenue,

                  0

                ) /

                chart.length

              : 0,

          chart

        };

      })

      .sort(

        (a, b) =>

          a.currencyCode.localeCompare(

            b.currencyCode

          )

      );

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return {

    currencies: currencyList

  };

}