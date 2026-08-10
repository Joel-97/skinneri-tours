import React from "react";

export default function ClientNotesSection({ controller }) {

  const {

    form,

    actions

  } = controller;

  const {

    data

  } = form;

  const {

    handleChange

  } = actions;

  return (

    <div className="client-modal-section client-section-card">

      {/* =========================
          NOTAS INTERNAS
      ========================= */}

      <div className="client-form-grid">

        <div className="client-form-field">

          <label className="client-field-label">

            Notas internas

          </label>

          <textarea

            name="notes"

            value={data.notes || ""}

            onChange={handleChange}

            rows={5}

            placeholder="Agregue observaciones o información adicional sobre el cliente..."

          />

        </div>

      </div>

    </div>

  );

}