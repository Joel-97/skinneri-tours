import React from "react";

export default function ClientFooter({

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
          ? "Crear cliente"
          : "Guardar cambios"}
      </button>

    </div>

  );

}