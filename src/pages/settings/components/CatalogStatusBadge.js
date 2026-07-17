const CatalogStatusBadge = ({
  value,
  options = []
}) => {

  const option = options.find(
    item => item.value === value
  );

  const label = option?.label || "-";

  let className = "catalog-badge-inactive";

  switch (value) {

    case "available":
      className = "catalog-badge-active";
      break;
    
    case "unavailable":
      className = "catalog-badge-inactive";
      break;

    case "active":
      className = "catalog-badge-active";
      break;

    case "maintenance":
    case "warning":
      className = "catalog-badge-warning";
      break;

    default:
      className = "catalog-badge-inactive";
      break;

  }

  return (

    <span className={className}>

      {label}

    </span>

  );

};

export default CatalogStatusBadge;