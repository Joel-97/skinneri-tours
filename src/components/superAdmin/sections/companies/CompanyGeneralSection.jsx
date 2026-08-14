import React from "react";
import Select from "react-select";

import {
  selectPortal
} from "../../../clients/constants/clientConstants";

const IDENTIFICATION_TYPE_OPTIONS = [

  {

    value: "legal",

    label: "Jurídica"

  },

  {

    value: "physical",

    label: "Física"

  },

  {

    value: "passport",

    label: "Pasaporte"

  },

  {

    value: "other",

    label: "Otro"

  }

];

const TIMEZONE_OPTIONS = [

  {

    value: "America/Costa_Rica",

    label: "Costa Rica (GMT-6)"

  },

  {

    value: "America/Edmonton",

    label: "Mountain Time (GMT-7)"

  },

  {

    value: "America/Vancouver",

    label: "Pacific Time (GMT-8)"

  },

  {

    value: "America/Toronto",

    label: "Eastern Time (GMT-5)"

  }

];

export default function CompanyGeneralSection({

  controller

}) {

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const {

    form,

    actions

  } = controller;

  const {

    data,

    readOnly

  } = form;

  const {

    handleChange,

    handleSelectChange

  } = actions;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="company-modal-section company-section-card">

      <h3>

        Información general

      </h3>

      <div className="company-modal-grid">

        <div>

          <label>

            Nombre

          </label>

          <input

            type="text"

            name="name"

            value={data.name || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Razón social

          </label>

          <input

            type="text"

            name="legalName"

            value={data.legalName || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Tipo de identificación

          </label>

          <Select

            options={IDENTIFICATION_TYPE_OPTIONS}

            menuPlacement="auto"

            menuPosition="absolute"

            value={
              IDENTIFICATION_TYPE_OPTIONS.find(
                option =>
                  option.value === data.identificationType
              ) || null
            }

            onChange={(option) =>
              handleSelectChange(
                "identificationType",
                option
              )
            }

            isDisabled={readOnly}

            isSearchable={false}

          />

        </div>

        <div>

          <label>

            Número de identificación

          </label>

          <input

            type="text"

            name="identificationNumber"

            value={data.identificationNumber || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Correo electrónico

          </label>

          <input

            type="email"

            name="email"

            value={data.email || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Teléfono

          </label>

          <input

            type="text"

            name="phone"

            value={data.phone || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

      </div>

    </div>

  );

}