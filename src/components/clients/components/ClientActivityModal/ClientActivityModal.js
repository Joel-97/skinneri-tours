/*
==========================================================
CLIENT ACTIVITY MODAL
==========================================================
*/

import Modal from "../../../../components/general/modal";

import ActivityTable from "./components/ActivityTable";

import { formatDate } from "../../utils/formatDate";

import "./ClientActivityModal.css";

const ClientActivityModal = ({

  isOpen,

  profile,

  onClose

}) => {

  /*
  ==========================================================
  CLOSED
  ==========================================================
  */

  if (!isOpen || !profile) {

    return null;

  }

  const {

    client,

    activity,

    financialSummary

  } = profile;

  return (

    <Modal

      size="xl"

      onClose={onClose}

    >

      <div className="client-activity-modal">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="client-activity-header">

          <div>

            <h2>

              Historial del cliente

            </h2>

            <p>

              {client.name}

            </p>

            {/* ======================================================
                CLIENT SINCE
            ====================================================== */}

            <span className="client-since">

              Cliente desde {

                formatDate(

                  client.createdAt

                ) || "Sin información"

              }

            </span>

            {/* ======================================================
                FINANCIAL SUMMARY
            ====================================================== */}

            {

              financialSummary.length > 0 && (

                <div className="client-financial-summary">

                  {

                    financialSummary.map((currency) => (

                      <div

                        key={currency.currencyCode}

                        className="client-financial-item"

                      >

                        <span>

                          {

                            currency.currencyCode

                          }

                        </span>

                        <strong>

                          {

                            currency.currencySymbol

                          }

                          {

                            Number(

                              currency.total

                            ).toLocaleString(

                              undefined,

                              {

                                minimumFractionDigits: 2,

                                maximumFractionDigits: 2

                              }

                            )

                          }

                        </strong>

                      </div>

                    ))

                  }

                </div>

              )

            }

          </div>

          <button

            className="client-activity-close"

            onClick={onClose}

          >

            ✕

          </button>

        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="client-activity-body">

          <ActivityTable

            activity={activity}

          />

        </div>

      </div>

    </Modal>

  );

};

export default ClientActivityModal;