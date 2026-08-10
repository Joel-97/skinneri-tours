/*
==========================================================
CLIENTS CONTENT
==========================================================
*/

import "./ClientsContent.css";

const ClientsContent = ({

  children,

  selectedClient

}) => {

  return (

    <section
      className={`clients-content ${
        selectedClient
          ? "has-preview"
          : ""
      }`}
    >

      {children}

    </section>

  );

};

export default ClientsContent;