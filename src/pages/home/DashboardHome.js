import React from "react";

import { useCompany } from "../../context/CompanyContext";
import { CurrencyProvider } from "../../context/CurrencyContext";

import { useDashboardController } from "./controllers/useDashboardController";

import "../../style/home/dashboard.css";

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

import CurrencySelector
  from "../../components/general/CurrencySelector/CurrencySelector";

// import MiniAgendaWidget
//   from "../../components/home/MiniAgendaWidget";

/* ======================================================
   DASHBOARD HOME
====================================================== */

const DashboardHome = () => {

  const {

    company,

    companyId

  } = useCompany();

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller =

    useDashboardController(

      companyId

    );

  /*
  ==========================================================
  HELPERS
  ==========================================================
  */

  const {

    greeting,

    formatDateTime,

    capitalize

  } = controller.helpers;

  const companyName =

    company?.name || "";

  /*
  ==========================================================
  CURRENCIES
  ==========================================================
  */

  const currencies =

    controller.dashboard
      ?.financial
      ?.currencies || [];

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <CurrencyProvider

      currencies={currencies}

    >

      <div className="dashboard-container">

        {/* =============================================
            HERO
        ============================================== */}

        <div className="dashboard-header">

          <div className="dashboard-header-left">

            <h1 className="dashboard-title">

              {greeting} 👋

            </h1>

            <p className="dashboard-subtitle">

              {

                companyName

                  ? `Aquí tienes el resumen operativo de ${companyName} para hoy.`

                  : "Aquí tienes el resumen operativo de tu empresa para hoy."

              }

            </p>

          </div>

          <div className="dashboard-header-right">

            <CurrencySelector />

          </div>

        </div>

        {/* =============================================
            KPI GRID
        ============================================== */}

        <KPIGrid

          dashboard={

            controller.dashboard

          }

        />

        {/* =============================================
            MAIN GRID
        ============================================== */}

        <div className="dashboard-main-grid">

          {/* =========================================
              LEFT COLUMN
          ========================================== */}

          <div className="dashboard-left-column">

            <UpcomingServicesWidget

              loading={

                controller.loading

              }

              dashboard={

                controller.dashboard

              }

              formatDateTime={

                formatDateTime

              }

              capitalize={

                capitalize

              }

            />

            <RevenueChartWidget

              loading={

                controller.loading

              }

              dashboard={

                controller.dashboard

              }

            />

          </div>

          {/* =========================================
              RIGHT COLUMN
          ========================================== */}

          <div className="dashboard-right-column">

            <AlertsWidget

              dashboard={

                controller.dashboard

              }

            />

            <OperationsStatusWidget

              dashboard={

                controller.dashboard

              }

            />

            {/*
            <MiniAgendaWidget

              dashboard={

                controller.dashboard

              }

              formatDateTime={

                formatDateTime

              }

            />
            */}

          </div>

        </div>

      </div>

    </CurrencyProvider>

  );

};

export default DashboardHome;