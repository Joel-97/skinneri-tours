import React from "react";

import "../../style/home/widget.css";

/* ======================================================
   DASHBOARD WIDGET
====================================================== */

const DashboardWidget = ({

  title,

  subtitle,

  children,

  headerRight = null,

  actions = null,

  className = ""

}) => {

  /*
  ==========================================================
  HEADER
  ==========================================================
  */

  const hasHeader =

    title ||

    subtitle ||

    headerRight ||

    actions;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <section

      className={

        `dashboard-widget-base ${className}`

      }

    >

      {

        hasHeader && (

          <header

            className="dashboard-widget-header"

          >

            {/* ==========================================
                LEFT
            =========================================== */}

            <div

              className="dashboard-widget-header-left"

            >

              {

                title && (

                  <h2>

                    {title}

                  </h2>

                )

              }

              {

                subtitle && (

                  <p>

                    {subtitle}

                  </p>

                )

              }

            </div>

            {/* ==========================================
                RIGHT
            =========================================== */}

            {

              (headerRight || actions) && (

                <div

                  className="dashboard-widget-header-right"

                >

                  {

                    headerRight && (

                      <div

                        className="dashboard-widget-header-extra"

                      >

                        {headerRight}

                      </div>

                    )

                  }

                  {

                    actions && (

                      <div

                        className="dashboard-widget-actions"

                      >

                        {actions}

                      </div>

                    )

                  }

                </div>

              )

            }

          </header>

        )

      }

      {/* ==============================================
          CONTENT
      =============================================== */}

      <div

        className="dashboard-widget-content"

      >

        {children}

      </div>

    </section>

  );

};

export default DashboardWidget;