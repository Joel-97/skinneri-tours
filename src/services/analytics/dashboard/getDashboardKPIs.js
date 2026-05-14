import {
  calculateGrowthPercentage
} from "./calculateGrowthPercentage";

import {
  calculateReservationCommission
} from "./calculateReservationCommission";

// ======================================================
// GET DASHBOARD KPIS
// ======================================================

export const getDashboardKPIs = (
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
  // PENDING PAYMENTS
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
  // COMMISSIONS
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
  // CURRENT DATE
  // ====================================================

  const now =
    new Date();

  const currentMonth =
    now.getMonth();

  const currentYear =
    now.getFullYear();

  // ====================================================
  // PREVIOUS MONTH
  // ====================================================

  const previousMonthDate =
    new Date();

  previousMonthDate.setMonth(
    currentMonth - 1
  );

  const previousMonth =
    previousMonthDate.getMonth();

  // ====================================================
  // CURRENT MONTH RESERVATIONS
  // ====================================================

  const currentMonthReservations =
    reservations.filter(
      (reservation) => {

        if (!reservation.date)
          return false;

        const date =
          reservation.date.toDate
            ? reservation.date.toDate()
            : new Date(
                reservation.date
              );

        return (

          date.getMonth() ===
            currentMonth &&

          date.getFullYear() ===
            currentYear

        );

      }
    );

  // ====================================================
  // PREVIOUS MONTH RESERVATIONS
  // ====================================================

  const previousMonthReservations =
    reservations.filter(
      (reservation) => {

        if (!reservation.date)
          return false;

        const date =
          reservation.date.toDate
            ? reservation.date.toDate()
            : new Date(
                reservation.date
              );

        return (

          date.getMonth() ===
            previousMonth &&

          date.getFullYear() ===
            currentYear

        );

      }
    );

  // ====================================================
  // CURRENT MONTH REVENUE
  // ====================================================

  const currentRevenue =
    currentMonthReservations.reduce(

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
  // PREVIOUS MONTH REVENUE
  // ====================================================

  const previousRevenue =
    previousMonthReservations.reduce(

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
  // GROWTH
  // ====================================================

  const revenueGrowth =
    calculateGrowthPercentage(

      currentRevenue,

      previousRevenue

    );

  const reservationsGrowth =
    calculateGrowthPercentage(

      currentMonthReservations.length,

      previousMonthReservations.length

    );

  // ====================================================
  // CURRENT PENDING
  // ====================================================

  const currentPending =
    currentMonthReservations.reduce(

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
  // PREVIOUS PENDING
  // ====================================================

  const previousPending =
    previousMonthReservations.reduce(

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
  // PENDING GROWTH
  // ====================================================

  const pendingGrowth =
    calculateGrowthPercentage(

      currentPending,

      previousPending

    );

  // ====================================================
  // RETURN
  // ====================================================

  return {

    revenue:
      revenue.toFixed(2),

    revenueGrowth,

    reservations:
      reservations.length,

    reservationsGrowth,

    pending:
      pending.toFixed(2),

    pendingGrowth,

    commissions:
      commissions.toFixed(2)

  };

};