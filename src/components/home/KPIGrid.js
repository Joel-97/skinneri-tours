import React from "react";

import {

  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineTruck

} from "react-icons/hi2";

import KPICard from "./KPICard";

import { formatCurrency }

  from "../../utils/formatCurrency";

import {

  useCurrency

} from "../../context/CurrencyContext";

/* ======================================================
   KPI GRID
====================================================== */

const KPIGrid = ({

  dashboard

}) => {

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  const {

    selectedCurrency

  } = useCurrency();

  /*
  ==========================================================
  DOMAINS
  ==========================================================
  */

  const operational =

    dashboard?.operational || {};

  /*
  ==========================================================
  REVENUE
  ==========================================================
  */

  const revenue =

    selectedCurrency

      ?.todayRevenue || 0;

  const symbol =

    selectedCurrency

      ?.currencySymbol || "";

  const code =

    selectedCurrency

      ?.currencyCode || "";

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="kpi-grid">

      {/* ==========================================
          BOOKINGS
      =========================================== */}

      <KPICard

        title="Reservas"

        value={

          operational.reservationsToday || 0

        }

        description="Servicios programados hoy"

        icon={

          <HiOutlineCalendarDays />

        }

      />

      {/* ==========================================
          REVENUE
      =========================================== */}

      <KPICard

        title="Ingresos"

        value={

          formatCurrency(

            revenue,

            symbol

          )

        }

        description={

          code ||

          "Moneda"

        }

        type="success"

        icon={

          <HiOutlineBanknotes />

        }

      />

      {/* ==========================================
          UNASSIGNED
      =========================================== */}

      <KPICard

        title="Sin asignar"

        value={

          operational.unassignedServices || 0

        }

        description="Servicios requieren atención"

        type="danger"

        icon={

          <HiOutlineExclamationTriangle />

        }

      />

      {/* ==========================================
          DRIVERS
      =========================================== */}

      <KPICard

        title="Choferes"

        value={

          operational.activeDrivers || 0

        }

        description="Activos actualmente"

        type="warning"

        icon={

          <HiOutlineTruck />

        }

      />

    </div>

  );

};

export default KPIGrid;