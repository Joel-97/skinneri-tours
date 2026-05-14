import React from "react";

import {
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineTruck
} from "react-icons/hi2";

import KPICard from "./KPICard";

const KPIGrid = ({
  metrics,
  activeDrivers,
  formatearMoneda
}) => {

  return (

    <div className="kpi-grid-modern">

      <KPICard
        title="Reservas"
        value={metrics?.bookingsToday || 0}
        description="Servicios programados hoy"
        trend={metrics?.bookingsTrend}
        icon={<HiOutlineCalendarDays />}
      />

      <KPICard
        title="Ingresos"
        value={formatearMoneda(metrics?.revenueToday)}
        description="Total generado hoy"
        trend={metrics?.revenueTrend}
        type="success"
        icon={<HiOutlineBanknotes />}
      />

      <KPICard
        title="Sin asignar"
        value={metrics?.unassignedTrips || 0}
        description="Servicios requieren atención"
        type="danger"
        icon={<HiOutlineExclamationTriangle />}
      />

      <KPICard
        title="Choferes"
        value={activeDrivers || 0}
        description="Activos actualmente"
        type="warning"
        icon={<HiOutlineTruck />}
      />

    </div>

  );

};

export default KPIGrid;