import {
  filterReservationsByDate
} from "../../services/analytics/dashboard/filterReservationsByDate";

import {
  getDashboardKPIs
} from "../../services/analytics/dashboard/getDashboardKPIs";

import {
  getRevenueTrend
} from "../../services/analytics/dashboard/getRevenueTrend";

import {
  getPaymentMethods
} from "../../services/analytics/dashboard/getPaymentMethods";

import {
  getRecentActivity
} from "../../services/analytics/dashboard/getRecentActivity";

import {
  getTopDrivers
} from "../../services/analytics/dashboard/getTopDrivers";

import {
  getTopActivities
} from "../../services/analytics/dashboard/getTopActivities";

import {
  getFinancialSummary
} from "../../services/analytics/dashboard/getFinancialSummary";

import {
  getDashboardInsights
} from "../../services/analytics/dashboard/getDashboardInsights";

import {
  getTopRoutes
} from "../../services/analytics/dashboard/getTopRoutes";

import {
  getTopOperators
} from "../../services/analytics/dashboard/getTopOperators";

import {
  getTopDestinations
} from "../../services/analytics/dashboard/getTopDestinations";

// ======================================================
// GET DASHBOARD ANALYTICS
// ======================================================

export const getDashboardAnalytics = async ({

  reservationsData = [],

  dateFilter = "month",

  analyticsView = "general"

}) => {

  try {

    // ==================================================
    // RESERVATIONS CACHE
    // ==================================================

    const reservations =
      reservationsData;

    // ==================================================
    // FILTER BY DATE
    // ==================================================

    const filteredReservations =
      filterReservationsByDate(

        reservations,

        dateFilter

      );

    // ==================================================
    // CONTEXT FILTER
    // ==================================================

    let scopedReservations =
      filteredReservations;

    // ================================================
    // TRANSPORTATION
    // ================================================

    if (
      analyticsView ===
      "transportation"
    ) {

      scopedReservations =
        filteredReservations.filter(

          (reservation) =>

            reservation.serviceCategory ===
            "transportation" ||

            reservation.serviceCategory ===
            "transport"

        );

    }

    // ================================================
    // ADVENTURE
    // ================================================

    if (
      analyticsView ===
      "adventure"
    ) {

      scopedReservations =
        filteredReservations.filter(

          (reservation) =>

            reservation.serviceCategory ===
            "adventure"

        );

    }

    // ==================================================
    // BUILD ANALYTICS
    // ==================================================

    const kpis =
      getDashboardKPIs(
        scopedReservations
      );

    const revenueTrend =
      getRevenueTrend(
        scopedReservations
      );

    const paymentMethods =
      getPaymentMethods(
        scopedReservations
      );

    const recentActivity =
      getRecentActivity(
        scopedReservations
      );

    const topDrivers =
      getTopDrivers(
        scopedReservations
      );

    const topOperators =
      getTopOperators(
        scopedReservations
      );

    const topActivities =
      getTopActivities(
        scopedReservations
      );

    const topRoutes =
      getTopRoutes(
        scopedReservations
      );

    const topDestinations =
      getTopDestinations(
        scopedReservations
      );

    const financialSummary =
      getFinancialSummary(
        scopedReservations
      );

    // ==================================================
    // INSIGHTS
    // ==================================================

    const insights =
      getDashboardInsights({

        kpis,

        paymentMethods,

        topActivities,

        topDrivers

      });

    // ==================================================
    // RETURN
    // ==================================================

    return {

      kpis,

      revenueTrend,

      paymentMethods,

      recentActivity,

      topDrivers,

      topOperators,

      topActivities,

      topRoutes,

      topDestinations,

      financialSummary,

      insights

    };

  } catch (error) {

    console.error(

      "Error cargando analíticas:",

      error

    );

    throw error;

  }

};