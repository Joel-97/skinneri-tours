/*
==========================================================
ACTIVITY TABLE
==========================================================
*/

import { formatDate } from "../../../utils/formatDate";
import { formatCurrency } from "../../../../../utils/formatCurrency";

import { activityStatus } from "../../../../../constants/activityStatus";

const ActivityTable = ({

  activity = []

}) => {

  return (

    <div className="activity-table">

      <table>

        <thead>

          <tr>

            <th>

              Fecha

            </th>

            <th>

              Actividad

            </th>

            <th>

              Estado

            </th>

            <th>

              Total

            </th>

          </tr>

        </thead>

        <tbody>

          {

            activity.map((item) => {

              const status =

                activityStatus[item.status];

              return (

                <tr

                  key={item.id}

                >

                  {/* ======================================================
                      DATE
                  ====================================================== */}

                  <td>

                    {

                      formatDate(

                        item.date

                      )

                    }

                  </td>

                  {/* ======================================================
                      ACTIVITY
                  ====================================================== */}

                  <td>

                    <div className="activity-table-title">

                      <span

                        className="activity-category-badge"

                        style={{

                          backgroundColor: `${item.color}20`,

                          color: item.color

                        }}

                      >

                        {

                          item.label

                        }

                      </span>

                      <strong>

                        {

                          item.title

                        }

                      </strong>

                      <small>

                        {

                          item.subtitle

                        }

                      </small>

                    </div>

                  </td>

                  {/* ======================================================
                      STATUS
                  ====================================================== */}

                  <td>

                    <span

                      className="activity-status"

                      style={{

                        backgroundColor:

                          status?.background ||

                          "#F8FAFC",

                        color:

                          status?.color ||

                          "#475569"

                      }}

                    >

                      {

                        status?.label ||

                        item.status ||

                        "-"

                      }

                    </span>

                  </td>

                  {/* ======================================================
                      TOTAL
                  ====================================================== */}

                  <td>

                    <span

                      className="activity-total"

                    >

                      {

                        formatCurrency(

                          item.total,

                          item.currencySymbol

                        )

                      }

                    </span>

                  </td>

                </tr>

              );

            })

          }

        </tbody>

      </table>

    </div>

  );

};

export default ActivityTable;