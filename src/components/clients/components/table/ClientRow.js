import React from "react";

/*
==========================================================
COMPONENT
==========================================================
*/

const ClientRow = ({

  client,

  selected,

  onSelect,

  onEdit,

  onDelete

}) => {

  /*
  ==========================================================
  HELPERS
  ==========================================================
  */

  const clientType =

    client.type === "company"

      ? "Empresa"

      : "Persona";

  const clientStatus =

    client.status === "active"

      ? "Activo"

      : "Inactivo";

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return (

    <>

      {/* ======================================================
          NAME
      ====================================================== */}

      <td>

        <strong>

          {client.name}

        </strong>

      </td>

      {/* ======================================================
          EMAIL
      ====================================================== */}

      <td>

        {client.email || "-"}

      </td>

      {/* ======================================================
          PHONE
      ====================================================== */}

      <td>

        {client.phone || "-"}

      </td>

      {/* ======================================================
          TYPE
      ====================================================== */}

      <td className="table-center">

        {clientType}

      </td>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <td className="table-center">

        <span

          className={

            client.status === "active"

              ? "status active"

              : "status inactive"

          }

        >

          {clientStatus}

        </span>

      </td>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <td className="table-center">

        <div className="d-flex justify-content-center gap-2">

          <button

            className="btn btn-sm btn-outline-primary"

            onClick={(event) => {

              event.stopPropagation();

              onEdit(client);

            }}

            title="Editar"

          >

            ✏️

          </button>

          <button

            className="btn btn-sm btn-outline-danger"

            onClick={(event) => {

              event.stopPropagation();

              onDelete(client);

            }}

            title="Eliminar"

          >

            🗑️

          </button>

        </div>

      </td>

    </>

  );

};

export default ClientRow;