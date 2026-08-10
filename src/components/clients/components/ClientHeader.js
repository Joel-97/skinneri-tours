import React from "react";

export default function ClientHeader({

  mode,

  client,

  onClose

}) {

  return (

    <div className="client-modal-header">

      <div className="client-modal-title-group">

        <h2>

          {mode === "create"
            ? "Nuevo cliente"
            : "Editar cliente"}

        </h2>

        {mode === "edit" && client?.name && (

          <span className="client-reservation-badge">

            {client.name}

          </span>

        )}

      </div>

      <button
        className="client-close-btn"
        onClick={onClose}
      >
        ✕

      </button>

    </div>

  );

}