/*
==========================================================
IMPORTS
==========================================================
*/

import {

  TriangleAlert

} from "lucide-react";

import {

  useTranslation

} from "../../../../hooks/useTranslation";

import "./rejectAccessRequestModal.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function RejectAccessRequestModal({

  open = false,

  loading = false,

  onCancel,

  onReject

}) {

  const {

    t

  } = useTranslation();

  /*
  ==========================================================
  HIDDEN
  ==========================================================
  */

  if (!open) {

    return null;

  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="reject-access-request-modal">

      {/* ==================================================
          BACKDROP
      =================================================== */}

      <div

        className="reject-access-request-modal__backdrop"

        onClick={onCancel}

      />

      {/* ==================================================
          CONTENT
      =================================================== */}

      <section

        className="reject-access-request-modal__container"

      >

        {/* ==============================================
            ICON
        =============================================== */}

        <div

          className="reject-access-request-modal__icon"

        >

          <TriangleAlert size={28} />

        </div>

        {/* ==============================================
            TITLE
        =============================================== */}

        <h2

          className="reject-access-request-modal__title"

        >

          {

            t(

              "superAdmin.accessRequests.reject.title"

            )

          }

        </h2>

        {/* ==============================================
            DESCRIPTION
        =============================================== */}

        <p

          className="reject-access-request-modal__description"

        >

          {

            t(

              "superAdmin.accessRequests.reject.description"

            )

          }

        </p>

        {/* ==============================================
            ACTIONS
        =============================================== */}

        <div

          className="reject-access-request-modal__actions"

        >

          <button

            type="button"

            onClick={onCancel}

            className="reject-access-request-modal__cancel-button"

          >

            {

              t(

                "superAdmin.accessRequests.actions.cancel"

              )

            }

          </button>

          <button

            type="button"

            disabled={loading}

            onClick={onReject}

            className="reject-access-request-modal__reject-button"

          >

            {

              loading

                ? t(

                    "auth.messages.loading"

                  )

                : t(

                    "superAdmin.accessRequests.actions.reject"

                  )

            }

          </button>

        </div>

      </section>

    </div>

  );

}