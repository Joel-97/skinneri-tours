import React from "react";

import Select from "react-select";

const DashboardDateFilter = ({

  value,

  onChange

}) => {

  // ====================================================
  // OPTIONS
  // ====================================================

    const options = [

    {
        value: "today",
        label: "Hoy"
    },

    {
        value: "week",
        label: "Esta semana"
    },

    {
        value: "month",
        label: "Este mes"
    },

    {
        value: "quarter",
        label: "Trimestre"
    },

    {
        value: "year",
        label: "Año actual"
    }

    ];

  // ====================================================
  // CUSTOM STYLES
  // ====================================================

  const customSelectStyles = {

    control: (provided, state) => ({

      ...provided,

      minHeight: "44px",

      borderRadius: "12px",

      border: state.isFocused
        ? "1px solid #2563eb"
        : "1px solid #dbe3ee",

      boxShadow: state.isFocused
        ? "0 0 0 3px rgba(37, 99, 235, 0.08)"
        : "none",

      cursor: "pointer",

      transition:
        "all 0.2s ease",

      "&:hover": {

        borderColor: "#2563eb"

      }

    }),

    valueContainer: (
      provided
    ) => ({

      ...provided,

      padding: "0 14px"

    }),

    placeholder: (
      provided
    ) => ({

      ...provided,

      color: "#64748b",

      fontSize: "14px",

      fontWeight: 500

    }),

    singleValue: (
      provided
    ) => ({

      ...provided,

      color: "#0f172a",

      fontSize: "14px",

      fontWeight: 500

    }),

    menu: (provided) => ({

      ...provided,

      borderRadius: "14px",

      overflow: "hidden",

      border:
        "1px solid #eef2f7",

      boxShadow:
        "0 10px 25px rgba(15, 23, 42, 0.08)",

      zIndex: 20

    }),

    option: (
      provided,
      state
    ) => ({

      ...provided,

      fontSize: "14px",

      backgroundColor:
        state.isSelected
          ? "#0A1E5E"
          : state.isFocused
          ? "#f8fafc"
          : "#ffffff",

      color:
        state.isSelected
          ? "#ffffff"
          : "#0f172a",

      cursor: "pointer"

    }),

    indicatorSeparator: () => ({
      display: "none"
    })

  };

  return (

    <div className="dashboard-date-filter-wrapper">

      <Select

        options={options}

        value={
          options.find(
            (option) =>
              option.value === value
          )
        }

        onChange={(selected) =>
          onChange(
            selected.value
          )
        }

        styles={
          customSelectStyles
        }

        isSearchable={false}

      />

    </div>

  );

};

export default DashboardDateFilter;