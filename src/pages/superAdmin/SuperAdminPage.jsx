import React from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import PageHeader from "../../components/general/PageHeader";

import CompaniesPage from "./companies/CompaniesPage";
import UsersPage from "./users/UsersPage";
import AccessRequestsPage from "./accessRequests/AccessRequestsPage";

import "./superAdmin.css";

export default function SuperAdminPage() {

  return (

    <main className="superadmin-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <PageHeader

        title="Super Administración"

        subtitle="Administre las empresas, los usuarios y las solicitudes de acceso a la plataforma."

      />

      {/* ==================================================
          TABS
      ================================================== */}

      <Tabs>

        <TabList>

          <Tab>

            Empresas

          </Tab>

          <Tab>

            Usuarios

          </Tab>

          <Tab>

            Solicitudes

          </Tab>

        </TabList>

        {/* ==============================================
            EMPRESAS
        =============================================== */}

        <TabPanel>

          <CompaniesPage />

        </TabPanel>

        {/* ==============================================
            USUARIOS
        =============================================== */}

        <TabPanel>

          <UsersPage />

        </TabPanel>

        {/* ==============================================
            SOLICITUDES
        =============================================== */}

        <TabPanel>

          <AccessRequestsPage />

        </TabPanel>

      </Tabs>

    </main>

  );

}