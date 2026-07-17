const CatalogSearch = ({
  value = "",
  onChange,
  placeholder = "Buscar..."
}) => {

  return (

    <input
      type="text"
      className="catalog-search"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />

  );

};

export default CatalogSearch;