import React from "react";

export default function NotesSection({ controller }) {

  const { form, actions } = controller;

  const { data } = form;

  const { handleChange } = actions;

  return (

    <div className="modal-section full-width">

      <h4>

        Notas

      </h4>

      <textarea

        className="notes-textarea"

        name="notes"

        placeholder="Notas internas de la reserva..."

        value={data.notes || ""}

        onChange={handleChange}

      />

    </div>

  );

}