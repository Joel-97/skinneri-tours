import React from "react";

import {
  ACTIVE_MODULES
} from "../../../../constants/platform/modules";

import {
  ACTIVE_COMPANY_STATUS
} from "../../../../constants/platform/companyStatus";

export default function CompanyPlatformSection({

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

    handleSelectChange,

    handleToggleArray

  } = actions;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="company-modal-section company-section-card">

      <h3>

        Plataforma

      </h3>

      {/* ==================================================
          STATUS
      =================================================== */}

      <div className="company-platform-block">

        <label className="company-platform-title">

          Estado

        </label>

        <div className="company-status-group">

          {

            ACTIVE_COMPANY_STATUS.map(status => (

              <label

                key={status.id}

                className="company-radio"

              >

                <input

                  type="radio"

                  disabled={readOnly}

                  checked={

                    data.status === status.id

                  }

                  onChange={() =>

                    handleSelectChange(

                      "status",

                      {

                        value: status.id

                      }

                    )

                  }

                />

                <span>

                  {status.id}

                </span>

              </label>

            ))

          }

        </div>

      </div>

      {/* ==================================================
          MODULES
      =================================================== */}

      <div className="company-platform-block">

        <label className="company-platform-title">

          Módulos habilitados

        </label>

        <div className="company-modules-grid">

          {

            ACTIVE_MODULES.map(module => (

              <label

                key={module.id}

                className="company-module-item"

              >

                <input

                  type="checkbox"

                  disabled={readOnly}

                  checked={

                    (

                      data.enabledModules || []

                    ).includes(

                      module.id

                    )

                  }

                  onChange={() =>

                    handleToggleArray(

                      "enabledModules",

                      module.id

                    )

                  }

                />

                <span>

                  {module.name || module.id}

                </span>

              </label>

            ))

          }

        </div>

      </div>

    </div>

  );

}