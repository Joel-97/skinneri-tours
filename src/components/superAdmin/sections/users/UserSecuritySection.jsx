import React from "react";
import Select from "react-select";

import {
  USER_STATUS
} from "../../../../constants/platform/userStatus";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function UserSecuritySection({

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

    handleSelectChange

  } = actions;

  /*
  ==========================================================
  OPTIONS
  ==========================================================
  */

  const statusOptions =

    Object.values(

      USER_STATUS

    ).map(status => ({

      value: status.id,

      label: status.label

    }));

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="user-modal-section user-section-card">

      <h3>

        Seguridad

      </h3>

      <div className="user-modal-grid">

        <div>

          <label>

            Estado

          </label>

          <Select

            options={statusOptions}

            value={

              statusOptions.find(

                option =>

                  option.value ===

                  data.status

              ) || null

            }

            onChange={(option) =>

              handleSelectChange(

                "status",

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