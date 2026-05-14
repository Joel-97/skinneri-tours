import {
  calculateReservationCommission
} from "./calculateReservationCommission";

// ======================================================
// GET FINANCIAL SUMMARY
// ======================================================

export const getFinancialSummary = (
  reservations
) => {

  // ====================================================
  // TOTAL REVENUE
  // ====================================================

  const revenue =
    reservations.reduce(

      (sum, reservation) => {

        return (
          sum +
          Number(
            reservation.total || 0
          )
        );

      },

      0

    );

  // ====================================================
  // TOTAL TAXES
  // ====================================================

  const taxes =
    reservations.reduce(

      (sum, reservation) => {

        return (
          sum +
          Number(
            reservation.taxAmount || 0
          )
        );

      },

      0

    );

  // ====================================================
  // TOTAL PENDING
  // ====================================================

  const pending =
    reservations.reduce(

      (sum, reservation) => {

        const isPending =
          reservation.status !==
          "confirmed";

        if (!isPending)
          return sum;

        return (
          sum +
          Number(
            reservation.total || 0
          )
        );

      },

      0

    );

    // ====================================================
    // TOTAL COMMISSIONS
    // ====================================================

    const commissions =
    reservations.reduce(

        (sum, reservation) => {

        return (

            sum +

            calculateReservationCommission(
            reservation
            )

        );

        },

        0

    );

  // ====================================================
  // RETURN
  // ====================================================

  return [

    {
      label:
        "Ingresos Totales",
      value:
        `$${revenue.toFixed(2)}`
    },

    {
      label:
        "Impuestos",
      value:
        `$${taxes.toFixed(2)}`
    },

    {
      label:
        "Pagos Pendientes",
      value:
        `$${pending.toFixed(2)}`
    },
    {
        label:
            "Comisiones",
        value:
            `$${commissions.toFixed(2)}`
    },
    {
      label:
        "Reservas",
      value:
        `${reservations.length}`
    }

  ];

};