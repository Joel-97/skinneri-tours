import React from "react";

import DashboardWidget from "./DashboardWidget";

const MiniAgendaWidget = ({
  currentTrips,
  formatDateTime
}) => {

  return (

    <DashboardWidget
      title="Agenda del Día"
      subtitle="Próximos servicios programados"
    >

      <div className="mini-agenda-list">

        {
          currentTrips.slice(0, 5).map((trip) => (

            <div
              key={trip.id}
              className="mini-agenda-item"
            >

              <div className="mini-agenda-hour">
                {formatDateTime(trip.date)}
              </div>

              <div className="mini-agenda-content">

                <h4>
                  {trip.serviceTypeName || "-"}
                </h4>

                <p>
                  {trip.clientName || "Cliente no disponible"}
                </p>

              </div>

            </div>

          ))
        }

      </div>

    </DashboardWidget>

  );

};

export default MiniAgendaWidget;