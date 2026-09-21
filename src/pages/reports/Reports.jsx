import React, {
  useState
} from "react";

import "../../style/settings/settings.css";
import "../../style/style.css";

import TransportationReservations from "./transportation/jsx/reservations/TransportationReservations";
import TransportationFinancial from "./transportation/jsx/financial/TransportationFinancial";
import TransportationCommission from "./transportation/jsx/commission/TransportationCommission";

import CommissionReport from "./commissionReport";


const Reports = () => {

  const [
    view,
    setView
  ] = useState(
    "transport-reservations"
  );


  // ==========================================================
  // CONTENT
  // ==========================================================

  const renderContent = () => {

    switch (view) {

      case "transport-summary":

        return (

          <div>
            Resumen de transportes
            (próximamente)
          </div>

        );


      case "transport-reservations":

        return (

          <TransportationReservations />

        );


      case "transport-financial":

        return (

          <div>
            <TransportationFinancial />
          </div>

        );


      case "commission-report":

        return (

          <TransportationCommission />

        );


      case "transport-operations":

        return (

          <div>
            Reporte de operaciones
            (próximamente)
          </div>

        );


      case "transport-routes":

        return (

          <div>
            Reporte de rutas
            (próximamente)
          </div>

        );


      case "transport-clients":

        return (

          <div>
            Reporte de clientes
            (próximamente)
          </div>

        );


      default:

        return (

          <div>
            Selecciona un reporte
          </div>

        );

    }

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="settings-layout">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="settings-sidebar">

        <h4 className="sidebar-title">
          Transport
        </h4>


        <button
          type="button"
          className={
            view ===
            "transport-summary"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-summary"
              )
          }
        >
          Resumen
        </button>


        <button
          type="button"
          className={
            view ===
            "transport-reservations"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-reservations"
              )
          }
        >
          Reservaciones
        </button>


        <button
          type="button"
          className={
            view ===
            "transport-financial"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-financial"
              )
          }
        >
          Financiero
        </button>


        <button
          type="button"
          className={
            view ===
            "commission-report"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "commission-report"
              )
          }
        >
          Comisiones
        </button>


        <button
          type="button"
          className={
            view ===
            "transport-operations"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-operations"
              )
          }
        >
          Operaciones
        </button>


        <button
          type="button"
          className={
            view ===
            "transport-routes"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-routes"
              )
          }
        >
          Rutas
        </button>


        <button
          type="button"
          className={
            view ===
            "transport-clients"
              ? "active"
              : ""
          }
          onClick={
            () =>
              setView(
                "transport-clients"
              )
          }
        >
          Clientes
        </button>


        <h4 className="sidebar-title">
          Adventure
        </h4>


        <button
          type="button"
          disabled
        >
          Próximamente
        </button>

      </aside>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="settings-content">

        {
          renderContent()
        }

      </main>

    </div>

  );

};


export default Reports;