import React, {
  useEffect,
  useState
} from "react";

import TaxesSection from "./sections/general/TaxesSection";
import CurrenciesSection from "./sections/general/CurrenciesSection";
import ServiceTypesSection from "./sections/general/ServiceTypesSection";
import CommissionAgents from "./sections/general/CommissionAgentsSection";
import PaymentTypesSection from "./sections/general/PaymentTypesSection";
import CompanyProfileSection from "./sections/general/CompanyProfileSection";
import EmailSettingsSection from "./sections/general/EmailSettingsSection";
import DiscountsSection from "./sections/general/DiscountsSection";
import StaffSection from "./sections/general/StaffSection";

import SignTemplatesSection from "./sections/template/SignTemplatesSection";
import LocationsSection from "./sections/locations/LocationsSection";
import VehiclesSection from "./sections/transports/vehicles/VehiclesSection";
import BookingSourcesSection from "./sections/transports/bookingSource/BookingSourcesSection";
import Routes from "./sections/transports/routes/RoutesSection";
import Drivers from "./sections/transports/drivers/DriversSection";
import PayersSection from "./sections/general/payer/PayersSection";
import Maintenance from "./sections/transports/maintenance/MaintenanceSection";

import { useAuth } from "../../context/AuthContext";

import {
  isModuleEnabled
} from "../../utils/platform/moduleUtils";

import "../../style/settings/settings.css";

const SettingsPage = () => {

  /*
  ==========================================================
  AUTH
  ==========================================================
  */

  const {

    session

  } = useAuth();

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  const company = session?.company;

  /*
  ==========================================================
  MODULE ACCESS
  ==========================================================
  */

  const transportationEnabled =

    isModuleEnabled(

      company,

      "transportation"

    );

  const adventureEnabled =

    isModuleEnabled(

      company,

      "adventure"

    );

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    view,

    setView

  ] = useState(

    "companyProfile"

  );

  /*
  ==========================================================
  VALIDATE CURRENT VIEW
  ==========================================================
  */

  useEffect(() => {

    /*
    ========================================================
    TRANSPORTATION
    ========================================================
    */

    const transportationViews = [

      "locations",

      "SignTemplates",

      "vehicles",

      "drivers",

      "maintenance",

      "BookingSources",

      "routes"

    ];

    if (

      !transportationEnabled &&

      transportationViews.includes(view)

    ) {

      setView(

        "companyProfile"

      );

      return;

    }

    /*
    ========================================================
    ADVENTURE
    ========================================================
    */

    if (

      !adventureEnabled &&

      view === "adventure"

    ) {

      setView(

        "companyProfile"

      );

    }

  }, [

    transportationEnabled,

    adventureEnabled,

    view

  ]);

  /*
  ==========================================================
  RENDER CONTENT
  ==========================================================
  */

  const renderContent = () => {

    switch (view) {

      // ==================================================
      // GENERAL
      // ==================================================

      case "companyProfile":

        return (

          <CompanyProfileSection />

        );

      case "emailSettings":

        return (

          <EmailSettingsSection />

        );

      case "taxes":

        return (

          <TaxesSection />

        );

      case "serviceTypes":

        return (

          <ServiceTypesSection />

        );

      case "discounts":

        return (

          <DiscountsSection />

        );

      case "currency":

        return (

          <CurrenciesSection />

        );

      case "staff":

        return (

          <StaffSection />

        );

      case "commissionAgents":

        return (

          <CommissionAgents />

        );

      case "paymentTypes":

        return (

          <PaymentTypesSection />

        );

      case "payers":

        return (

          <PayersSection />

        );

      // ==================================================
      // TRANSPORT
      // ==================================================

      case "locations":

        return transportationEnabled

          ? (

            <LocationsSection />

          )

          : null;

      case "SignTemplates":

        return transportationEnabled

          ? (

            <SignTemplatesSection />

          )

          : null;

      case "vehicles":

        return transportationEnabled

          ? (

            <VehiclesSection />

          )

          : null;

      case "drivers":

        return transportationEnabled

          ? (

            <Drivers />

          )

          : null;

      case "maintenance":

        return transportationEnabled

          ? (

            <Maintenance />

          )

          : null;

      case "BookingSources":

        return transportationEnabled

          ? (

            <BookingSourcesSection />

          )

          : null;

      case "routes":

        return transportationEnabled

          ? (

            <Routes />

          )

          : null;

      // ==================================================
      // ADVENTURE
      // ==================================================

      case "adventure":

        return adventureEnabled

          ? (

            <div

              style={{

                opacity: 0.6

              }}

            >

              Próximamente

            </div>

          )

          : null;

      // ==================================================
      // DEFAULT
      // ==================================================

      default:

        return (

          <div>

            Selecciona una opción

          </div>

        );

    }

  };

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="settings-layout">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="settings-sidebar">

        {/* ==================================================
            GENERAL
        ================================================== */}

        <h4 className="sidebar-title">

          General

        </h4>

        <button

          className={

            view === "companyProfile"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "companyProfile"

            )

          }

        >

          Perfil empresa

        </button>

        <button

          className={

            view === "emailSettings"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "emailSettings"

            )

          }

        >

          Configuración de email

        </button>

        <button

          className={

            view === "taxes"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "taxes"

            )

          }

        >

          Impuestos

        </button>

        <button

          className={

            view === "serviceTypes"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "serviceTypes"

            )

          }

        >

          Tipos de servicio

        </button>

        <button

          className={

            view === "discounts"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "discounts"

            )

          }

        >

          Descuentos

        </button>

        <button

          className={

            view === "currency"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "currency"

            )

          }

        >

          Moneda

        </button>

        <button

          className={

            view === "staff"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "staff"

            )

          }

        >

          Colaboradores

        </button>

        <button

          className={

            view === "commissionAgents"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "commissionAgents"

            )

          }

        >

          Comisionistas

        </button>

        <button

          className={

            view === "paymentTypes"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "paymentTypes"

            )

          }

        >

          Tipos de pago

        </button>

        <button

          className={

            view === "payers"

              ? "active"

              : ""

          }

          onClick={() =>

            setView(

              "payers"

            )

          }

        >

          Pagadores

        </button>

        {/* ==================================================
            TRANSPORT
        ================================================== */}

        {

          transportationEnabled && (

            <>

              <h4 className="sidebar-title">

                Transporte

              </h4>

              <button

                className={

                  view === "locations"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "locations"

                  )

                }

              >

                Lugares

              </button>

              <button

                className={

                  view === "vehicles"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "vehicles"

                  )

                }

              >

                Vehículos

              </button>

              <button

                className={

                  view === "drivers"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "drivers"

                  )

                }

              >

                Conductores

              </button>

              {/*

              <button

                className={

                  view === "maintenance"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "maintenance"

                  )

                }

              >

                Mantenimiento

              </button>

              */}

              <button

                className={

                  view === "routes"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "routes"

                  )

                }

              >

                Código de rutas

              </button>

              <button

                className={

                  view === "BookingSources"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "BookingSources"

                  )

                }

              >

                Origen de reserva

              </button>

              <button

                className={

                  view === "SignTemplates"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "SignTemplates"

                  )

                }

              >

                Plantillas

              </button>

            </>

          )

        }

        {/* ==================================================
            ADVENTURE
        ================================================== */}

        {

          adventureEnabled && (

            <>

              <h4 className="sidebar-title">

                Aventuras

              </h4>

              <button

                className={

                  view === "adventure"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setView(

                    "adventure"

                  )

                }

                disabled

              >

                Próximamente

              </button>

            </>

          )

        }

      </aside>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="settings-content">

        <div className="settings-header">

          <h2>

            Configuración

          </h2>

        </div>

        {

          renderContent()

        }

      </main>

    </div>

  );

};

export default SettingsPage;