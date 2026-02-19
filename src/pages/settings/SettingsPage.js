import React, { useState } from "react";
import TaxesSection from "./sections/TaxesSection";
import CurrenciesSection from "./sections/CurrenciesSection";
import LocationsSection from "./sections/LocationsSection";
import ServiceTypesSection from "./sections/ServiceTypesSection";
import DiscountsSection from "./sections/DiscountsSection";
import "../../style/settings/settings.css";

const SettingsPage = () => {

  const [activeTab, setActiveTab] = useState("taxes");

  return (
    <div className="settings-container">

      <h2>Configuración</h2>

      <div className="settings-tabs">
        <button
          className={activeTab === "taxes" ? "active" : ""}
          onClick={() => setActiveTab("taxes")}
        >
          Impuestos
        </button>

        <button
          className={activeTab === "pickups" ? "active" : ""}
          onClick={() => setActiveTab("pickups")}
        >
          Lugares
        </button>

        <button
          className={activeTab === "serviceType" ? "active" : ""}
          onClick={() => setActiveTab("serviceType")}
        >
          Tipo de servicio
        </button>

        <button
          className={activeTab === "vehicles" ? "active" : ""}
          onClick={() => setActiveTab("vehicles")}
        >
          Vehículos
        </button>

        <button
          className={activeTab === "discounts" ? "active" : ""}
          onClick={() => setActiveTab("discounts")}
        >
          Descuentos
        </button>

        <button
          className={activeTab === "currency" ? "active" : ""}
          onClick={() => setActiveTab("currency")}
        >
          Moneda
        </button>
      </div>

      <div className="settings-content">
        {activeTab === "taxes" && < TaxesSection />}
        {activeTab === "pickups" && < LocationsSection />}
        {activeTab === "serviceType" && < ServiceTypesSection />}
        {activeTab === "vehicles" && <div>Vehículos próximamente</div>}
        {activeTab === "discounts" && < DiscountsSection />}
        {activeTab === "currency" && < CurrenciesSection />}
      </div>

    </div>
  );
};

export default SettingsPage;
