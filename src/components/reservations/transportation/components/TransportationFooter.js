import React from "react";

export default function TransportationFooter({

  mode,

  onCancel,

  onSave

}) {

  return (

    <div className="modal-footer">

      <button
        onClick={onCancel}
        className="btn-secondary"
      >
        Cancelar
      </button>

      <button
        onClick={onSave}
        className="btn-primary"
      >
        {mode === "create"
          ? "Crear reserva"
          : "Guardar cambios"}
      </button>

    </div>

  );

}