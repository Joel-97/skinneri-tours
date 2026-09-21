import React from "react";

import {
    FaClipboardList,
    FaUsers
} from "react-icons/fa";


const TransportationReservationsSummary = ({
    reservationCount,
    totalPassengers,
    hasFilters
}) => {

    return (

        <section className="transportation-reservations__summary">

            <div className="transportation-reservations__summary-card">

                <div className="transportation-reservations__summary-icon">

                    <FaClipboardList />

                </div>


                <div className="transportation-reservations__summary-content">

                    <span>
                        Reservaciones
                    </span>

                    <strong>
                        {reservationCount}
                    </strong>

                    <small>
                        Reservaciones encontradas
                    </small>

                </div>

            </div>


            <div className="transportation-reservations__summary-card">

                <div className="transportation-reservations__summary-icon transportation-reservations__summary-icon--passengers">

                    <FaUsers />

                </div>


                <div className="transportation-reservations__summary-content">

                    <span>
                        Pasajeros
                    </span>

                    <strong>
                        {totalPassengers}
                    </strong>

                    <small>
                        Pasajeros registrados
                    </small>

                </div>

            </div>


            {
                hasFilters && (

                    <div className="transportation-reservations__summary-filtered">

                        <span className="transportation-reservations__summary-filtered-dot" />

                        Filtros activos

                    </div>

                )
            }

        </section>

    );

};


export default TransportationReservationsSummary;