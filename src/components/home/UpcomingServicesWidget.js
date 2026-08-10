import React, {

  useMemo,
  useState

} from "react";

import DashboardWidget from "./DashboardWidget";

const ITEMS_PER_PAGE = 6;

const UpcomingServicesWidget = ({

  loading,

  dashboard,

  formatDateTime,

  capitalize

}) => {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    currentPage,

    setCurrentPage

  ] = useState(1);

  /*
  ==========================================================
  TRIPS
  ==========================================================
  */

  const trips =

    dashboard?.trips?.upcoming ||

    [];

  /*
  ==========================================================
  PAGINATION
  ==========================================================
  */

  const totalPages = Math.max(

    1,

    Math.ceil(

      trips.length /

      ITEMS_PER_PAGE

    )

  );

  const currentTrips = useMemo(() => {

    const start =

      (currentPage - 1) *

      ITEMS_PER_PAGE;

    return trips.slice(

      start,

      start +

      ITEMS_PER_PAGE

    );

  }, [

    currentPage,

    trips

  ]);

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <DashboardWidget

      title="Próximos Servicios"

      subtitle="Servicios programados para las próximas horas"

      className="upcoming-services-widget"

    >

      {

        loading

          ? (

            <div className="widget-loading-state">

              <div className="skeleton skeleton-table-row"></div>

              <div className="skeleton skeleton-table-row"></div>

              <div className="skeleton skeleton-table-row"></div>

              <div className="skeleton skeleton-table-row"></div>

            </div>

          )

          : trips.length === 0

            ? (

              <div className="widget-empty-state">

                <div className="widget-empty-icon">

                  📭

                </div>

                <h3>

                  No hay servicios próximos

                </h3>

                <p>

                  Todo se ve tranquilo por ahora.

                </p>

              </div>

            )

            : (

              <>

                <div className="table-scroll-modern">

                  <table className="trips-table-modern">

                    <thead>

                      <tr>

                        <th>Hora</th>

                        <th>Cliente</th>

                        <th>Servicio</th>

                        <th>Estado</th>

                      </tr>

                    </thead>

                    <tbody>

                      {

                        currentTrips.map((trip) => {

                          const status =

                            trip.status ||

                            "pending";

                          return (

                            <tr

                              key={trip.id}

                            >

                              <td>

                                {

                                  formatDateTime(

                                    trip.date

                                  )

                                }

                              </td>

                              <td>

                                {

                                  trip.clientName ||

                                  "-"

                                }

                              </td>

                              <td>

                                {

                                  trip.serviceTypeName ||

                                  "-"

                                }

                              </td>

                              <td>

                                <span

                                  className={`status-badge-modern ${status}`}

                                >

                                  {

                                    capitalize(

                                      status

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

                {

                  totalPages > 1 && (

                    <div className="pagination-modern">

                      <button

                        disabled={

                          currentPage === 1

                        }

                        onClick={() =>

                          setCurrentPage(

                            (page) =>

                              page - 1

                          )

                        }

                      >

                        ←

                      </button>

                      <span>

                        {

                          currentPage

                        }

                        {" / "}

                        {

                          totalPages

                        }

                      </span>

                      <button

                        disabled={

                          currentPage ===

                          totalPages

                        }

                        onClick={() =>

                          setCurrentPage(

                            (page) =>

                              page + 1

                          )

                        }

                      >

                        →

                      </button>

                    </div>

                  )

                }

              </>

            )

      }

    </DashboardWidget>

  );

};

export default UpcomingServicesWidget;