/*
==========================================================
CLIENT FILTERS
==========================================================
*/

import { useMemo, useState } from "react";

import {

    filterClients

} from "../services/clientServices";

export default function useClientFilters(

    clients = []

) {

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
    FILTER OBJECT
    ==========================================================
    */

    const filters = {

        searchTerm,

        type: selectedType,

        status: selectedStatus

    };

    /*
    ==========================================================
    FILTERED CLIENTS
    ==========================================================
    */

    const filteredClients = useMemo(() => {

        return filterClients(

            clients,

            filters

        );

    }, [

        clients,

        filters

    ]);

    /*
    ==========================================================
    RETURN
    ==========================================================
    */

    return {

        filters,

        filteredClients,

        searchTerm,

        setSearchTerm,

        selectedType,

        setSelectedType,

        selectedStatus,

        setSelectedStatus

    };

}