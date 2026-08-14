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

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  /*
  ==========================================================
  LAST 7 DAYS RANGE
  ==========================================================

  Incluye:

  - Hoy
  - Ayer
  - 5 días anteriores

  Total: 7 días calendario.

  ==========================================================
  */

  const startDate = new Date(today);

  startDate.setDate(
    startDate.getDate() - 6
  );

  /*
  ==========================================================
  CURRENCIES
  ==========================================================
  */

  const currencies = new Map();

  /*
  ==========================================================
  CREATE DATE KEY
  ==========================================================
  */

  const formatDateKey = (date) => {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;

  };

  /*
  ==========================================================
  CREATE 7-DAY CHART
  ==========================================================

  Cada moneda tendrá exactamente 7 días.

  Esto permite mostrar correctamente días
  sin ingresos como 0.

  ==========================================================
  */

  const createEmptyChart = () => {

    const chart = new Map();

    for (let i = 0; i < 7; i++) {

      const date =
        new Date(startDate);

      date.setDate(
        startDate.getDate() + i
      );

      const key =
        formatDateKey(date);

      chart.set(

        key,

        {

          date: key,

          revenue: 0

        }

      );

    }

    return chart;

  };

  /*
  ==========================================================
  PROCESS RESERVATIONS
  ==========================================================
  */

  reservations.forEach((reservation) => {

    /*
    ========================================================
    CURRENCY
    ========================================================
    */

    const currencyCode =
      reservation.currency;

    if (!currencyCode) {

      return;

    }

    /*
    ========================================================
    RESERVATION DATE
    ========================================================
    */

    if (!reservation.date) {

      return;

    }

    const reservationDate =

      reservation.date?.toDate

        ? reservation.date.toDate()

        : new Date(reservation.date);

    /*
    ========================================================
    INVALID DATE
    ========================================================
    */

    if (

      Number.isNaN(
        reservationDate.getTime()
      )

    ) {

      return;

    }

    /*
    ========================================================
    DATE RANGE
    ========================================================

    Solo procesamos reservas dentro de los
    últimos 7 días calendario.

    ========================================================
    */

    const reservationDay =
      new Date(reservationDate);

    reservationDay.setHours(
      0,
      0,
      0,
      0
    );

    if (

      reservationDay < startDate ||

      reservationDay > today

    ) {

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

          chart:
            createEmptyChart()

        }

      );

    }

    const currency =
      currencies.get(currencyCode);

    /*
    ========================================================
    TOTAL
    ========================================================
    */

    const total =
      Number(
        reservation.total || 0
      );

    /*
    ========================================================
    TOTAL REVENUE
    ========================================================

    Solo ingresos de los últimos 7 días.

    ========================================================
    */

    currency.totalRevenue += total;

    /*
    ========================================================
    TOTAL RESERVATIONS
    ========================================================

    Solo reservas de los últimos 7 días.

    ========================================================
    */

    currency.totalReservations += 1;

    /*
    ========================================================
    TODAY REVENUE
    ========================================================
    */

    if (

      reservationDay.getTime() ===
      today.getTime()

    ) {

      currency.todayRevenue += total;

    }

    /*
    ========================================================
    CHART KEY
    ========================================================
    */

    const chartKey =
      formatDateKey(reservationDay);

    /*
    ========================================================
    ADD REVENUE TO DAY
    ========================================================
    */

    if (

      currency.chart.has(chartKey)

    ) {

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

        /*
        ====================================================
        CHART
        ====================================================
        */

        const chart =

          Array.from(

            currency.chart.values()

          );

        /*
        ====================================================
        AVERAGE TICKET
        ====================================================
        */

        const averageTicket =

          currency.totalReservations > 0

            ? currency.totalRevenue /
              currency.totalReservations

            : 0;

        /*
        ====================================================
        AVERAGE DAILY
        ====================================================

        Siempre se divide entre 7 porque el período
        representa 7 días calendario completos.

        Los días sin ingresos ya existen en chart
        con revenue = 0.

        ====================================================
        */

        const averageDaily =

          currency.totalRevenue / 7;

        /*
        ====================================================
        RETURN
        ====================================================
        */

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

          averageTicket,

          averageDaily,

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

    currencies:
      currencyList

  };

}