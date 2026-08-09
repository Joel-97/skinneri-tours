import React from "react";
import Select from "react-select";

import {
  COMPANY_ROLES
} from "../../../../constants/platform/roles";

export default function UserCompanySection({

  controller,

  companies

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

    handleSelectChange

  } = actions;

  /*
  ==========================================================
  OPTIONS
  ==========================================================
  */

  const companyOptions =

    companies.map(company => ({

      value: company.id,

      label: company.name

    }));

  const roleOptions =

    COMPANY_ROLES.map(role => ({

      value: role.id,

      label: role.id

    }));

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="user-modal-section user-section-card">

      <h3>

        Empresa y permisos

      </h3>

      <div className="user-modal-grid">

        <div>

          <label>

            Empresa

          </label>

          <Select

            options={companyOptions}

            value={

              companyOptions.find(

                option =>

                  option.value ===

                  data.companyId

              ) || null

            }

            onChange={(option) =>

              handleSelectChange(

                "companyId",

                option

              )

            }

            placeholder="Seleccione una empresa"

            isDisabled={readOnly}

            isSearchable

            isClearable={false}

          />

        </div>

        <div>

          <label>

            Rol

          </label>

          <Select

            options={roleOptions}

            value={

              roleOptions.find(

                option =>

                  option.value ===

                  data.role

              ) || null

            }

            onChange={(option) =>

              handleSelectChange(

                "role",

                option

              )

            }

            isDisabled={readOnly}

            isSearchable={false}

          />

        </div>

      </div>

    </div>

  );

}