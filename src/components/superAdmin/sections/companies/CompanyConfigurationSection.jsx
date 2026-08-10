import React from "react";
import Select from "react-select";

import {
  selectPortal
} from "../../../clients/constants/clientConstants";

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

export default function CompanyConfigurationSection({

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

        Configuración

      </h3>

      <div className="company-modal-grid">

        <div>

          <label>

            Sitio web

          </label>

          <input

            type="text"

            name="website"

            value={data.website || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Zona horaria

          </label>

          <Select

            options={TIMEZONE_OPTIONS}

            menuPlacement="auto"

            menuPosition="absolute"

            value={

              TIMEZONE_OPTIONS.find(

                option =>

                  option.value === data.timezone

              ) || null

            }

            onChange={(option) =>

              handleSelectChange(

                "timezone",

                option

              )

            }

            isDisabled={readOnly}

            isSearchable={false}

          />

        </div>

        <div>

          <label>

            Color principal

          </label>

          <input

            type="color"

            name="primaryColor"

            value={

              data.primaryColor ||

              "#08204B"

            }

            onChange={handleChange}

            disabled={readOnly}

          />

        </div>

      </div>

    </div>

  );

}