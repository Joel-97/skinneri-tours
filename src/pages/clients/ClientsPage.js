import React, { useState } from "react";
import ClientsTable from "../../components/clients/ClientsTable";
import ClientSidePanel from "../../components/clients/ClientSidePanel";
import ClientSearch from "../../components/clients/ClientSearch";
import CreateClientModal from "../../components/clients/CreateClientModal";

const ClientsPage = () => {

  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // trigger para refrescar tabla cuando se crea cliente
  const [refreshClients, setRefreshClients] = useState(false);

  const handleClientCreated = () => {
    setOpenCreateModal(false);
    setSelectedClient(null); // 👈 limpiar panel lateral
    setRefreshClients(prev => !prev); // fuerza reload de la tabla
  };

  return (
    <div className="container-dashboard">
      <div className="row">

        {/* Header */}
        <div className="col-12 mb-3 d-flex justify-content-between align-items-center">
          <h2>Clientes</h2>

          <button
            className="btn btn-primary"
            onClick={() => setOpenCreateModal(true)}
          >
            + Nuevo cliente
          </button>
        </div>

        {/* Buscador */}
        <div className="col-12 mb-3">
          <ClientSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        </div>

        {/* Tabla + panel */}
        <div className="col-12 d-flex">

          <div style={{ flex: 2 }}>
            <ClientsTable
              searchTerm={searchTerm}
              onSelectClient={setSelectedClient}
              refresh={refreshClients}
            />
          </div>

          <div style={{ flex: 1 }}>
            <ClientSidePanel client={selectedClient} />
          </div>

        </div>

      </div>

      {/* MODAL CREAR CLIENTE */}
      <CreateClientModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default ClientsPage;
