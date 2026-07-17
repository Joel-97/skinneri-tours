import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import DataTable from "../general/dataTable";
import ClientRow from "./ClientRow";
import ClientCreateModal from "./CreateClientModal";

import {
  getClients,
  deleteClient
} from "../../services/clients/clientService";

import {
  UserAuth
} from "../../context/AuthContext";

import {
  useCompany
} from "../../context/CompanyContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../services/notificationService";

/* ======================================================
   COMPONENT
====================================================== */

const ClientsTable = ({

  searchTerm,

  onSelectClient,

  refresh

}) => {

  const {

    adminData,

    isSuperAdmin

  } = UserAuth();

  const {

    companyId

  } = useCompany();

  /* ======================================================
     STATE
  ====================================================== */

  const [

    clients,

    setClients

  ] = useState([]);

  const [

    loading,

    setLoading

  ] = useState(true);

  const [

    editingClient,

    setEditingClient

  ] = useState(null);

  const [

    selectedClientId,

    setSelectedClientId

  ] = useState(null);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    if (companyId) {

      loadClients();

    }

  }, [

    companyId,

    refresh

  ]);

  /* ======================================================
     LOAD
  ====================================================== */

  const loadClients = async () => {

    try {

      setLoading(true);

      const data = await getClients(companyId);

      setClients(data);

    } catch (error) {

      console.error(error);

      notifyError(

        "Error",

        "No se pudieron cargar los clientes."

      );

    } finally {

      setLoading(false);

    }

  };

  /* ======================================================
     PERMISSIONS
  ====================================================== */

  const canDelete =

    isSuperAdmin ||

    adminData?.role === "admin";

  /* ======================================================
     DELETE
  ====================================================== */

  const handleDelete = async (

    client,

    event

  ) => {

    event.stopPropagation();

    if (!canDelete) return;

    const confirmed = await notifyConfirm(

      "¿Eliminar cliente?",

      `Esta acción eliminará a "${client.name}" permanentemente.`

    );

    if (!confirmed) return;

    try {

      await deleteClient(

        client.id,

        companyId

      );

      await loadClients();

      notifySuccess(

        "Cliente eliminado",

        "El cliente fue eliminado correctamente."

      );

    } catch (error) {

      console.error(error);

      notifyError(

        "Error",

        "No se pudo eliminar el cliente."

      );

    }

  };

  /* ======================================================
     SELECT
  ====================================================== */

  const handleSelectClient = (

    client

  ) => {

    setSelectedClientId(

      client.id

    );

    onSelectClient?.(

      client

    );

  };

  /* ======================================================
     FILTER
  ====================================================== */

  const filteredClients = useMemo(() => {

    if (!searchTerm) {

      return clients;

    }

    const term =

      searchTerm.toLowerCase();

    return clients.filter(client =>

      client.name?.toLowerCase().includes(term)

      ||

      client.email?.toLowerCase().includes(term)

      ||

      client.phone?.toLowerCase().includes(term)

    );

  }, [

    clients,

    searchTerm

  ]);

  /* ======================================================
     COLUMNS
  ====================================================== */

  const columns = [

    {

      key: "name",

      label: "Cliente",

      sortable: true,

      minWidth: "260px"

    },

    {

      key: "email",

      label: "Correo",

      sortable: true,

      minWidth: "240px"

    },

    {

      key: "phone",

      label: "Teléfono",

      sortable: true,

      width: "180px"

    },

    {

      key: "type",

      label: "Tipo",

      sortable: true,

      width: "140px",

      align: "center"

    },

    {

      key: "actions",

      label: "Acciones",

      width: "150px",

      align: "center"

    }

  ];

  /* ======================================================
     RENDER ROW
  ====================================================== */

  const renderRow = (client) => (

      <ClientRow

          client={client}

          canDelete={canDelete}

          onEdit={setEditingClient}

          onDelete={handleDelete}

      />

  );

    /* ======================================================
     RETURN
  ====================================================== */

  return (

    <>

      <DataTable

        /* ==========================================
           DATA
        ========================================== */

        data={filteredClients}

        columns={columns}

        renderRow={renderRow}

        /* ==========================================
           SELECTION
        ========================================== */

        selectableRows

        selectedRow={selectedClientId}

        onRowClick={handleSelectClient}

        /* ==========================================
           LOADING
        ========================================== */

        loading={loading}

        /* ==========================================
           EMPTY STATE
        ========================================== */

        emptyTitle="No hay clientes registrados"

        emptyDescription="Comienza creando el primer cliente para tu empresa."

        /* ==========================================
           PAGINATION
        ========================================== */

        defaultRowsPerPage={10}

        rowsPerPageOptions={[5, 10, 20, 50]}

      />

      {/* ======================================================
          EDIT CLIENT MODAL
      ====================================================== */}

      <ClientCreateModal

        isOpen={!!editingClient}

        client={editingClient}

        mode="edit"

        onClose={() =>

          setEditingClient(null)

        }

        onClientCreated={() => {

          setEditingClient(null);

          loadClients();

          notifySuccess(

            "Cliente actualizado",

            "Los cambios se guardaron correctamente."

          );

        }}

      />

    </>

  );

};

export default ClientsTable;