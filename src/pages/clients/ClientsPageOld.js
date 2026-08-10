import React, { useState } from "react";

import ClientsTable from "../../components/clients/ClientsTable";
import ClientSidePanel from "../../components/clients/ClientSidePanel";
import ClientSearch from "../../components/clients/ClientSearchOld";
import CreateClientModal from "../../components/clients/CreateClientModal";

import PageHeader from "../../components/general/PageHeader";
import StatsGrid from "../../components/general/StatsGrid";
import ActionToolbar from "../../components/general/ActionToolbar";

import "../../style/general/pageHeader.css";
import "../../style/general/statsGrid.css";
import "../../style/general/actionToolbar.css";
import "../../style/clients/clients.css";

const ClientsPage = () => {

  const [selectedClient, setSelectedClient] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [refreshClients, setRefreshClients] = useState(false);

  const handleClientCreated = () => {

    setOpenCreateModal(false);

    setSelectedClient(null);

    setRefreshClients(prev => !prev);

  };

  /*
  ==========================================================
  TEMP KPIs
  ==========================================================
  */

  const stats = [

    {
      label: "Clientes",
      value: 0
    },

    {
      label: "Personas",
      value: 0
    },

    {
      label: "Empresas",
      value: 0
    },

    {
      label: "Nuevos este mes",
      value: 0
    }

  ];

  return (

    <div className="container-dashboard">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <PageHeader

        title="Clientes"

        subtitle="Administra las personas y empresas registradas."

        actions={

          <ActionToolbar>

            <button className="action-btn">

              Importar

            </button>

            <button className="action-btn">

              Exportar

            </button>

            <button className="action-btn">

              Filtros

            </button>

            <button
              className="action-btn primary"
              onClick={() => setOpenCreateModal(true)}
            >

              + Nuevo cliente

            </button>

          </ActionToolbar>

        }

      />

      {/* ======================================================
          KPIs
      ====================================================== */}

      <StatsGrid

        items={stats}

      />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-3">

        <ClientSearch

          searchTerm={searchTerm}

          setSearchTerm={setSearchTerm}

        />

      </div>

      {/* ======================================================
          WORKSPACE
      ====================================================== */}

      <div className="clients-workspace">

        <div className="clients-table-container">

          <ClientsTable

            searchTerm={searchTerm}

            onSelectClient={setSelectedClient}

            refresh={refreshClients}

          />

        </div>

        <div className="clients-side-panel">

          <ClientSidePanel

            client={selectedClient}

          />

        </div>

      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <CreateClientModal

        isOpen={openCreateModal}

        onClose={() => setOpenCreateModal(false)}

        onClientCreated={handleClientCreated}

      />

    </div>

  );

};

export default ClientsPage;