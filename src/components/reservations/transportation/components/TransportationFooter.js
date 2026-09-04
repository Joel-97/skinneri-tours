import React from "react";

export default function TransportationFooter({

  mode,

  status,

  onCancel,

  onSave,

  onConfirm

}) {

  const isPending =

    status === "pending";


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


      {mode !== "create" && isPending && (

        <button
          onClick={onConfirm}
          className="btn-primary"
        >
          Confirmar reserva
        </button>

      )}

    </div>

  );

}