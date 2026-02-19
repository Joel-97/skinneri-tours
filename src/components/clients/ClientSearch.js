import React from "react";

const ClientSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <input
      type="text"
      placeholder="Buscar cliente por nombre, email o teléfono..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="form-control"
    />
  );
};

export default ClientSearch;
