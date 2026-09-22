import React from "react";

import {
  notifyConfirm
} from "../../../../services/notificationService";


export default function TransportationHeader({
  mode,
  reservationNumber,
  onClose,
  onClear,
  hasDraft
}) {

  const handleClear = async () => {

    if (!onClear) {
      return;
    }

    const confirmed =
      await notifyConfirm(
        "¿Limpiar campos?",
        "Se eliminará la información de esta reserva y el formulario quedará vacío."
      );

    if (!confirmed) {
      return;
    }

    onClear();
  };


  return (
    <div className="modal-header">

      <div className="modal-title-group">

        <h2>
          {mode === "create"
            ? "Nueva reserva"
            : "Editar reserva"}
        </h2>


        {mode === "edit" &&
          reservationNumber && (

          <span className="reservation-badge">
            #{reservationNumber}
          </span>

        )}

      </div>


      <div className="modal-header-actions">

        {mode === "create" &&
          hasDraft && (

          <button
            type="button"
            className="clear-fields-btn"
            onClick={handleClear}
          >
            Limpiar campos
          </button>

        )}


        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

      </div>

    </div>
  );
}