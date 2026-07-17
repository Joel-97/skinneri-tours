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

    <div className="modal-section section-card">

      {/* =========================
          NOTAS INTERNAS
      ========================= */}

      <div className="form-grid">

        <div className="form-field">

          <label className="field-label">

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