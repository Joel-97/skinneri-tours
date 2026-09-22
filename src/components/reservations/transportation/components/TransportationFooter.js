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


  const handleSave = async () => {

    if (!onSave) {
      return;
    }

    await onSave();

  };


  return (

    <div className="modal-footer">

      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
      >
        Cancelar
      </button>


      <button
        type="button"
        onClick={handleSave}
        className="btn-primary"
      >
        {mode === "create"
          ? "Crear reserva"
          : "Guardar cambios"}
      </button>


      {/*

      {mode !== "create" && isPending && (

        <button
          type="button"
          onClick={onConfirm}
          className="btn-primary"
        >
          Confirmar reserva
        </button>

      )}

      */}

    </div>

  );

}