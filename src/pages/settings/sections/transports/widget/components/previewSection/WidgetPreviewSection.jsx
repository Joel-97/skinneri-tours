/*
==========================================================
WIDGET PREVIEW SECTION
==========================================================
*/

import React from "react";

import "./WidgetPreviewSection.css";


const WidgetPreviewSection = ({
  title,
  description,
  children
}) => {


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <section
      className="tw-preview-section"
    >


      {/* ==================================================
          SECTION HEADER
      ================================================== */}

      <div
        className="tw-preview-section__header"
      >

        <h4
          className="tw-preview-section__title"
        >
          {title}
        </h4>


        {
          description && (

            <p
              className="tw-preview-section__description"
            >
              {description}
            </p>

          )
        }

      </div>


      {/* ==================================================
          SECTION CONTENT
      ================================================== */}

      <div
        className="tw-preview-section__content"
      >

        {children}

      </div>


    </section>

  );

};


export default WidgetPreviewSection;