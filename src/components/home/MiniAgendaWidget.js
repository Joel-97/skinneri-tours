import React from "react";

import DashboardWidget from "./DashboardWidget";

const MiniAgendaWidget = ({

  dashboard,

  formatDateTime

}) => {

  /*
  ==========================================================
  TODAY TRIPS
  ==========================================================
  */

  const todayTrips =

    dashboard?.trips?.today || [];

  return (

    <DashboardWidget

      title="Agenda del Día"

      subtitle="Próximos servicios programados"

    >

      {

        todayTrips.length === 0

          ? (

            <div className="widget-empty-state">

              <div className="widget-empty-icon">

                📅

              </div>

              <h3>

                Sin servicios programados

              </h3>

              <p>

                No existen servicios para el día de hoy.

              </p>

            </div>

          )

          : (

            <div className="mini-agenda-list">

              {

                todayTrips

                  .slice(0, 5)

                  .map((trip) => (

                    <div

                      key={trip.id}

                      className="mini-agenda-item"

                    >

                      <div className="mini-agenda-hour">

                        {

                          formatDateTime(

                            trip.date

                          )

                        }

                      </div>

                      <div className="mini-agenda-content">

                        <h4>

                          {

                            trip.serviceTypeName ||

                            "-"

                          }

                        </h4>

                        <p>

                          {

                            trip.clientName ||

                            "Cliente no disponible"

                          }

                        </p>

                      </div>

                    </div>

                  ))

              }

            </div>

          )

      }

    </DashboardWidget>

  );

};

export default MiniAgendaWidget;