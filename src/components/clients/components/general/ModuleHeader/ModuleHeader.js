import React from "react";

import "./ModuleHeader.css";

/*
==========================================================
MODULE HEADER
==========================================================
*/

const ModuleHeader = ({

  title,

  subtitle,

  children

}) => {

  return (

    <header className="module-header">

      <div className="module-header-content">

        {/* ==========================================
            INFO
        ========================================== */}

        <div className="module-header-info">

          <h1 className="module-title">

            {title}

          </h1>

          {

            subtitle && (

              <p className="module-subtitle">

                {subtitle}

              </p>

            )

          }

        </div>

        {/* ==========================================
            ACTIONS
        ========================================== */}

        {

          children && (

            <div className="module-header-actions">

              {children}

            </div>

          )

        }

      </div>

    </header>

  );

};

export default ModuleHeader;