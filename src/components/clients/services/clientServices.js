/*
==========================================================
CLIENT SERVICES
==========================================================
*/

import {

    getClients

} from "../../../../services/clients/clientService";

/*
==========================================================
LOAD ALL SETTINGS
==========================================================
*/

export async function loadClientSettings(companyId) {

    if (!companyId) {

        return {

            clients: []

        };

    }

    const [

        clients

    ] = await Promise.all([

        getClients(companyId)

    ]);

    return {

        clients

    };

}

/*
==========================================================
BUILD CLIENT STATS
==========================================================
*/

export function buildClientStats(clients = []) {

    const totalClients = clients.length;

    const people = clients.filter(
        client => client.type === "person"
    ).length;

    const companies = clients.filter(
        client => client.type === "company"
    ).length;

    const active = clients.filter(
        client => client.status === "active"
    ).length;

    const inactive = clients.filter(
        client => client.status === "inactive"
    ).length;

    return {

        totalClients,

        people,

        companies,

        active,

        inactive,

        cards: [

            {

                key: "clients",

                title: "Clientes",

                value: totalClients,

                icon: "👥"

            },

            {

                key: "people",

                title: "Personas",

                value: people,

                icon: "👤"

            },

            {

                key: "companies",

                title: "Empresas",

                value: companies,

                icon: "🏢"

            },

            {

                key: "active",

                title: "Activos",

                value: active,

                icon: "✅"

            }

        ]

    };

}

/*
==========================================================
BUILD CLIENT FILTERS
==========================================================
*/

export function buildClientFilters() {

    return {

        searchTerm: "",

        type: "",

        status: ""

    };

}

/*
==========================================================
FILTER CLIENTS
==========================================================
*/

export function filterClients(

    clients = [],

    filters = {}

) {

    const {

        searchTerm = "",

        type = "",

        status = ""

    } = filters;

    return clients.filter(client => {

        const matchesSearch =

            !searchTerm ||

            client.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())

            ||

            client.email
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())

            ||

            client.phone
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesType =

            !type ||

            client.type === type;

        const matchesStatus =

            !status ||

            client.status === status;

        return (

            matchesSearch &&

            matchesType &&

            matchesStatus

        );

    });

}