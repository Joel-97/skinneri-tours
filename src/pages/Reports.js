import React, { useState } from 'react';
import { UserAuth } from '../context/AuthContext';

import "../style/settings/settings.css";
import '../style/style.css';

import TransportationReport from './reports/transportationReport';
// futuro:
// import AdventureReport from './reports/adventureReport';

const Reports = () => {

  const { companyId } = UserAuth();

  const [view, setView] = useState("transport-report");

  const renderContent = () => {
    switch (view) {
      case "transport-report":
        return <TransportationReport companyId={companyId} />;

      case "transport-summary":
        return <div>Resumen de transportes (próximamente)</div>;

      case "adventure-report":
        return <div>Reportes de aventuras (próximamente)</div>;

      default:
        return <div>Selecciona un reporte</div>;
    }
  };

  return (
    <div className="settings-layout">

      {/* SIDEBAR */}
      <aside className="settings-sidebar">

        <h4 className="sidebar-title">Transport</h4>

        <button
          className={view === "transport-report" ? "active" : ""}
          onClick={() => setView("transport-report")}
        >
          Reporte general
        </button>

        <button
          className={view === "transport-summary" ? "active" : ""}
          onClick={() => setView("transport-summary")}
        >
          Resumen
        </button>

        <h4 className="sidebar-title">Adventure</h4>

        <button
          className={view === "adventure-report" ? "active" : ""}
          onClick={() => setView("adventure-report")}
          disabled
        >
          Próximamente
        </button>

      </aside>

      {/* CONTENIDO */}
      <main className="settings-content">

        {renderContent()}

      </main>

    </div>
  );
};

export default Reports;