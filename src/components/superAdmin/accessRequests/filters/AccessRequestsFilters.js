/*
==========================================================
IMPORTS
==========================================================
*/

import { Search } from "lucide-react";

import { useTranslation } from "../../../../hooks/useTranslation";

import "./accessRequestsFilters.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AccessRequestsFilters({

  search = "",

  status = "all",

  onSearchChange,

  onStatusChange

}) {

  const {

    t

  } = useTranslation();

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <section className="access-requests-filters">

      {/* ==============================================
          SEARCH
      =============================================== */}

      <div className="access-requests-filters__search">

        <Search

          size={18}

          className="access-requests-filters__search-icon"

        />

        <input

          type="text"

          value={search}

          placeholder={

            t(

              "superAdmin.accessRequests.searchPlaceholder"

            )

          }

          onChange={(event) =>

            onSearchChange?.(

              event.target.value

            )

          }

          className="access-requests-filters__search-input"

        />

      </div>

      {/* ==============================================
          STATUS
      =============================================== */}

      <div className="access-requests-filters__status">

        <select

          value={status}

          onChange={(event) =>

            onStatusChange?.(

              event.target.value

            )

          }

          className="access-requests-filters__status-select"

        >

          <option value="all">

            {

              t(

                "superAdmin.accessRequests.all"

              )

            }

          </option>

          <option value="pending">

            {

              t(

                "superAdmin.accessRequests.pending"

              )

            }

          </option>

          <option value="approved">

            {

              t(

                "superAdmin.accessRequests.approved"

              )

            }

          </option>

          <option value="rejected">

            {

              t(

                "superAdmin.accessRequests.rejected"

              )

            }

          </option>

        </select>

      </div>

    </section>

  );

}