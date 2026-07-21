import React from "react";

import {
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineInbox,
  HiOutlineCheckCircle
} from "react-icons/hi2";

import DashboardWidget from "./DashboardWidget";

const AlertsWidget = ({

  dashboard

}) => {

  /*
  ==========================================================
  DOMAINS
  ==========================================================
  */

  const operational =

    dashboard?.operational || {};

  const trips =

    dashboard?.trips || {};

  /*
  ==========================================================
  ALERTS
  ==========================================================
  */

  const alerts = [];

  /*
  ==========================================================
  UNASSIGNED SERVICES
  ==========================================================
  */

  if (

    operational.unassignedServices > 0

  ) {

    alerts.push({

      type: "warning",

      icon: <HiOutlineExclamationTriangle />,

      text: `${operational.unassignedServices} servicios requieren asignación`

    });

  }

  /*
  ==========================================================
  PENDING SERVICES
  ==========================================================
  */

  if (

    trips.pending?.length > 0

  ) {

    alerts.push({

      type: "info",

      icon: <HiOutlineClock />,

      text: `${trips.pending.length} servicios pendientes`

    });

  }

  /*
  ==========================================================
  NO SERVICES TODAY
  ==========================================================
  */

  if (

    trips.today?.length === 0

  ) {

    alerts.push({

      type: "neutral",

      icon: <HiOutlineInbox />,

      text: "No hay reservas programadas hoy"

    });

  }

  /*
  ==========================================================
  EVERYTHING OK
  ==========================================================
  */

  if (

    operational.unassignedServices === 0 &&

    trips.today?.length > 0

  ) {

    alerts.push({

      type: "success",

      icon: <HiOutlineCheckCircle />,

      text: "Todo opera con normalidad"

    });

  }

  /*
  ==========================================================
  EMPTY
  ==========================================================
  */

  if (

    alerts.length === 0

  ) {

    alerts.push({

      type: "success",

      icon: <HiOutlineCheckCircle />,

      text: "No existen alertas operativas."

    });

  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

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