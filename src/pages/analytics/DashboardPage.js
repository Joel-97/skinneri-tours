import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

import DashboardGrid from "../../analytics/components/DashboardGrid";
import AnalyticsCard from "../../analytics/components/AnalyticsCard";
import DashboardDateFilter from "../../analytics/components/DashboardDateFilter";
import RevenueTrendChart from "../../analytics/charts/RevenueTrendChart";
import PaymentMethodsChart from "../../analytics/charts/PaymentMethodsChart";
import RecentActivityCard from "../../analytics/components/RecentActivityCard";
import TopPerformanceCard from "../../analytics/components/TopPerformanceCard";
import FinancialSummaryCard from "../../analytics/components/FinancialSummaryCard";
import DashboardInsightsCard from "../../analytics/components/DashboardInsightsCard";
import TopDestinationsChart from "../../analytics/charts/TopDestinationsChart";
import { getDashboardAnalytics } from "../../services/analytics/dashboardAnalyticsService";
import { getAllReservations } from "../../services/analytics/dashboard/getAllReservations";
import AnalyticsSidebar from "../../analytics/components/AnalyticsSidebar";
import Loading from "../../components/general/loading";

import "../../analytics/styles/analytics.css";
import "../../style/analytics/dashboardPage.css";

const DashboardPage = () => {

  // ====================================================
  // AUTH
  // ====================================================

  const { session } = useAuth();

  const companyId = session?.company?.id;

  // ====================================================
  // CACHE KEY
  // ====================================================

  const cacheKey =
    `dashboard-reservations-${companyId}`;

  const CACHE_TTL =
    1000 * 60 * 5;

  // ====================================================
  // DATE FILTER
  // ====================================================

  const [
    dateFilter,
    setDateFilter
  ] = useState("month");

  // ====================================================
  // ANALYTICS VIEW
  // ====================================================

  const [
    analyticsView,
    setAnalyticsView
  ] = useState("general");

  // ====================================================
  // ANALYTICS
  // ====================================================

  const [
    analytics,
    setAnalytics
  ] = useState(null);

  // ====================================================
  // RESERVATIONS CACHE
  // ====================================================

  const [
    allReservations,
    setAllReservations
  ] = useState([]);

  // ====================================================
  // LOADING STATES
  // ====================================================

  const [
    loadingReservations,
    setLoadingReservations
  ] = useState(true);

  const [
    loadingAnalytics,
    setLoadingAnalytics
  ] = useState(true);

  // ====================================================
  // GLOBAL LOADING
  // ====================================================

  const loading =
    loadingReservations ||
    loadingAnalytics;

  // ====================================================
  // FILTER LABELS
  // ====================================================

  const filterLabels = {

    today:
      "Hoy",

    week:
      "Esta semana",

    month:
      "Este mes",

    quarter:
      "Este trimestre",

    year:
      "Este año"

  };

  // ====================================================
  // CONTEXT LABELS
  // ====================================================

  const contextLabels = {

    // ==============================================
    // GENERAL
    // ==============================================

    general: {

      heroTitle:
        "Analíticas de negocio",

      heroDescription:

        "Visualiza ingresos, tendencias, operaciones y rendimiento general de tu empresa.",

      revenueChart:
        "Tendencia de ingresos",

      topLeft:
        "Top Conductores",

      topRight:
        "Top Actividades"

    },

    // ==============================================
    // TRANSPORTATION
    // ==============================================

    transportation: {

      heroTitle:
        "Analíticas de transportes",

      heroDescription:

        "Monitorea rutas, ingresos, reservas y rendimiento operativo del módulo de transportes.",

      revenueChart:
        "Ingresos de transportes",

      topLeft:
        "Top Conductores",

      topRight:
        "Top Rutas"

    },

    // ==============================================
    // ADVENTURE
    // ==============================================

    adventure: {

      heroTitle:
        "Analíticas de aventuras",

      heroDescription:

        "Analiza actividades, tours, ingresos y rendimiento del módulo de aventuras.",

      revenueChart:
        "Ingresos de aventuras",

      topLeft:
        "Top Operadores",

      topRight:
        "Top Actividades"

    }

  };

  // ====================================================
  // ACTIVE CONTEXT
  // ====================================================

  const activeContext =
    contextLabels[
      analyticsView
    ];

  // ====================================================
  // LOAD RESERVATIONS
  // ====================================================

  useEffect(() => {

    if (!companyId)
      return;

    const loadReservations =
      async () => {

        try {

          setLoadingReservations(
            true
          );

          // ==========================================
          // LOCAL CACHE
          // ==========================================

          const cachedData =
            localStorage.getItem(
              cacheKey
            );

          let cacheValid =
            false;

          if (cachedData) {

            try {

              const parsed =
                JSON.parse(
                  cachedData
                );

              // ======================================
              // VALIDATE TTL
              // ======================================

              const now =
                Date.now();

              const cacheAge =
                now -
                parsed.updatedAt;

              cacheValid =
                cacheAge <
                CACHE_TTL;

              // ======================================
              // VALID CACHE
              // ======================================

              if (cacheValid) {

                setAllReservations(
                  parsed.reservations || []
                );

                setLoadingReservations(
                  false
                );

              }

            } catch (error) {

              console.error(
                "Error parsing cache:",
                error
              );

            }

          }

          // ==========================================
          // FIRESTORE REFRESH
          // ==========================================

          const reservations =
            await getAllReservations(
              companyId
            );

          // ==========================================
          // UPDATE STATE
          // ==========================================

          setAllReservations(
            reservations
          );

          // ==========================================
          // UPDATE CACHE
          // ==========================================

          localStorage.setItem(

            cacheKey,

            JSON.stringify({

              updatedAt:
                Date.now(),

              reservations

            })

          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoadingReservations(
            false
          );

        }

      };

    loadReservations();

  }, [

    companyId,

    cacheKey

  ]);

  // ====================================================
  // LOAD ANALYTICS
  // ====================================================

  useEffect(() => {

    if (!companyId)
      return;

    if (
      loadingReservations
    ) {

      return;

    }

    const loadAnalytics =
      async () => {

        try {

          setLoadingAnalytics(
            true
          );

          // ==========================================
          // ANALYTICS ENGINE
          // ==========================================

          const data =
            await getDashboardAnalytics({

              reservationsData:
                allReservations,

              dateFilter,

              analyticsView

            });

          // ==========================================
          // UPDATE STATE
          // ==========================================

          setAnalytics(data);

        } catch (error) {

          console.error(error);

        } finally {

          setLoadingAnalytics(
            false
          );

        }

      };

    loadAnalytics();

  }, [

    allReservations,

    analyticsView,

    companyId,

    dateFilter,

    loadingReservations

  ]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (

      <div className="dashboard-page">

        <Loading />

      </div>

    );

  }

  // ====================================================
  // SAFE FALLBACK
  // ====================================================

  const kpis =
    analytics?.kpis || {};

  return (
    <div className="analytics-layout">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <AnalyticsSidebar

        value={analyticsView}

        onChange={
          setAnalyticsView
        }

      />

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="dashboard-page">

        {/* =========================================
            HERO
        ========================================= */}

        <div className="dashboard-hero">

          {/* =====================================
              LEFT
          ===================================== */}

          <div className="dashboard-hero-left">

            <div className="dashboard-badge">

              Dashboard Analytics

            </div>

            <h1>
              {
                activeContext.heroTitle
              }
            </h1>

            <p>
              {
                activeContext.heroDescription
              }
            </p>

          </div>

          {/* =====================================
              RIGHT
          ===================================== */}

          <div className="dashboard-hero-right">

            <DashboardDateFilter
              value={dateFilter}
              onChange={setDateFilter}
            />

          </div>

        </div>

        {/* =========================================
            KPI GRID
        ========================================= */}

        <div className="dashboard-kpi-section">

          <DashboardGrid>

            <AnalyticsCard

              title="Ingresos"

              value={`$${kpis.revenue || 0}`}

              subtitle={
                filterLabels[dateFilter]
              }

              trend={
                dateFilter === "month"
                  ? kpis.revenueGrowth || 0
                  : null
              }

            />

            <AnalyticsCard

              title="Reservas"

              value={
                kpis.reservations || 0
              }

              subtitle="Completadas"

              trend={
                dateFilter === "month"
                  ? kpis.reservationsGrowth || 0
                  : null
              }

              accent="#2563eb"

            />

            <AnalyticsCard

              title="Pendiente"

              value={`$${kpis.pending || 0}`}

              subtitle="Pagos pendientes"

              trend={
                dateFilter === "month"
                  ? kpis.pendingGrowth || 0
                  : null
              }

              accent="#dc2626"

            />

            <AnalyticsCard

              title="Comisiones"

              value={`$${kpis.commissions || 0}`}

              subtitle="Generadas"

              trend={null}

              accent="#7c3aed"

            />

          </DashboardGrid>

        </div>

        {/* =========================================
            PRIMARY GRID
        ========================================= */}

        <div className="dashboard-primary-grid">

          {/* =====================================
              REVENUE
          ===================================== */}

          <div className="dashboard-primary-card">

            <RevenueTrendChart

              data={
                analytics?.revenueTrend || []
              }

              title={
                activeContext.revenueChart
              }

            />

          </div>

          {/* =====================================
              INSIGHTS
          ===================================== */}

          <div className="dashboard-primary-card dashboard-primary-card-scroll">

            <DashboardInsightsCard

              insights={
                analytics?.insights || []
              }

            />

          </div>

          {/* =====================================
              PAYMENT / DESTINATIONS
          ===================================== */}

          <div className="dashboard-primary-card">

            {

              analyticsView ===
              "transportation"

                ? (

                  <TopDestinationsChart

                    data={
                      analytics?.topDestinations || []
                    }

                  />

                )

                : (

                  <PaymentMethodsChart

                    data={
                      analytics?.paymentMethods || []
                    }

                  />

                )

            }

          </div>

        </div>

        {/* =========================================
            PERFORMANCE GRID
        ========================================= */}

        <div className="dashboard-performance-grid">

          {/* =====================================
              TOP LEFT
          ===================================== */}

          <TopPerformanceCard

            title={
              activeContext.topLeft
            }

            items={

              analyticsView ===
              "adventure"

                ? analytics?.topOperators || []

                : analytics?.topDrivers || []

            }

          />

          {/* =====================================
              TOP RIGHT
          ===================================== */}

          {

            analyticsView !==
            "transportation" && (

              <TopPerformanceCard

                title={
                  activeContext.topRight
                }

                items={

                  analyticsView ===
                  "transportation"

                    ? analytics?.topRoutes || []

                    : analytics?.topActivities || []

                }

              />

            )

          }

        </div>

        {/* =========================================
            BOTTOM GRID
        ========================================= */}

        <div className="dashboard-bottom-grid">

          <FinancialSummaryCard

            items={
              analytics?.financialSummary || []
            }

          />

          <RecentActivityCard

            items={
              analytics?.recentActivity || []
            }

          />

        </div>

      </div>

    </div>
  );

};

export default DashboardPage;