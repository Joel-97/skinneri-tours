/*
==========================================================
STATS SECTION
==========================================================
*/

import React from "react";

import StatsGrid from "../../general/StatsGrid";

const StatsSection = ({

    stats

}) => {

    const items = [

        {

            label: "Clientes",

            value: stats.totalClients

        },

        {

            label: "Personas",

            value: stats.people

        },

        {

            label: "Empresas",

            value: stats.companies

        },

        {

            label: "Activos",

            value: stats.active

        }

    ];

    return (

        <StatsGrid

            items={items}

        />

    );

};

export default StatsSection;