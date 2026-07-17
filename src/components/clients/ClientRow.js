import React from "react";

const ClientRow = ({

  client,

  canDelete,

  onEdit,

  onDelete

}) => {

  return (

    <>

      <td>

        <strong>

          {client.name}

        </strong>

      </td>

      <td>

        {client.email || "-"}

      </td>

      <td>

        {client.phone || "-"}

      </td>

      <td className="table-center">

        {client.type || "-"}

      </td>

      <td className="table-center">

        <div className="d-flex justify-content-center gap-2">

          <button

            className="btn btn-sm btn-outline-primary"

            onClick={(event) => {

              event.stopPropagation();

              onEdit(client);

            }}

          >

            ✏️

          </button>

          {

            canDelete && (

              <button

                className="btn btn-sm btn-outline-danger"

                onClick={(event) => {

                  event.stopPropagation();

                  onDelete(client, event);

                }}

              >

                🗑️

              </button>

            )

          }

        </div>

      </td>

    </>

  );

};

export default ClientRow;