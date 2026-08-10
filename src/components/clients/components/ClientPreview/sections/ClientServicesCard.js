/*
==========================================================
CLIENT SERVICES CARD
==========================================================
*/

import {

  Briefcase,
  Calendar,
  ArrowRight,
  ClipboardList

} from "lucide-react";

import { formatDate } from "../../../utils/formatDate";

const MAX_RECENT_ACTIVITY = 3;

const ClientServicesCard = ({

  activity = [],

  onViewHistory

}) => {

  /*
  ==========================================================
  RECENT ACTIVITY
  ==========================================================
  */

  const recentActivity = activity.slice(

    0,

    MAX_RECENT_ACTIVITY

  );

  return (

    <section className="client-preview-card">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h3>

        Actividad reciente

      </h3>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {

        recentActivity.length === 0 && (

          <div className="client-services-empty">

            <ClipboardList size={22} />

            <p>

              Todavía no existe actividad registrada para este cliente.

            </p>

          </div>

        )

      }

      {/* ======================================================
          ACTIVITY
      ====================================================== */}

      {

        recentActivity.length > 0 && (

          <div className="client-services-list">

            {

              recentActivity.map((item) => (

                <div

                  key={item.id}

                  className="client-service-item"

                >

                  <div

                    className="client-service-icon"

                  >

                    <Briefcase size={18} />

                  </div>

                  <div

                    className="client-service-content"

                  >

                    <strong>

                      {

                        item.title ||

                        "Actividad"

                      }

                    </strong>

                    <span>

                      {

                        item.subtitle ||

                        "Sin información"

                      }

                    </span>

                    <small>

                      <Calendar size={13} />

                      {

                        formatDate(

                          item.date

                        ) ||

                        "Sin fecha"

                      }

                    </small>

                  </div>

                  <ArrowRight

                    size={16}

                    className="client-service-arrow"

                  />

                </div>

              ))

            }

          </div>

        )

      }

      {/* ======================================================
          VIEW ALL ACTIVITY
      ====================================================== */}

      {

        activity.length > MAX_RECENT_ACTIVITY && (

          <button

            type="button"

            className="client-services-more"

            onClick={onViewHistory}

          >

            Ver toda la actividad

          </button>

        )

      }

    </section>

  );

};

export default ClientServicesCard;