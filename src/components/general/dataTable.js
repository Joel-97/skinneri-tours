import {
  useMemo,
  useState,
  useEffect
} from "react";

import Select from "react-select";

import EmptyState from "../general/EmptyState";

import "../../style/general/dataTable.css";


/* ======================================================
   COMPONENT
====================================================== */

const DataTable = ({

  /* ==========================================
     DATA
  ========================================== */

  data = [],

  columns = [],

  renderRow,


  /* ==========================================
     SELECTION
  ========================================== */

  selectableRows = false,

  selectedRow = null,

  onRowClick = null,


  /* ==========================================
     EMPTY STATE
  ========================================== */

  emptyTitle = "No hay datos para mostrar.",

  emptyDescription = "",

  emptyAction = null,


  /* ==========================================
     LOADING
  ========================================== */

  loading = false,


  /* ==========================================
     PAGINATION
  ========================================== */

  rowsPerPageOptions = [

    5,

    10,

    20,

    50

  ],

  defaultRowsPerPage = 10,


  /* ==========================================
     EVENTS
  ========================================== */

  onSortChange,

  onPageChange,

  onRowsPerPageChange,


  /* ==========================================
     STYLES
  ========================================== */

  customSelectStyles

}) => {


  /* ======================================================
     STATE
  ====================================================== */

  const [

    currentPage,

    setCurrentPage

  ] = useState(1);


  const [

    rowsPerPage,

    setRowsPerPage

  ] = useState(defaultRowsPerPage);


  const [

    sortConfig,

    setSortConfig

  ] = useState({

    key: null,

    direction: "asc"

  });


  /* ======================================================
     SORT
  ====================================================== */

  const handleSort = (column) => {

    if (!column.sortable) {

      return;

    }


    setSortConfig(

      previous => {

        const direction =

          previous.key === column.key &&

          previous.direction === "asc"

            ? "desc"

            : "asc";


        const config = {

          key: column.key,

          direction

        };


        onSortChange?.(
          config
        );


        return config;

      }

    );

  };


  /* ======================================================
     SORTED DATA
  ====================================================== */

  const sortedData = useMemo(

    () => {

      if (!sortConfig.key) {

        return [
          ...data
        ];

      }


      const result = [
        ...data
      ];


      result.sort(

        (a, b) => {

          let aValue =
            a?.[
              sortConfig.key
            ];


          let bValue =
            b?.[
              sortConfig.key
            ];


          /* =================================================
             NORMALIZE FIRESTORE / DATE VALUES
          ================================================= */

          if (

            aValue &&

            typeof aValue.toDate ===
              "function"

          ) {

            aValue =
              aValue.toDate();

          }


          if (

            bValue &&

            typeof bValue.toDate ===
              "function"

          ) {

            bValue =
              bValue.toDate();

          }


          /* =================================================
             EMPTY VALUES

             Empty values are always placed at the end,
             independently of the selected direction.
          ================================================= */

          const aIsEmpty =

            aValue === null ||

            aValue === undefined ||

            (

              typeof aValue ===
                "string" &&

              aValue.trim() === ""

            );


          const bIsEmpty =

            bValue === null ||

            bValue === undefined ||

            (

              typeof bValue ===
                "string" &&

              bValue.trim() === ""

            );


          if (

            aIsEmpty &&

            bIsEmpty

          ) {

            return 0;

          }


          if (aIsEmpty) {

            return 1;

          }


          if (bIsEmpty) {

            return -1;

          }


          /* =================================================
             BOOLEAN
          ================================================= */

          if (

            typeof aValue ===
              "boolean" &&

            typeof bValue ===
              "boolean"

          ) {

            aValue =
              Number(
                aValue
              );


            bValue =
              Number(
                bValue
              );

          }


          /* =================================================
             DATE
          ================================================= */

          if (

            aValue instanceof Date &&

            bValue instanceof Date

          ) {

            const timeA =
              aValue.getTime();


            const timeB =
              bValue.getTime();


            if (timeA < timeB) {

              return (

                sortConfig.direction ===
                "asc"

              )

                ? -1

                : 1;

            }


            if (timeA > timeB) {

              return (

                sortConfig.direction ===
                "asc"

              )

                ? 1

                : -1;

            }


            return 0;

          }


          /* =================================================
             NUMBERS

             Important for:

             - passengers
             - total
             - amounts
             - quantities

             Only use numeric comparison when both values
             are actually numbers.
          ================================================= */

          if (

            typeof aValue ===
              "number" &&

            typeof bValue ===
              "number"

          ) {

            if (aValue < bValue) {

              return (

                sortConfig.direction ===
                "asc"

              )

                ? -1

                : 1;

            }


            if (aValue > bValue) {

              return (

                sortConfig.direction ===
                "asc"

              )

                ? 1

                : -1;

            }


            return 0;

          }


          /* =================================================
             STRING / MIXED VALUES

             Convert both remaining values to strings before
             using string comparison.

             This prevents errors such as:

             bValue.toLowerCase is not a function

             when one value is undefined, null, a number,
             boolean, or another non-string type.
          ================================================= */

          const stringA =

            String(
              aValue
            )
              .trim()
              .toLowerCase();


          const stringB =

            String(
              bValue
            )
              .trim()
              .toLowerCase();


          return (

            stringA.localeCompare(

              stringB,

              undefined,

              {

                sensitivity:
                  "base",

                numeric:
                  true

              }

            )

          ) *

          (

            sortConfig.direction ===
            "asc"

              ? 1

              : -1

          );

        }

      );


      return result;

    },

    [

      data,

      sortConfig

    ]

  );


  /* ======================================================
     PAGINATION
  ====================================================== */

  const totalPages =

    Math.max(

      1,

      Math.ceil(

        sortedData.length /

        rowsPerPage

      )

    );


  const currentData = useMemo(

    () => {

      const start =

        (

          currentPage - 1

        ) *

        rowsPerPage;


      return sortedData.slice(

        start,

        start +
        rowsPerPage

      );

    },

    [

      sortedData,

      currentPage,

      rowsPerPage

    ]

  );


  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(

    () => {

      setCurrentPage(
        1
      );

    },

    [

      data,

      rowsPerPage

    ]

  );


  useEffect(

    () => {

      onPageChange?.(

        currentPage

      );

    },

    [

      currentPage,

      onPageChange

    ]

  );


  useEffect(

    () => {

      onRowsPerPageChange?.(

        rowsPerPage

      );

    },

    [

      rowsPerPage,

      onRowsPerPageChange

    ]

  );


  /* ======================================================
     ROW OPTIONS
  ====================================================== */

  const rowsOptions = useMemo(

    () => {

      return rowsPerPageOptions.map(

        value => ({

          value,

          label:
            value

        })

      );

    },

    [

      rowsPerPageOptions

    ]

  );


  /* ======================================================
     SELECT STYLES
  ====================================================== */

  const defaultSelectStyles = {

    control: (

      base,

      state

    ) => ({

      ...base,

      minHeight:
        36,

      borderRadius:
        8,

      borderColor:

        state.isFocused

          ? "#08204B"

          : "#CBD5E1",

      boxShadow:
        "none",

      cursor:
        "pointer",

      "&:hover": {

        borderColor:
          "#08204B"

      }

    }),


    valueContainer:
      (base) => ({

        ...base,

        padding:
          "0 8px"

      }),


    menuPortal:
      (base) => ({

        ...base,

        zIndex:
          9999

      }),


    menu:
      (base) => ({

        ...base,

        borderRadius:
          10,

        overflow:
          "hidden"

      }),


    option: (

      base,

      state

    ) => ({

      ...base,

      backgroundColor:

        state.isSelected

          ? "#08204B"

          : state.isFocused

            ? "#EEF2FF"

            : "#FFFFFF",

      color:

        state.isSelected

          ? "#FFFFFF"

          : "#111827"

    })

  };


  const selectStyles =

    customSelectStyles ||

    defaultSelectStyles;


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="table-container">


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="table-wrapper">

        <table className="table">


          {/* ==================================================
              COLUMN WIDTHS
          ================================================== */}

          <colgroup>

            <col

              style={{

                width:
                  "70px"

              }}

            />


            {

              columns.map(

                column => (

                  <col

                    key={
                      column.key
                    }

                    style={{

                      width:
                        column.width,

                      minWidth:
                        column.minWidth,

                      maxWidth:
                        column.maxWidth

                    }}

                  />

                )

              )

            }

          </colgroup>


          {/* ==================================================
              HEADER
          ================================================== */}

          <thead>

            <tr>


              <th
                className="table-index"
              >

                #

              </th>


              {

                columns.map(

                  column => (

                    <th

                      key={
                        column.key
                      }

                      onClick={() =>
                        handleSort(
                          column
                        )
                      }

                      className={[

                        column.className,

                        column.sortable
                          ? "table-sortable"
                          : "",

                        `table-${
                          column.align ||
                          "left"
                        }`

                      ]

                        .filter(
                          Boolean
                        )

                        .join(" ")}

                    >

                      {
                        column.label
                      }


                      {

                        column.sortable &&

                        sortConfig.key ===
                          column.key && (

                          <span className="table-sort-indicator">

                            {

                              sortConfig.direction ===
                              "asc"

                                ? "▲"

                                : "▼"

                            }

                          </span>

                        )

                      }

                    </th>

                  )

                )

              }

            </tr>

          </thead>


          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>

            {

              currentData.length > 0

                ? currentData.map(

                    (row, index) => (

                      <tr

                        key={
                          row.id ||
                          index
                        }

                        onClick={() => {

                          if (
                            selectableRows
                          ) {

                            onRowClick?.(
                              row
                            );

                          }

                        }}

                        className={[

                          selectableRows
                            ? "table-row-selectable"
                            : "",

                          selectedRow ===
                            row.id
                            ? "table-row-selected"
                            : ""

                        ]

                          .filter(
                            Boolean
                          )

                          .join(" ")}

                      >


                        {/* ============================
                            INDEX
                        ============================ */}

                        <td
                          className="table-index"
                        >

                          {

                            (

                              currentPage -
                              1

                            ) *

                            rowsPerPage +

                            index +

                            1

                          }

                        </td>


                        {/* ============================
                            CELLS
                        ============================ */}

                        {

                          renderRow(

                            row,

                            {

                              columns,

                              currentPage,

                              rowsPerPage,

                              index

                            }

                          )

                        }

                      </tr>

                    )

                  )

                : (

                  <tr>

                    <td

                      colSpan={
                        columns.length +
                        1
                      }

                      className="table-empty"

                    >

                      <EmptyState

                        title={
                          emptyTitle
                        }

                        description={
                          emptyDescription
                        }

                        action={
                          emptyAction
                        }

                      />

                    </td>

                  </tr>

                )

            }

          </tbody>

        </table>

      </div>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="table-pagination">


        {/* ================================================
            ROWS
        ================================================= */}

        <div className="rows-selector">

          <span>

            Mostrar

          </span>


          <Select

            classNamePrefix="react-select"

            options={
              rowsOptions
            }

            value={

              rowsOptions.find(

                option =>

                  option.value ===
                  rowsPerPage

              )

            }

            onChange={

              (selected) => {

                setRowsPerPage(

                  selected.value

                );

              }

            }

            isSearchable={
              false
            }

            styles={
              selectStyles
            }

            menuPortalTarget={
              document.body
            }

            menuPosition="fixed"

          />


          <span>

            registros

          </span>

        </div>


        {/* ================================================
            PAGINATION
        ================================================= */}

        <div className="page-controls">

          <button

            disabled={

              currentPage ===
              1

            }

            onClick={() =>

              setCurrentPage(

                previous =>
                  previous - 1

              )

            }

          >

            ◀

          </button>


          <span>

            Página

            {" "}

            {
              currentPage
            }

            {" "}

            de

            {" "}

            {
              totalPages
            }

          </span>


          <button

            disabled={

              currentPage ===
              totalPages

            }

            onClick={() =>

              setCurrentPage(

                previous =>
                  previous + 1

              )

            }

          >

            ▶

          </button>

        </div>

      </div>

    </div>

  );

};


export default DataTable;