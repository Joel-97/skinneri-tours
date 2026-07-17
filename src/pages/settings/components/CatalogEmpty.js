const CatalogEmpty = ({
  message = "No hay registros disponibles."
}) => {

  return (

    <div className="catalog-empty">

      <p>

        {message}

      </p>

    </div>

  );

};

export default CatalogEmpty;