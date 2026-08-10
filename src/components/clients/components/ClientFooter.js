import React from "react";

export default function ClientFooter({

  mode,

  onCancel,

  onSave

}) {

  return (

    <div className="client-modal-footer">

      <button
        onClick={onCancel}
        className="client-btn-secondary"
      >
        Cancelar
      </button>

      <button
        onClick={onSave}
        className="client-btn-primary"
      >
        {mode === "create"
          ? "Crear cliente"
          : "Guardar cambios"}
      </button>

    </div>

  );

}