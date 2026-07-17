const CatalogActions = ({ children }) => {

  return (

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap"
      }}
    >

      {children}

    </div>

  );

};

export default CatalogActions;