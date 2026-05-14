import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { useAuth } from "../../context/AuthContext";

import "../../style/home/dashboard.css";

/* ======================================================
   SERVICES
====================================================== */

import {
  getDashboardMetrics,
  getUpcomingTrips,
  getLast7DaysRevenue,
  getActiveDrivers
} from "../../services/home/dashboardService";

/* ======================================================
   COMPONENTS
====================================================== */

import KPIGrid from "../../components/home/KPIGrid";

import UpcomingServicesWidget
  from "../../components/home/UpcomingServicesWidget";

import RevenueChartWidget
  from "../../components/home/RevenueChartWidget";

import AlertsWidget
  from "../../components/home/AlertsWidget";

import OperationsStatusWidget
  from "../../components/home/OperationsStatusWidget";

import MiniAgendaWidget
  from "../../components/home/MiniAgendaWidget";

/* ======================================================
   DASHBOARD HOME
====================================================== */

const DashboardHome = () => {

  const {
    company,
    companyId
  } = useAuth();

  const companyName =
    company?.name || "";

  /* ======================================================
     STATE
  ====================================================== */

  const [metrics, setMetrics] = useState(null);

  const [activeDrivers, setActiveDrivers] = useState(0);

  const [trips, setTrips] = useState([]);

  const [revenueData, setRevenueData] = useState([]);

  const [loading, setLoading] = useState(true);

  /* ======================================================
     PAGINATION
  ====================================================== */

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  /* ======================================================
     HELPERS
  ====================================================== */

  const obtenerSaludo = () => {

    const hora = new Date().getHours();

    if (hora < 12)
      return "Buenos días";

    if (hora < 18)
      return "Buenas tardes";

    return "Buenas noches";

  };

  const formatDateTime = (timestamp) => {

    if (!timestamp)
      return "-";

    return new Date(
      timestamp.seconds * 1000
    ).toLocaleString("es-CR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });

  };

  const formatearMoneda = (monto) => {

    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD"
      }
    ).format(monto || 0);

  };

  const capitalizar = (texto) => {

    if (!texto)
      return "";

    return (
      texto.charAt(0).toUpperCase() +
      texto.slice(1)
    );

  };

  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    if (!companyId)
      return;

    const loadData = async () => {

      try {

        setLoading(true);

        const [
          metricsData,
          tripsData,
          revenue7,
          driversData
        ] = await Promise.all([
          getDashboardMetrics(companyId),
          getUpcomingTrips(companyId),
          getLast7DaysRevenue(companyId),
          getActiveDrivers(companyId)
        ]);

        setMetrics(metricsData);
        console.log("metricsData", metricsData);

        setTrips(tripsData || []);

        setRevenueData(revenue7 || []);

        setActiveDrivers(driversData || 0);

      } catch (error) {

        console.error(
          "Error cargando dashboard:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, [companyId]);

  /* ======================================================
     RESET PAGINATION
  ====================================================== */

  useEffect(() => {

    setCurrentPage(1);

  }, [trips]);

  /* ======================================================
     PAGINATION LOGIC
  ====================================================== */

  const indexOfLast =
    currentPage * itemsPerPage;

  const indexOfFirst =
    indexOfLast - itemsPerPage;

  const currentTrips =
    trips.slice(indexOfFirst, indexOfLast);

  const totalPages =
    Math.ceil(trips.length / itemsPerPage);

  /* ======================================================
     SECONDARY KPIS
  ====================================================== */

  const secondaryKPIs = useMemo(() => {

    return [

      {
        title: "Confirmados",
        value: metrics?.confirmedTrips || 0
      },

      {
        title: "Pendientes",
        value: metrics?.pendingTrips || 0
      },

      {
        title: "Cancelados",
        value: metrics?.cancelledTrips || 0
      },

      {
        title: "Servicios Totales",
        value: trips?.length || 0
      }

    ];

  }, [metrics, trips]);

  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="dashboard-container">

      {/* =============================================
          HERO
      ============================================== */}

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">

            {obtenerSaludo()} 👋

          </h1>

          <p className="dashboard-subtitle">

            {

              companyName

                ? `Aquí tienes el resumen operativo de ${companyName} para hoy.`

                : "Aquí tienes el resumen operativo de tu empresa para hoy."

            }

          </p>

        </div>

      </div>

      {/* =============================================
          KPI GRID
      ============================================== */}

      <KPIGrid

        metrics={metrics}

        activeDrivers={activeDrivers}

        formatearMoneda={formatearMoneda}

      />

      {/* =============================================
          MAIN GRID
      ============================================== */}

      <div className="dashboard-main-grid">

        {/* =========================================
            LEFT COLUMN
        ========================================== */}

        <div className="dashboard-left-column">

          {/* =====================================
              UPCOMING SERVICES
          ====================================== */}

          <UpcomingServicesWidget

            loading={loading}

            trips={trips}

            currentTrips={currentTrips}

            currentPage={currentPage}

            totalPages={totalPages}

            setCurrentPage={setCurrentPage}

            formatDateTime={formatDateTime}

            capitalizar={capitalizar}

          />

          {/* =====================================
              REVENUE CHART
          ====================================== */}

          <RevenueChartWidget

            loading={loading}

            revenueData={revenueData}

            formatearMoneda={formatearMoneda}

          />

          {/* =====================================
              SECONDARY KPIS
          ====================================== */}

          {/* <div className="secondary-kpi-grid">

            {

              secondaryKPIs.map((item, index) => (

                <div

                  key={index}

                  className="secondary-kpi-card"

                >

                  <span>
                    {item.title}
                  </span>

                  <strong>
                    {item.value}
                  </strong>

                </div>

              ))

            }

          </div> */}

        </div>

        {/* =========================================
            RIGHT COLUMN
        ========================================== */}

        <div className="dashboard-right-column">

          {/* =====================================
              ALERTS
          ====================================== */}

          <AlertsWidget
            metrics={metrics}
          />

          {/* =====================================
              OPERATIONS
          ====================================== */}

          <OperationsStatusWidget

            metrics={metrics}

            activeDrivers={activeDrivers}

            formatearMoneda={formatearMoneda}

          />

          {/* =====================================
              MINI AGENDA
          ====================================== */}

          {/* <MiniAgendaWidget

            currentTrips={currentTrips}

            formatDateTime={formatDateTime}

          /> */}

        </div>

      </div>

    </div>

  );

};

export default DashboardHome;