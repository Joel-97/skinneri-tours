import React from "react";

import DashboardWidget from "./DashboardWidget";

const OperationsStatusWidget = ({

  dashboard

}) => {

  /*
  ==========================================================
  DOMAINS
  ==========================================================
  */

  const operational =

    dashboard?.operational || {};

  const fleet =

    dashboard?.fleet || {};

  return (

    <DashboardWidget

      title="Estado Operativo"

      subtitle="Resumen operacional actual"

    >

      <div className="operations-status-list">

        {/* ==========================================
            TODAY SERVICES
        =========================================== */}

        <div className="operations-status-item">

          <span>

            Servicios hoy

          </span>

          <strong>

            {

              operational.reservationsToday || 0

            }

          </strong>

        </div>

        {/* ==========================================
            ACTIVE DRIVERS
        =========================================== */}

        <div className="operations-status-item">

          <span>

            Choferes activos

          </span>

          <strong>

            {

              operational.activeDrivers || 0

            }

          </strong>

        </div>

        {/* ==========================================
            ACTIVE VEHICLES
        =========================================== */}

        <div className="operations-status-item">

          <span>

            Vehículos activos

          </span>

          <strong>

            {

              fleet.activeVehicles || 0

            }

          </strong>

        </div>

      </div>

    </DashboardWidget>

  );

};

export default OperationsStatusWidget;