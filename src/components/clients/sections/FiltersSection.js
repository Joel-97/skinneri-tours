/*
==========================================================
FILTERS SECTION
==========================================================
*/

import React from "react";
import Select from "react-select";

import ModuleFilters from "../components/general/ModuleFilters/ModuleFilters";

import { Search, Eraser } from "lucide-react";

import { CLIENT_TYPE } from "../constants/clientTypeFilters";
import { CLIENT_STATUS } from "../constants/clientStatusFilters";

/* ======================================================
   SELECT STYLES
====================================================== */

const selectStyles = {

  control: (base, state) => ({

    ...base,

    minHeight: 46,

    height: 46,

    borderRadius: 12,

    borderColor: state.isFocused
      ? "#08204B"
      : "#DBE3EC",

    backgroundColor: "#FFFFFF",

    boxShadow: state.isFocused
      ? "0 0 0 3px rgba(8,32,75,.08)"
      : "none",

    cursor: "pointer",

    transition: "all .2s ease",

    "&:hover": {

      borderColor: "#08204B"

    }

  }),

  valueContainer: (base) => ({

    ...base,

    padding: "0 12px"

  }),

  input: (base) => ({

    ...base,

    margin: 0,

    padding: 0

  }),

  placeholder: (base) => ({

    ...base,

    color: "#94A3B8"

  }),

  singleValue: (base) => ({

    ...base,

    color: "#0F172A",

    fontSize: 14

  }),

  indicatorsContainer: (base) => ({

    ...base,

    height: 44

  }),

  dropdownIndicator: (base) => ({

    ...base,

    color: "#64748B",

    "&:hover": {

      color: "#08204B"

    }

  }),

  indicatorSeparator: () => ({

    display: "none"

  }),

  menuPortal: (base) => ({

    ...base,

    zIndex: 9999

  }),

  menu: (base) => ({

    ...base,

    marginTop: 6,

    borderRadius: 12,

    overflow: "hidden",

    border: "1px solid #E2E8F0",

    boxShadow: "0 12px 30px rgba(15,23,42,.12)"

  }),

  option: (base, state) => ({

    ...base,

    fontSize: 14,

    cursor: "pointer",

    backgroundColor:

      state.isSelected

        ? "#08204B"

        : state.isFocused

          ? "#EEF4FF"

          : "#FFFFFF",

    color:

      state.isSelected

        ? "#FFFFFF"

        : "#0F172A"

  })

};

const FiltersSection = ({ controller }) => {

  const { filters } = controller;

  return (

    <ModuleFilters>

      {/* ==========================================
          SEARCH
      ========================================== */}

      <div className="filter-group filter-search">

        <label>

          Buscar cliente

        </label>

        <div className="filter-input-wrapper">

          <Search
              size={18}
              className="filter-search-icon"
          />

          <input
            type="text"
            placeholder="Nombre, email o teléfono..."
            value={filters.searchTerm}
            onChange={(event) =>
              filters.setSearchTerm(event.target.value)
            }
          />

        </div>

      </div>

      {/* ==========================================
          TYPE
      ========================================== */}

      <div className="filter-group">

        <label>

          Tipo

        </label>

        <Select

          options={CLIENT_TYPE}

          menuPortalTarget={document.body}

          menuPosition="fixed"

          styles={selectStyles}

          isSearchable={false}

          value={

            CLIENT_TYPE.find(

              option =>

                option.value === filters.selectedType

            )

          }

          onChange={(option) =>

            filters.setSelectedType(

              option?.value || ""

            )

          }

        />

      </div>

      {/* ==========================================
          STATUS
      ========================================== */}

      <div className="filter-group">

        <label>

          Estado

        </label>

        <Select

          options={CLIENT_STATUS}

          menuPortalTarget={document.body}

          menuPosition="fixed"

          styles={selectStyles}

          isSearchable={false}

          value={

            CLIENT_STATUS.find(

              option =>

                option.value === filters.selectedStatus

            )

          }

          onChange={(option) =>

            filters.setSelectedStatus(

              option?.value || ""

            )

          }

        />

      </div>

      {/* ==========================================
          CLEAR
      ========================================== */}

      <div className="filter-group filter-action">

        <label>

          Acción

        </label>

        <button
          className="filter-clear-btn"
          onClick={filters.handleClearFilters}
        >

          <Eraser size={17} />

          Limpiar

        </button>

      </div>

    </ModuleFilters>

  );

};

export default FiltersSection;