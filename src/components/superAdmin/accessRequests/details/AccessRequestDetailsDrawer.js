/*
==========================================================
IMPORTS
==========================================================
*/

import {

  useEffect,
  useState

} from "react";

import {

  X

} from "lucide-react";

import {

  useTranslation

} from "../../../../hooks/useTranslation";

import "./accessRequestDetailsDrawer.css";

/*
==========================================================
ANIMATION
==========================================================
*/

const ANIMATION_DURATION = 350;

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AccessRequestDetailsDrawer({

  open = false,

  request = null,

  onClose,

  children

}) {

  const {

    t

  } = useTranslation();

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    isVisible,

    setIsVisible

  ] = useState(open);

  /*
  ==========================================================
  EFFECT
  ==========================================================
  */

  useEffect(() => {

    if (open) {

      setIsVisible(true);

      return;

    }

    const timer = setTimeout(

      () => {

        setIsVisible(false);

      },

      ANIMATION_DURATION

    );

    return () => clearTimeout(timer);

  }, [

    open

  ]);

  /*
  ==========================================================
  HIDDEN
  ==========================================================
  */

  if (!isVisible || !request) {

    return null;

  }

  /*
  ==========================================================
  CLASSES
  ==========================================================
  */

  const drawerClassName = [

    "access-request-details-drawer",

    open

      ? "access-request-details-drawer--open"

      : "access-request-details-drawer--closing"

  ]

    .filter(Boolean)

    .join(" ");

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <aside

      className={drawerClassName}

    >

      {/* ==================================================
          BACKDROP
      =================================================== */}

      <div

        className="access-request-details-drawer__backdrop"

        onClick={onClose}

      />

      {/* ==================================================
          PANEL
      =================================================== */}

      <section

        className="access-request-details-drawer__panel"

      >

        {/* ==============================================
            HEADER
        =============================================== */}

        <header

          className="access-request-details-drawer__header"

        >

          <div>

            <h2

              className="access-request-details-drawer__title"

            >

              {

                t(

                  "superAdmin.accessRequests.details.title"

                )

              }

            </h2>

            <p

              className="access-request-details-drawer__subtitle"

            >

              {

                request.displayName

              }

            </p>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="access-request-details-drawer__close-button"

          >

            <X size={20} />

          </button>

        </header>

        {/* ==============================================
            BODY
        =============================================== */}

        <div

          className="access-request-details-drawer__body"

        >

          <section

            className="access-request-details-drawer__information"

          >

            <div

              className="access-request-details-drawer__field"

            >

              <span

                className="access-request-details-drawer__label"

              >

                {

                  t(

                    "superAdmin.accessRequests.table.name"

                  )

                }

              </span>

              <span

                className="access-request-details-drawer__value"

              >

                {

                  request.displayName

                }

              </span>

            </div>

            <div

              className="access-request-details-drawer__field"

            >

              <span

                className="access-request-details-drawer__label"

              >

                {

                  t(

                    "superAdmin.accessRequests.table.email"

                  )

                }

              </span>

              <span

                className="access-request-details-drawer__value"

              >

                {

                  request.email

                }

              </span>

            </div>

            <div

              className="access-request-details-drawer__field"

            >

              <span

                className="access-request-details-drawer__label"

              >

                {

                  t(

                    "superAdmin.accessRequests.table.requestedAt"

                  )

                }

              </span>

              <span

                className="access-request-details-drawer__value"

              >

                {

                  request.requestedAt

                }

              </span>

            </div>

          </section>

          {/* ==============================================
              CONTENT
          =============================================== */}

          <section

            className="access-request-details-drawer__content"

          >

            {children}

          </section>

        </div>

      </section>

    </aside>

  );

}