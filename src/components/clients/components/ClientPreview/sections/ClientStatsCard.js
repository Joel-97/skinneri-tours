/*
==========================================================
CLIENT STATS CARD
==========================================================
*/

import {

  Calendar,
  ClipboardList,
  DollarSign,
  Clock,
  Star

} from "lucide-react";

const ClientStatsCard = ({

  client

}) => {

  return (

    <section className="client-preview-card">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h3>

        Estadísticas

      </h3>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="client-stats-list">

        {/* Total Reservations */}

        <div className="client-stat-item">

          <ClipboardList size={18} />

          <div>

            <label>

              Total de reservas

            </label>

            <strong>

              {

                client.totalReservations ??

                "—"

              }

            </strong>

          </div>

        </div>

        {/* Last Reservation */}

        <div className="client-stat-item">

          <Calendar size={18} />

          <div>

            <label>

              Última reserva

            </label>

            <strong>

              {

                client.lastReservation ||

                "Sin información"

              }

            </strong>

          </div>

        </div>

        {/* Next Reservation */}

        <div className="client-stat-item">

          <Clock size={18} />

          <div>

            <label>

              Próxima reserva

            </label>

            <strong>

              {

                client.nextReservation ||

                "Sin información"

              }

            </strong>

          </div>

        </div>

        {/* Total Spent */}

        <div className="client-stat-item">

          <DollarSign size={18} />

          <div>

            <label>

              Total gastado

            </label>

            <strong>

              {

                client.totalSpent ||

                "Sin información"

              }

            </strong>

          </div>

        </div>

        {/* Favorite Service */}

        <div className="client-stat-item">

          <Star size={18} />

          <div>

            <label>

              Servicio favorito

            </label>

            <strong>

              {

                client.favoriteService ||

                "Sin información"

              }

            </strong>

          </div>

        </div>

      </div>

    </section>

  );

};

export default ClientStatsCard;