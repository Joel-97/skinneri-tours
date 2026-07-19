import React, {
  useEffect,
  useState
} from "react";

import ClientModal from "./components/ClientModal";

import {
  getClients,
  createClient,
  updateClient,
  deleteClient
} from "../../services/clients/clientService";

import {
  getClientProfile
} from "../../services/clients/clientProfileService";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../services/notificationService";

import Loading from "../general/loading";

import {
  FaFileImport,
  FaFileExport,
  FaFilter,
  FaPlus
} from "react-icons/fa";

import StatsSection from "./sections/StatsSection";
import FiltersSection from "./sections/FiltersSection";
import TableSection from "./sections/TableSection";

import ModuleHeader from "./components/general/ModuleHeader/ModuleHeader";

import ClientsContent from "./components/ClientsContent/ClientsContent";
import ClientPreview from "./components/ClientPreview/ClientPreview";

/*
==========================================================
COMPONENT
==========================================================
*/

const ClientsList = ({

  companyId,

  user

}) => {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    clients,

    setClients

  ] = useState([]);

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    modalOpen,

    setModalOpen

  ] = useState(false);

  const [

    selectedClient,

    setSelectedClient

  ] = useState(null);

  const [

    clientProfile,

    setClientProfile

  ] = useState(null);

  const [

    mode,

    setMode

  ] = useState("create");

  /*
  ==========================================================
  FILTERS
  ==========================================================
  */

  const [

    searchTerm,

    setSearchTerm

  ] = useState("");

  const [

    selectedType,

    setSelectedType

  ] = useState("");

  const [

    selectedStatus,

    setSelectedStatus

  ] = useState("");

  /*
  ==========================================================
  FILTER PANEL
  ==========================================================
  */

  const [

    showFilters,

    setShowFilters

  ] = useState(false);

  /*
  ==========================================================
  LOAD
  ==========================================================
  */

  const loadClients = async () => {

    if (!companyId) return;

    try {

      setLoading(true);

      const data = await getClients(

        companyId

      );

      setClients(

        data

      );

    }

    catch (error) {

      console.error(error);

      notifyError(

        "Error",

        "No se pudieron cargar los clientes."

      );

    }

    finally {

      setLoading(false);

    }

  };

  /*
  ==========================================================
  EFFECT
  ==========================================================
  */

  useEffect(() => {

    if (!companyId) return;

    loadClients();

  }, [

    companyId

  ]);

  /*
  ==========================================================
  CREATE
  ==========================================================
  */

  const handleCreate = () => {

    setSelectedClient(

      null

    );

    setMode(

      "create"

    );

    setModalOpen(

      true

    );

  };

  /*
  ==========================================================
  EDIT
  ==========================================================
  */

  const handleEdit = (

    client

  ) => {

    setSelectedClient(

      client

    );

    setMode(

      "edit"

    );

    setModalOpen(

      true

    );

  };

  /*
  ==========================================================
  DELETE
  ==========================================================
  */

  const handleDelete = async (

    client

  ) => {

    const confirmed = await notifyConfirm(

      "¿Eliminar cliente?",

      "Esta acción no se puede deshacer."

    );

    if (!confirmed) return;

    try {

      await deleteClient(

        companyId,

        client.id

      );

      notifySuccess(

        "Cliente eliminado",

        "El cliente fue eliminado correctamente."

      );

      loadClients();

    }

    catch (error) {

      console.error(error);

      notifyError(

        "Error",

        "No se pudo eliminar el cliente."

      );

    }

  };

  /*
  ==========================================================
  SAVE
  ==========================================================
  */

  const handleSave = async (

    formData

  ) => {

    try {

      if (

        mode === "create"

      ) {

        await createClient(

          companyId,

          formData,

          user

        );

        notifySuccess(

          "Cliente creado",

          "El cliente fue creado correctamente."

        );

      }

      else {

        await updateClient(

          companyId,

          selectedClient.id,

          formData,

          user

        );

        notifySuccess(

          "Cliente actualizado",

          "Los cambios fueron guardados."

        );

      }

      setModalOpen(

        false

      );

      loadClients();

    }

    catch (error) {

      console.error(error);

      notifyError(

        "Error",

        "No fue posible guardar el cliente."

      );

    }

  };

    /*
  ==========================================================
  STATS
  ==========================================================
  */

  const stats = {

    totalClients: clients.length,

    people: clients.filter(

      client => client.type === "person"

    ).length,

    companies: clients.filter(

      client => client.type === "company"

    ).length,

    active: clients.filter(

      client => client.status === "active"

    ).length

  };

  /*
  ==========================================================
  SELECTION
  ==========================================================
  */

  const handleSelectClient = async (

    client

  ) => {

    try {

      const profile = await getClientProfile(

        companyId,

        client

      );

      setSelectedClient(

        client

      );

      setClientProfile(

        profile

      );

    }

    catch (error) {

      console.error(error);

      notifyError(

        "Error",
        "No fue posible cargar la información del cliente."

      );

    }

  };

  /*
  ==========================================================
  PREVIEW
  ==========================================================
  */

  const handleClosePreview = () => {

    setSelectedClient(

      null

    );

    setClientProfile(

      null

    );

  };

  /*
  ==========================================================
  FILTERS
  ==========================================================
  */

  const filteredClients = clients.filter(

    client => {

      const matchesSearch =

        !searchTerm ||

        client.name?.toLowerCase().includes(

          searchTerm.toLowerCase()

        ) ||

        client.email?.toLowerCase().includes(

          searchTerm.toLowerCase()

        ) ||

        client.phone?.toLowerCase().includes(

          searchTerm.toLowerCase()

        );

      const matchesType =

        !selectedType ||

        client.type === selectedType;

      const matchesStatus =

        !selectedStatus ||

        client.status === selectedStatus;

      return (

        matchesSearch &&

        matchesType &&

        matchesStatus

      );

    }

  );

  /*
  ==========================================================
  CLEAR FILTERS
  ==========================================================
  */

  const handleClearFilters = () => {

    setSearchTerm("");

    setSelectedType("");

    setSelectedStatus("");

  };


  /*
  ==========================================================
  ACTIVE FILTERS
  ==========================================================
  */

  const hasActiveFilters = Boolean(

      searchTerm ||

      selectedType ||

      selectedStatus

  );

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller = {

    clients: filteredClients,

    loading,

    stats,

    filters: {

        searchTerm,

        setSearchTerm,

        selectedType,

        setSelectedType,

        selectedStatus,

        setSelectedStatus,

        filteredClients,

        handleClearFilters,

        hasActiveFilters

    },

    selection: {

        selectedClient,

        clientProfile

    },

    actions: {

        handleCreate,

        handleEdit,

        handleDelete,

        handleSave,

        handleSelectClient,

        handleClosePreview,

        handleToggleFilters: () =>

            setShowFilters(

                prev => !prev

            )

    }

  };

    /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {

    return (

      <div style={{ textAlign: "center" }}>

        <Loading />

      </div>

    );

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return (

    <div className="clients-container">

      {/* ======================================================
          MODULE HEADER
      ====================================================== */}

      <ModuleHeader
        title="Clientes"
        subtitle="Administra las personas y empresas registradas."
      >

        <button>

          <FaFileImport className="import-icon" />

          Importar

        </button>

        <button>

          <FaFileExport className="export-icon" />

          Exportar

        </button>

        <button
          className={`${
            controller.filters.hasActiveFilters ? "active" : ""
          }`}
          onClick={controller.actions.handleToggleFilters}
        >

          <FaFilter className="filter-icon" />

          Filtros

          {controller.filters.hasActiveFilters && (
            <span className="header-btn-dot" />
          )}

        </button>

        <button
          className="primary"
          onClick={controller.actions.handleCreate}
        >

          <FaPlus />

          Nuevo Cliente

        </button>

      </ModuleHeader>

      {/* ======================================================
          STATS
      ====================================================== */}

      <StatsSection

        controller={controller}

      />

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
          className={`filters-wrapper ${
              showFilters ? "open" : ""
          }`}
      >

          <FiltersSection

              controller={controller}

          />

      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ClientsContent

          selectedClient={selectedClient}

      >

          {/* ======================================================
              TABLE
          ====================================================== */}

          <div className="clients-table-container">

              <TableSection

                  controller={controller}

              />

          </div>

          {/* ======================================================
              PREVIEW
          ====================================================== */}

          {

              selectedClient && (

                  <div className="client-preview-container">

                    <ClientPreview

                        profile={clientProfile}

                        onClose={

                            controller.actions.handleClosePreview

                        }

                    />

                  </div>

              )

          }

      </ClientsContent>

      {/* ======================================================
          MODAL
      ====================================================== */}

      <ClientModal

        isOpen={modalOpen}

        onClose={() =>

          setModalOpen(false)

        }

        onSave={handleSave}

        companyId={companyId}

        user={user}

        client={selectedClient}

        mode={mode}

      />

    </div>

  );

};

export default ClientsList;