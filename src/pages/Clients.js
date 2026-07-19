import React from "react";

import { UserAuth } from "../context/AuthContext";
import { useCompany } from "../context/CompanyContext";

import ClientsList from "../components/clients/ClientsList";

const Clients = () => {

  const { user } = UserAuth();

  const { companyId } = useCompany();

  return (

    <div className="container-dashboard">

      <ClientsList

        companyId={companyId}

        user={user}

      />

    </div>

  );

};

export default Clients;