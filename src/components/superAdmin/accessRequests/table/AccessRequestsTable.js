/*
==========================================================
IMPORTS
==========================================================
*/

import DataTable from "../../../general/dataTable";

import { useTranslation } from "../../../../hooks/useTranslation";

import "./accessRequestsTable.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AccessRequestsTable({

  requests = [],

  onView

}) {

  const {

    t

  } = useTranslation();

  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

  const columns = [

    {

      key: "displayName",

      label: t(

        "superAdmin.accessRequests.table.name"

      ),

      sortable: true

    },

    {

      key: "email",

      label: t(

        "superAdmin.accessRequests.table.email"

      ),

      sortable: true

    },

    {

      key: "requestedAt",

      label: t(

        "superAdmin.accessRequests.table.requestedAt"

      ),

      sortable: true

    },

    {

      key: "status",

      label: t(

        "superAdmin.accessRequests.table.status"

      ),

      sortable: true

    },

    {

      key: "actions",

      label: t(

        "superAdmin.accessRequests.table.actions"

      ),

      sortable: false,

      width: "140px"

    }

  ];

  /*
  ==========================================================
  RENDER ROW
  ==========================================================
  */

  function renderRow(request) {

    return (

      <>

        <td>

          {request.displayName}

        </td>

        <td>

          {request.email}

        </td>

        <td>

          {request.requestedAt}

        </td>

        <td>

          <span

            className={

              `access-requests-table__status access-requests-table__status--${request.status}`

            }

          >

            {

              t(

                `superAdmin.accessRequests.status.${request.status}`

              )

            }

          </span>

        </td>

        <td>

          <button

            type="button"

            className="access-requests-table__view-button"

            onClick={() =>

              onView?.(

                request

              )

            }

          >

            {

              t(

                "superAdmin.accessRequests.actions.view"

              )

            }

          </button>

        </td>

      </>

    );

  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <DataTable

      data={requests}

      columns={columns}

      renderRow={renderRow}

      emptyTitle={

        t(

          "superAdmin.accessRequests.empty"

        )

      }

    />

  );

}