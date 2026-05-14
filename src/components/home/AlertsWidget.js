import React from "react";

import {
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineInbox,
  HiOutlineCheckCircle
} from "react-icons/hi2";

import DashboardWidget from "./DashboardWidget";

const AlertsWidget = ({ metrics }) => {

  const alerts = [];

  if ((metrics?.unassignedTrips || 0) > 0) {

    alerts.push({
      type: "warning",
      icon: <HiOutlineExclamationTriangle />,
      text: `${metrics?.unassignedTrips} servicios requieren asignación`
    });

  }

  if ((metrics?.pendingTrips || 0) > 0) {

    alerts.push({
      type: "info",
      icon: <HiOutlineClock />,
      text: `${metrics?.pendingTrips} servicios pendientes`
    });

  }

  if ((metrics?.bookingsToday || 0) === 0) {

    alerts.push({
      type: "neutral",
      icon: <HiOutlineInbox />,
      text: `No hay reservas programadas hoy`
    });

  }

  if (
    (metrics?.unassignedTrips || 0) === 0 &&
    (metrics?.bookingsToday || 0) > 0
  ) {

    alerts.push({
      type: "success",
      icon: <HiOutlineCheckCircle />,
      text: `Todo opera con normalidad`
    });

  }

  return (

    <DashboardWidget
      title="Alertas Operativas"
      subtitle="Estado general de operación"
    >

      <div className="alerts-widget-list">

        {
          alerts.map((alert, index) => (

            <div
              key={index}
              className={`alert-card-modern ${alert.type}`}
            >

              <div className="alert-card-icon">
                {alert.icon}
              </div>

              <div className="alert-card-content">
                {alert.text}
              </div>

            </div>

          ))
        }

      </div>

    </DashboardWidget>

  );

};

export default AlertsWidget;