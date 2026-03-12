import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../style/home/dashboard.css";
import {
  getDashboardMetrics,
  getUpcomingTrips,
  getLast7DaysRevenue,
  getActiveDrivers
} from "../../services/home/dashboardService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const DashboardHome = () => {

  const { adminData } = useAuth();
  const companyId = adminData?.companyId;
  const nombreEmpresa = adminData?.companyName || "";

  const [metrics, setMetrics] = useState(null);
  const [activeDrivers, setActiveDrivers] = useState(null);
  const [trips, setTrips] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     Helpers
  =============================== */

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";

    return new Date(timestamp.seconds * 1000).toLocaleString("es-CR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

    const formatearMoneda = (monto) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(monto || 0);
    };

  const capitalizar = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  /* ===============================
     Load Data
  =============================== */

  useEffect(() => {
    if (!companyId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const metricsData = await getDashboardMetrics(companyId);
        const tripsData = await getUpcomingTrips(companyId);
        const revenue7 = await getLast7DaysRevenue(companyId);
        const activeDrivers = await getActiveDrivers(companyId);

        console.log(activeDrivers);


        setMetrics(metricsData);
        setActiveDrivers(activeDrivers);
        setTrips(tripsData);
        setRevenueData(revenue7);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [companyId]);

  return (
    <div className="dashboard-container">

      {/* ================= HEADER ================= */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {obtenerSaludo()} 👋
        </h1>
        <p className="dashboard-subtitle">
          {nombreEmpresa
            ? `Aquí tienes el resumen de ${nombreEmpresa} para hoy.`
            : "Aquí tienes el resumen de tu empresa para hoy."}
        </p>
      </div>

      {/* ================= KPI ================= */}
      {loading ? (
        <div className="kpi-grid">
          <div className="kpi-card skeleton skeleton-card"></div>
          <div className="kpi-card skeleton skeleton-card"></div>
          <div className="kpi-card skeleton skeleton-card"></div>
          <div className="kpi-card skeleton skeleton-card"></div>
        </div>
      ) : (
        <div className="kpi-grid">

          <div className="kpi-card">
            <h3>Reservas de Hoy</h3>
            <p>{metrics?.bookingsToday || 0}</p>
            <span className="kpi-description">
              Servicios programados para hoy
            </span>
          </div>

          <div className="kpi-card">
            <h3>Ingresos de Hoy</h3>
            <p>{formatearMoneda(metrics?.revenueToday)}</p>
            <span className="kpi-description">
              Total generado hoy
            </span>
          </div>

          <div className="kpi-card">
            <h3>Servicios sin Asignar</h3>
            <p className={metrics?.unassignedTrips > 0 ? "danger" : ""}>
              {metrics?.unassignedTrips || 0}
            </p>
            <span className="kpi-description">
              Pendientes de asignar chofer
            </span>
          </div>

          <div className="kpi-card">
            <h3>Choferes Activos</h3>
            <p>{activeDrivers || 0}</p>
            <span className="kpi-description">
              Choferes activos hoy
            </span>
          </div>

        </div>
      )}

      {/* ================= PRÓXIMOS SERVICIOS ================= */}
      <div className="table-section">
        <h2>Próximos Servicios</h2>

        {loading ? (
          <>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
            <div className="skeleton skeleton-table-row"></div>
          </>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <p>No hay servicios programados próximamente 🎉</p>
          </div>
        ) : (
          <table className="trips-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Tipo de servicio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {trips.map((trip) => {
                const status = trip.status || "pendiente";

                return (
                  <tr key={trip.id}>
                    <td>{formatDateTime(trip.date)}</td>
                    <td>{trip.clientName || "-"}</td>
                    <td>{trip.serviceTypeName || "-"}</td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {capitalizar(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= GRÁFICO ================= */}
      <div className="chart-section">
        <h2>Ingresos – Últimos 7 Días</h2>

        {loading ? (
          <div className="skeleton skeleton-chart"></div>
        ) : revenueData.length === 0 ? (
          <div className="empty-state">
            <p>No hay datos suficientes para mostrar el gráfico.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};

export default DashboardHome;