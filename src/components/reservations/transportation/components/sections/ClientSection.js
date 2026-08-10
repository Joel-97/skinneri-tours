import React from "react";

export default function ClientSection({ controller }) {

  const {

    form,

    modals

  } = controller;

  const {

    data

  } = form;

  const {

    setShowSearchModal,

    setShowClientModal

  } = modals;

  return (

    <div className="modal-section section-card">

      <h4>Cliente</h4>

      <div className="client-actions">

        <button
          type="button"
          className="btn-ghost"
          onClick={() => setShowSearchModal(true)}
        >
          🔍 Buscar cliente
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowClientModal(true)}
        >
          + Crear cliente nuevo
        </button>

      </div>

      <div className="form-grid compact">

        <input
          value={data.clientName}
          placeholder="Nombre"
          readOnly
        />

        <input
          value={data.clientEmail}
          placeholder="Correo"
          readOnly
        />

        <input
          value={data.phone}
          placeholder="Teléfono"
          readOnly
        />

      </div>

    </div>

  );

}