/*
==========================================================
TABLE SECTION
==========================================================
*/

import React from "react";

import ClientsTable from "../components/table/ClientsTable";

/*
==========================================================
COMPONENT
==========================================================
*/

const TableSection = ({

  controller

}) => {

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const {

    clients,

    loading,

    selection,

    actions

  } = controller;

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return (

    <ClientsTable

      /* ==========================================
         DATA
      ========================================== */

      clients={clients}

      loading={loading}

      /* ==========================================
         SELECTION
      ========================================== */

      selectedClient={selection.selectedClient}

      onSelectClient={actions.handleSelectClient}

      /* ==========================================
         ACTIONS
      ========================================== */

      onEdit={actions.handleEdit}

      onDelete={actions.handleDelete}

    />

  );

};

export default TableSection;