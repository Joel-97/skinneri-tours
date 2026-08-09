import React from "react";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function UserGeneralSection({

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

    handleChange

  } = actions;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="user-modal-section user-section-card">

      <h3>

        Información general

      </h3>

      <div className="user-modal-grid">

        <div>

          <label>

            Nombre completo

          </label>

          <input

            type="text"

            name="displayName"

            value={

              data.displayName || ""

            }

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

            value={

              data.email || ""

            }

            onChange={handleChange}

            readOnly={readOnly}

          />

        </div>

      </div>

    </div>

  );

}