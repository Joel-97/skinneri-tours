const CatalogHeader = ({
  title,
  description,
  children
}) => {

  return (

    <div className="catalog-header">

      {/* ==================================================
          LEFT
      ================================================== */}

      <div className="catalog-header-left">

        <h3>
          {title}
        </h3>

        {

          description && (

            <p>
              {description}
            </p>

          )

        }

      </div>

      {/* ==================================================
          RIGHT
      ================================================== */}

      {

        children && (

          <div className="catalog-header-right">

            {children}

          </div>

        )

      }

    </div>

  );

};

export default CatalogHeader;