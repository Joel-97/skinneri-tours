import React, { useState } from "react";
import TaxesSection from "./sections/TaxesSection";
import CurrenciesSection from "./sections/CurrenciesSection";
import LocationsSection from "./sections/LocationsSection";
import ServiceTypesSection from "./sections/ServiceTypesSection";
import DiscountsSection from "./sections/DiscountsSection";
import StaffSection from "./sections/StaffSection";
import PaymentTypesSection from "./sections/PaymentTypesSection";

import "../../style/settings/settings.css";

const SettingsPage = () => {

  const [view, setView] = useState("taxes");

  const renderContent = () => {
    switch (view) {
      case "taxes":
        return <TaxesSection />;

      case "serviceTypes":
        return <ServiceTypesSection />;

      case "discounts":
        return <DiscountsSection />;

      case "currency":
        return <CurrenciesSection />;

      case "staff":
        return <StaffSection />;

      case "paymentTypes":
        return <PaymentTypesSection />;

      case "locations":
        return <LocationsSection />;

      case "vehicles":
        return <div>Vehículos próximamente</div>;

      case "adventure":
        return <div style={{ opacity: 0.6 }}>Próximamente</div>;

      default:
        return <div>Selecciona una opción</div>;
    }
  };

  return (
    <div className="settings-layout">

      {/* SIDEBAR */}
      <aside className="settings-sidebar">

        <h4 className="sidebar-title">General</h4>

        <button
          className={view === "taxes" ? "active" : ""}
          onClick={() => setView("taxes")}
        >
          Impuestos
        </button>

        <button
          className={view === "serviceTypes" ? "active" : ""}
          onClick={() => setView("serviceTypes")}
        >
          Tipos de servicio
        </button>

        <button
          className={view === "discounts" ? "active" : ""}
          onClick={() => setView("discounts")}
        >
          Descuentos
        </button>

        <button
          className={view === "currency" ? "active" : ""}
          onClick={() => setView("currency")}
        >
          Moneda
        </button>

        <button
          className={view === "staff" ? "active" : ""}
          onClick={() => setView("staff")}
        >
          Colaboradores
        </button>

        <button
          className={view === "paymentTypes" ? "active" : ""}
          onClick={() => setView("paymentTypes")}
        >
          Tipos de pago
        </button>

        <h4 className="sidebar-title">Transporte</h4>

        <button
          className={view === "locations" ? "active" : ""}
          onClick={() => setView("locations")}
        >
          Lugares
        </button>

        <button
          className={view === "vehicles" ? "active" : ""}
          onClick={() => setView("vehicles")}
          disabled
        >
          Vehículos
          <p><small>Próximamente</small></p>

        </button>


        <h4 className="sidebar-title">Aventuras</h4>

        <button
          className={view === "adventure" ? "active" : ""}
          onClick={() => setView("adventure")}
          disabled
        >
          Próximamente
        </button>

      </aside>

      {/* CONTENIDO */}
      <main className="settings-content">

        <div className="settings-header">
          <h2>Configuración</h2>
        </div>

        {renderContent()}

      </main>

    </div>
  );
};

export default SettingsPage;