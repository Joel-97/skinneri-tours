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

    <div className="modal-section section-card">

      {/* =========================
          EMPRESA E IDENTIFICACIÓN
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

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

        <div className="form-field">

          <label className="field-label">

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