import React from "react";
import Select from "react-select";

import {
  selectPortal
} from "../../../clients/constants/clientConstants";

import {
  COUNTRY_OPTIONS
} from "../../../clients/constants/countryOptions";

export default function CompanyAddressSection({

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

  console.log("COUNTRY_OPTIONS", COUNTRY_OPTIONS);

  return (

    <div className="company-modal-section company-section-card">

      <h3>

        Dirección

      </h3>

      <div className="company-modal-grid">

        <div>

          <label>

            País

          </label>

          <Select

            options={COUNTRY_OPTIONS}

            menuPlacement="auto"

            menuPosition="absolute"

            value={

              COUNTRY_OPTIONS.find(

                option =>

                  option.value === data.country

              ) || null

            }

            onChange={(option) =>

              handleSelectChange(

                "country",

                option

              )

            }

            isDisabled={readOnly}

            isSearchable

            isClearable

          />

        </div>

        <div>

          <label>

            Provincia / Estado

          </label>

          <input

            type="text"

            name="province"

            value={data.province || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Ciudad

          </label>

          <input

            type="text"

            name="city"

            value={data.city || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

        <div>

          <label>

            Código postal

          </label>

          <input

            type="text"

            name="postalCode"

            value={data.postalCode || ""}

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

      </div>

      <div className="company-modal-grid company-modal-grid-single">

        <div>

          <label>

            Dirección

          </label>

          <textarea

            name="address"

            value={data.address || ""}

            onChange={handleChange}

            readOnly={readOnly}

            rows={4}

          />

        </div>

      </div>

    </div>

  );

}