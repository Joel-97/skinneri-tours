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

    if (!column.sortable) return;

    setSortConfig(prev => {

      const direction =

        prev.key === column.key &&

        prev.direction === "asc"

          ? "desc"

          : "asc";

      const config = {

        key: column.key,

        direction

      };

      onSortChange?.(config);

      return config;

    });

  };

  /* ======================================================
     SORTED DATA
  ====================================================== */

  const sortedData = useMemo(() => {

    if (!sortConfig.key) {

      return [...data];

    }

    const result = [...data];

    result.sort((a, b) => {

      let aValue = a[sortConfig.key];

      let bValue = b[sortConfig.key];

      if (aValue?.toDate) {

        aValue = aValue.toDate();

      }

      if (bValue?.toDate) {

        bValue = bValue.toDate();

      }

      if (typeof aValue === "boolean") {

        aValue = Number(aValue);

        bValue = Number(bValue);

      }

      if (typeof aValue === "string") {

        aValue = aValue.toLowerCase();

        bValue = bValue.toLowerCase();

      }

      if (aValue == null) return 1;

      if (bValue == null) return -1;

      if (aValue < bValue) {

        return sortConfig.direction === "asc"

          ? -1

          : 1;

      }

      if (aValue > bValue) {

        return sortConfig.direction === "asc"

          ? 1

          : -1;

      }

      return 0;

    });

    return result;

  }, [

    data,

    sortConfig

  ]);

  /* ======================================================
     PAGINATION
  ====================================================== */

  const totalPages = Math.max(

    1,

    Math.ceil(

      sortedData.length /

      rowsPerPage

    )

  );

  const currentData = useMemo(() => {

    const start =

      (currentPage - 1) *

      rowsPerPage;

    return sortedData.slice(

      start,

      start + rowsPerPage

    );

  }, [

    sortedData,

    currentPage,

    rowsPerPage

  ]);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    setCurrentPage(1);

  }, [

    data,

    rowsPerPage

  ]);

  useEffect(() => {

    onPageChange?.(

      currentPage

    );

  }, [

    currentPage,

    onPageChange

  ]);

  useEffect(() => {

    onRowsPerPageChange?.(

      rowsPerPage

    );

  }, [

    rowsPerPage,

    onRowsPerPageChange

  ]);

  /* ======================================================
     ROW OPTIONS
  ====================================================== */

  const rowsOptions = useMemo(() => {

    return rowsPerPageOptions.map(

      value => ({

        value,

        label: value

      })

    );

  }, [

    rowsPerPageOptions

  ]);

  /* ======================================================
     SELECT STYLES
  ====================================================== */

  const defaultSelectStyles = {

    control: (

      base,

      state

    ) => ({

      ...base,

      minHeight:36,

      borderRadius:8,

      borderColor:

        state.isFocused

          ? "#08204B"

          : "#CBD5E1",

      boxShadow:"none",

      cursor:"pointer",

      "&:hover":{

        borderColor:"#08204B"

      }

    }),

    valueContainer:(base)=>({

      ...base,

      padding:"0 8px"

    }),

    menuPortal:(base)=>({

      ...base,

      zIndex:9999

    }),

    menu:(base)=>({

      ...base,

      borderRadius:10,

      overflow:"hidden"

    }),

    option:(

      base,

      state

    )=>({

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
                  width: "70px"
                }}
              />

              {

                columns.map(column => (

                  <col

                    key={column.key}

                    style={{

                      width: column.width,

                      minWidth: column.minWidth,

                      maxWidth: column.maxWidth

                    }}

                  />

                ))

              }

            </colgroup>

            {/* ==================================================
                HEADER
            ================================================== */}

            <thead>

              <tr>

                <th className="table-index">

                  #

                </th>

                {

                  columns.map(column => (

                    <th

                      key={column.key}

                      onClick={() => handleSort(column)}

                      className={[

                        column.className,

                        column.sortable
                          ? "table-sortable"
                          : "",

                        `table-${column.align || "left"}`

                      ]

                        .filter(Boolean)

                        .join(" ")}

                    >

                      {column.label}

                      {

                        column.sortable &&

                        sortConfig.key === column.key && (

                          <span className="table-sort-indicator">

                            {

                              sortConfig.direction === "asc"

                                ? "▲"

                                : "▼"

                            }

                          </span>

                        )

                      }

                    </th>

                  ))

                }

              </tr>

            </thead>

            {/* ==================================================
                BODY
            ================================================== */}

            <tbody>

              {

                currentData.length > 0

                  ? currentData.map((row, index) => (

                      <tr

                        key={row.id || index}

                        onClick={() => {

                          if (selectableRows) {

                            onRowClick?.(row);

                          }

                        }}

                        className={[

                          selectableRows
                            ? "table-row-selectable"
                            : "",

                          selectedRow === row.id
                            ? "table-row-selected"
                            : ""

                        ]

                          .filter(Boolean)

                          .join(" ")

                        }

                      >

                        {/* ============================
                            INDEX
                        ============================ */}

                        <td className="table-index">

                          {

                            (currentPage - 1)

                            *

                            rowsPerPage

                            +

                            index

                            +

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

                    ))

                  : (

                  <tr>

                    <td
                      colSpan={columns.length + 1}
                      className="table-empty"
                    >

                      <EmptyState

                        title={emptyTitle}

                        description={emptyDescription}

                        action={emptyAction}

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

          {/* ================================
              ROWS
          ================================= */}

          <div className="rows-selector">

            <span>

              Mostrar

            </span>

            <Select

              classNamePrefix="react-select"

              options={rowsOptions}

              value={

                rowsOptions.find(

                  option=>

                    option.value===rowsPerPage

                )

              }

              onChange={(selected)=>{

                setRowsPerPage(

                  selected.value

                );

              }}

              isSearchable={false}

              styles={selectStyles}

              menuPortalTarget={document.body}

              menuPosition="fixed"

            />

            <span>

              registros

            </span>

          </div>

          {/* ================================
              PAGINATION
          ================================= */}

          <div className="page-controls">

            <button

              disabled={

                currentPage===1

              }

              onClick={()=>

                setCurrentPage(

                  prev=>prev-1

                )

              }

            >

              ◀

            </button>

            <span>

              Página

              {" "}

              {currentPage}

              {" "}

              de

              {" "}

              {totalPages}

            </span>

            <button

              disabled={

                currentPage===totalPages

              }

              onClick={()=>

                setCurrentPage(

                  prev=>prev+1

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