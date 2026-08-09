import React from "react";

import { useAuth } from "../context/AuthContext";

import ClientsList from "../components/clients/ClientsList";

const Clients = () => {

  const { session } = useAuth();

  const user = session?.user;

  const companyId = session?.company?.id;

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