import React from "react";

export default function ClientSearchModal({

  show,

  onClose,

  searchTerm,

  setSearchTerm,

  isSearching,

  searchResults,

  onSelectClient

}) {

  if (!show) return null;

  return (

    <div className="inner-modal search-modal">

      <div className="inner-header">

        <h3>Buscar cliente</h3>

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

      </div>

      <div className="search-input-wrapper">

        <input
          placeholder="Escribe el nombre del cliente..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          autoFocus
        />

      </div>

      {isSearching && (

        <div className="search-loading">

          Buscando clientes...

        </div>

      )}

      {!isSearching &&
        searchTerm &&
        searchResults.length === 0 && (

          <div className="search-empty">

            No se encontraron clientes.

          </div>

      )}

      <div className="search-results">

        {searchResults.map(client => (

          <div
            key={client.id}
            className="search-item"
            onClick={() => onSelectClient(client)}
          >

            <div className="search-name">

              {client.name}

            </div>

            <div className="search-email">

              {client.email || "Sin correo"}

            </div>

            <div className="search-phone">

              {client.phone || ""}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}