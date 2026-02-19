import React from "react";

const ClientSidePanel = ({ client }) => {

  if (!client) {
    return (
      <div className="card ms-3">
        <div className="card-body">
          <p>Selecciona un cliente para ver detalles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card ms-3">
      <div className="card-body">

        <h4>{client.name}</h4>

        <p><strong>Email:</strong> {client.email}</p>
        <p><strong>Teléfono:</strong> {client.phone}</p>
        <p><strong>Tipo:</strong> {client.type}</p>
        <p><strong>Status:</strong> {client.status}</p>
        <p><strong>Fuente:</strong> {client.source}</p>

        <hr />

        <p><strong>Nacionalidad:</strong> {client.nationality}</p>
        <p><strong>Cumpleaños:</strong> {client.birthday}</p>
        <p><strong>Tags:</strong> {client.tags?.join(", ")}</p>

      </div>
    </div>
  );
};

export default ClientSidePanel;
