import React from "react";

import DataTable from "../../../general/dataTable";
import ClientRow from "./ClientRow";

/*
==========================================================
COMPONENT
==========================================================
*/

const ClientsTable = ({

  clients,

  loading,

  selectedClient,

  onSelectClient,

  onEdit,

  onDelete

}) => {

  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

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

      key: "status",

      label: "Estado",

      sortable: true,

      width: "140px",

      align: "center"

    },

    {

      key: "actions",

      label: "Acciones",

      width: "170px",

      align: "center"

    }

  ];

  /*
  ==========================================================
  RENDER ROW
  ==========================================================
  */

  const renderRow = (

    client

  ) => (

    <ClientRow

      key={client.id}

      client={client}

      selected={

        selectedClient?.id === client.id

      }

      onSelect={

        onSelectClient

      }

      onEdit={

        onEdit

      }

      onDelete={

        onDelete

      }

    />

  );

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return (

    <DataTable

      /* ==========================================
         DATA
      ========================================== */

      data={clients}

      columns={columns}

      renderRow={renderRow}

      /* ==========================================
         SELECTION
      ========================================== */

      selectableRows

      selectedRow={selectedClient?.id}

      onRowClick={onSelectClient}

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

      rowsPerPageOptions={[

        5,

        10,

        20,

        50

      ]}

    />

  );

};

export default ClientsTable;