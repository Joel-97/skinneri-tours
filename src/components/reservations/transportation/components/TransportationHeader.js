import React from "react";

export default function TransportationHeader({

  mode,

  reservationNumber,

  onClose

}) {

  return (

    <div className="modal-header">

      <div className="modal-title-group">

        <h2>
          {mode === "create"
            ? "Nueva reserva"
            : "Editar reserva"}
        </h2>

        {mode === "edit" && reservationNumber && (

          <span className="reservation-badge">

            #{reservationNumber}

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