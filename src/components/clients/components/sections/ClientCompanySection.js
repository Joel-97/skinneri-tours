import React from "react";

export default function ClientCompanySection({ controller }) {

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
          EMPRESA E IDENTIFICACIÓN
      ========================= */}

      <div className="client-form-grid client-two-columns">

        <div className="client-form-field">

          <label className="client-field-label">

            Empresa

          </label>

          <input
            type="text"
            name="company"
            value={data.company || ""}
            onChange={handleChange}
            placeholder="Nombre de la empresa"
          />

        </div>

        <div className="client-form-field">

          <label className="client-field-label">

            Identificación

          </label>

          <input
            type="text"
            name="identification"
            value={data.identification || ""}
            onChange={handleChange}
            placeholder="Número de identificación"
          />

        </div>

      </div>

    </div>

  );

}