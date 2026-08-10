/*
==========================================================
STATS SECTION
==========================================================
*/

import React from "react";

import {
  Users,
  User,
  Building2,
  CircleCheck
} from "lucide-react";

import DashboardStats from "../components/general/DashboardStats/DashboardStats";

const StatsSection = ({ controller }) => {

  const {

    stats

  } = controller;

  const items = [

    {

      title: "Clientes",

      value: stats.totalClients,

      subtitle: "Total registrados",

      badge: `${stats.totalClients}`,

      icon: Users,

      color: "blue"

    },

    {

      title: "Personas",

      value: stats.people,

      subtitle: "Clientes individuales",

      badge: `${stats.people}`,

      icon: User,

      color: "purple"

    },

    {

      title: "Empresas",

      value: stats.companies,

      subtitle: "Clientes corporativos",

      badge: `${stats.companies}`,

      icon: Building2,

      color: "cyan"

    },

    {

      title: "Activos",

      value: stats.active,

      subtitle: "Actualmente activos",

      badge: `${stats.active}`,

      icon: CircleCheck,

      color: "green"

    }

  ];

  return (

    <DashboardStats

      items={items}

    />

  );

};

export default StatsSection;