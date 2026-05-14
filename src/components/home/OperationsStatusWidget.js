import React from "react";

import DashboardWidget from "./DashboardWidget";

const OperationsStatusWidget = ({
  metrics,
  activeDrivers,
  formatearMoneda
}) => {

  return (

    <DashboardWidget
      title="Estado Operativo"
      subtitle="Resumen operacional actual"
    >

      <div className="operations-status-list">

        <div className="operations-status-item">

          <span>
            Servicios hoy
          </span>

          <strong>
            {metrics?.bookingsToday || 0}
          </strong>

        </div>

        <div className="operations-status-item">

          <span>
            Choferes activos
          </span>

          <strong>
            {activeDrivers || 0}
          </strong>

        </div>

        <div className="operations-status-item">

          <span>
            Ingresos generados
          </span>

          <strong>
            {formatearMoneda(metrics?.revenueToday)}
          </strong>

        </div>

      </div>

    </DashboardWidget>

  );

};

export default OperationsStatusWidget;