/*
==========================================================
TABLE SECTION
==========================================================
*/

import React from "react";

import ClientsTable from "../ClientsTable";

const TableSection = ({

    controller

}) => {

    const {

        clients,

        loading,

        filters,

        selection,

        actions

    } = controller;

    return (

        <ClientsTable

            clients={

                filters.filteredClients

            }

            loading={

                loading

            }

            selectedClient={

                selection.selectedClient

            }

            onSelectClient={

                actions.handleSelectClient

            }

            onRefresh={

                actions.handleClientCreated

            }

        />

    );

};

export default TableSection;