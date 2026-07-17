import React from "react";

export default function ClientHeader({

  mode,

  client,

  onClose

}) {

  return (

    <div className="modal-header">

      <div className="modal-title-group">

        <h2>

          {mode === "create"
            ? "Nuevo cliente"
            : "Editar cliente"}

        </h2>

        {mode === "edit" && client?.name && (

          <span className="reservation-badge">

            {client.name}

          </span>

        )}

      </div>

      <button
        className="close-btn"
        onClick={onClose}
      >
        ✕

      </button>

    </div>

  );

}