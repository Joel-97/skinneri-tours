import React, { useEffect, useState, useMemo } from "react";

import Select from "react-select";

import TransportationModal from "./transportationModal";

import {
  getTransportation,
  createTransportation,
  updateTransportation,
  deleteTransportation,
  confirmTransportationReservation
} from "../../../services/transportation/transportationService";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import {
  createCommission,
  updateCommission,
  deleteCommission,
  getCommissionByBooking
} from "../../../services/settings/general/commissionService";

import Loading from "../../../components/general/loading";
import ViewToggle from "../../../components/general/viewToggle";
import DataTable from "../../../components/general/dataTable";

import ReservationActionsModal from "./ReservationActionsModal";

import "../../../style/transportation/transportationList.css";


/* ======================================================
   COMPONENT
====================================================== */

const TransportationList = ({
  companyId,
  user
}) => {


  /* ====================================================
     STATES
  ==================================================== */

  const [reservations, setReservations] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [viewMode, setViewMode] =
    useState("table");

  const [showFilters, setShowFilters] =
    useState(false);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [mode, setMode] =
    useState("create");

  const [loading, setLoading] =
    useState(true);


  /*
  ======================================================
  RESERVATION ACTIONS MODAL
  ======================================================
  */

  const [actionsModalOpen, setActionsModalOpen] =
    useState(false);

  const [selectedActionReservation, setSelectedActionReservation] =
    useState(null);


  /* ====================================================
     FILTERS
  ==================================================== */

  const [startDateFilter, setStartDateFilter] =
    useState("");

  const [endDateFilter, setEndDateFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");


  /* ====================================================
     LOAD RESERVATIONS
  ==================================================== */

  const loadReservations = async () => {

    if (!companyId) return;

    try {

      setLoading(true);

      const data =
        await getTransportation(
          companyId
        );

      setReservations(data);

    }

    catch (error) {

      console.error(
        "Error cargando reservas:",
        error
      );

      notifyError(
        "Error",
        "No se pudieron cargar las reservas."
      );

    }

    finally {

      setLoading(false);

    }

  };


  /* ====================================================
     INITIAL LOAD
  ==================================================== */

  useEffect(() => {

    if (!companyId) return;

    loadReservations();

  }, [companyId]);


  /* ====================================================
     CREATE
  ==================================================== */

  const handleCreate = () => {

    setSelectedReservation(
      null
    );

    setMode(
      "create"
    );

    setModalOpen(
      true
    );

  };


  /* ====================================================
     EDIT
  ==================================================== */

  const handleEdit = (
    reservation
  ) => {

    setSelectedReservation(
      reservation
    );

    setMode(
      "edit"
    );

    setModalOpen(
      true
    );

  };


  /* ====================================================
     RESERVATION ACTIONS
  ==================================================== */

  const handleActions = (
    reservation
  ) => {

    setSelectedActionReservation(
      reservation
    );

    setActionsModalOpen(
      true
    );

  };


  /* ====================================================
     DELETE
  ==================================================== */

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      await notifyConfirm(
        "¿Eliminar reserva?",
        "Esta acción no se puede deshacer"
      );

    if (!confirmed) return;

    try {

      await deleteTransportation(
        companyId,
        id
      );

      notifySuccess(
        "Reserva eliminada",
        "La reserva fue eliminada correctamente."
      );

      loadReservations();

    }

    catch (error) {

      console.error(
        "Error eliminando reserva:",
        error
      );

      notifyError(
        "Error",
        "No se pudo eliminar la reserva."
      );

    }

  };


  /* ====================================================
     SAVE RESERVATION
  ==================================================== */

  const handleSave = async (
    formData
  ) => {

    try {

      let savedBooking;


      /* ==================================================
         CREATE
      ================================================== */

      if (
        mode === "create"
      ) {

        savedBooking =
          await createTransportation(
            companyId,
            formData,
            user
          );

        notifySuccess(
          "Reserva creada",
          "La reserva fue creada correctamente."
        );

      }


      /* ==================================================
         UPDATE
      ================================================== */

      else {

        await updateTransportation(
          companyId,
          selectedReservation.id,
          formData,
          user
        );

        savedBooking = {

          id:
            selectedReservation.id,

          ...formData

        };

        notifySuccess(
          "Reserva actualizada",
          "Los cambios fueron guardados."
        );

      }


      /* ==================================================
         COMMISSIONS
      ================================================== */

      if (!savedBooking?.id) {

        return false;

      }


      const existingList =
        await getCommissionByBooking(
          companyId,
          savedBooking.id
        );

      const existing =
        existingList?.[0];


      const price =
        Number(
          formData.price || 0
        );

      const discount =
        Number(
          formData.discountAmount || 0
        );


      const base =
        Number(
          (
            price -
            discount
          ).toFixed(2)
        );


      /* ==================================================
         CREATE / UPDATE COMMISSION
      ================================================== */

      if (
        formData.commissionEnabled &&
        formData.commissionBeneficiaryId
      ) {

        const amount =

          formData.commissionType ===
          "percentage"

            ? base *
              (
                formData.commissionValue /
                100
              )

            : formData.commissionValue;


        const commissionData = {

          bookingId:
            savedBooking.id,

          beneficiaryId:
            formData.commissionBeneficiaryId,

          beneficiaryName:
            formData.commissionBeneficiaryName,

          beneficiaryType:
            formData.commissionBeneficiaryType,

          serviceTypeId:
            formData.serviceTypeId,

          serviceTypeName:
            formData.serviceTypeName,

          amount:
            Number(
              amount.toFixed(2)
            ),

          baseAmount:
            Number(base),

          type:
            formData.commissionType,

          value:
            formData.commissionValue,

          bookingDate:
            formData.date

        };


        if (existing) {

          await updateCommission(
            companyId,
            existing.id,
            commissionData,
            user
          );

        }

        else {

          await createCommission(
            companyId,
            commissionData,
            user
          );

        }

      }


      /* ==================================================
         DELETE COMMISSION
      ================================================== */

      else if (
        !formData.commissionEnabled &&
        existing
      ) {

        await deleteCommission(
          companyId,
          existing.id
        );

      }


      /* ==================================================
         CLOSE / REFRESH
      ================================================== */

      /*
      ======================================================
      CREATE

      When creating a new reservation, we keep the
      original behavior and close the modal.
      ======================================================
      */

      if (
        mode === "create"
      ) {

        setModalOpen(
          false
        );

      }


      /*
      ======================================================
      EDIT

      When editing an existing reservation, the modal
      stays open so the user can continue reviewing the
      reservation and, if it is pending, confirm it.
      ======================================================
      */

      else {

        /*
        Update the selected reservation locally so the
        modal/list remain synchronized with the saved data.
        */

        setSelectedReservation(
          prev =>
            prev
              ? {
                  ...prev,
                  ...formData
                }
              : prev
        );

      }


      await loadReservations();

      return true;

    }

    catch (error) {

      console.error(
        "Error guardando reserva:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
        "No se pudo guardar la reserva."
      );

      return false;

    }

  };


  /* ====================================================
     CONFIRM RESERVATION
  ==================================================== */

  const handleConfirm = async (
    reservationData
  ) => {

    if (!companyId) {

      notifyError(
        "Error",
        "No se encontró la empresa."
      );

      return false;

    }


    if (
      !selectedReservation?.id
    ) {

      notifyError(
        "Error",
        "No se encontró la reserva."
      );

      return false;

    }


    if (
      reservationData?.status !== "pending"
    ) {

      notifyError(
        "Error",
        "Solo se pueden confirmar reservas pendientes."
      );

      return false;

    }


    try {

      const response =
        await confirmTransportationReservation(
          companyId,
          selectedReservation.id
        );


      /*
      ======================================================
      VERIFY RESPONSE
      ======================================================
      */

      const confirmedReservation =
        response?.data;


      if (
        confirmedReservation?.status !==
        "confirmed"
      ) {

        notifyError(
          "Error",
          "La reserva no pudo ser confirmada."
        );

        return false;

      }


      /*
      ======================================================
      UPDATE LOCAL RESERVATION
      ======================================================
      */

      setSelectedReservation(
        prev =>
          prev
            ? {
                ...prev,
                status: "confirmed",
                updatedAt: new Date()
              }
            : prev
      );


      /*
      ======================================================
      REFRESH LIST
      ======================================================
      */

      await loadReservations();


      notifySuccess(
        "Reserva confirmada",
        "La reserva fue confirmada correctamente."
      );


      return response;

    }

    catch (error) {

      console.error(
        "Error confirmando reserva:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
        "No se pudo confirmar la reserva."
      );

      return false;

    }

  };


  /* ====================================================
     FORMAT DATE
  ==================================================== */

  const formatDate = (
    timestamp
  ) => {

    if (!timestamp)
      return "-";

    if (timestamp.seconds) {

      return new Date(
        timestamp.seconds * 1000
      ).toLocaleString();

    }

    return new Date(
      timestamp
    ).toLocaleString();

  };


  /* ====================================================
     STATUS CLASS
  ==================================================== */

  const getStatusClass = (
    status
  ) => {

    if (
      status === "confirmed"
    )
      return "status confirmed";

    if (
      status === "pending"
    )
      return "status pending";

    if (
      status === "cancelled"
    )
      return "status cancelled";

    return "status";

  };


  /* ====================================================
     FILTER RESERVATIONS
  ==================================================== */

  const filteredReservations =
    useMemo(() => {

      const term =
        searchTerm
          .toLowerCase()
          .trim();


      return reservations.filter(
        (r) => {

          if (!r.date)
            return true;


          const reservationDate =
            r.date.seconds

              ? new Date(
                  r.date.seconds *
                  1000
                )

              : new Date(
                  r.date
                );


          /* ==============================================
             START DATE
          ============================================== */

          if (
            startDateFilter
          ) {

            const start =
              new Date(
                startDateFilter
              );

            if (
              reservationDate <
              start
            )
              return false;

          }


          /* ==============================================
             END DATE
          ============================================== */

          if (
            endDateFilter
          ) {

            const end =
              new Date(
                endDateFilter
              );

            end.setHours(
              23,
              59,
              59,
              999
            );

            if (
              reservationDate >
              end
            )
              return false;

          }


          /* ==============================================
             STATUS
          ============================================== */

          if (
            statusFilter &&
            r.status !==
              statusFilter
          )
            return false;


          /* ==============================================
             SEARCH
          ============================================== */

          if (term) {

            const name =
              r.clientName
                ?.toLowerCase() ||
              "";

            const service =
              r.serviceTypeName
                ?.toLowerCase() ||
              "";

            const booking =
              r.reservationNumber
                ?.toLowerCase() ||
              "";


            if (

              !name.includes(
                term
              ) &&

              !service.includes(
                term
              ) &&

              !booking.includes(
                term
              )

            ) {

              return false;

            }

          }


          return true;

        }
      );

    }, [

      reservations,

      startDateFilter,

      endDateFilter,

      statusFilter,

      searchTerm

    ]);


  /* ====================================================
     PAGINATION
  ==================================================== */

  const totalPages =
    Math.ceil(
      filteredReservations.length /
      rowsPerPage
    );


  /* ====================================================
     FILTER STATE
  ==================================================== */

  const hasFilters =
    startDateFilter ||
    endDateFilter ||
    statusFilter ||
    searchTerm;


  /* ====================================================
     ROW OPTIONS
  ==================================================== */

  const rowsOptions = [

    {
      value: 10,
      label: "10"
    },

    {
      value: 25,
      label: "25"
    },

    {
      value: 50,
      label: "50"
    },

    {
      value: 100,
      label: "100"
    }

  ];


  /* ====================================================
     STATUS OPTIONS
  ==================================================== */

  const statusOptions = [

    {
      value: "",
      label: "Todos"
    },

    {
      value: "pending",
      label: "Pendiente"
    },

    {
      value: "confirmed",
      label: "Confirmada"
    },

    {
      value: "cancelled",
      label: "Cancelada"
    }

  ];


  /* ====================================================
     RENDER
  ==================================================== */

  return (

    <div className="transportation-container">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="reservation-header">

        <div className="mobile-header">

          <h2>
            Reservas de transporte
          </h2>

          <p className="results">

            {
              filteredReservations.length
            }

            {" "}

            resultados encontrados

          </p>

        </div>


        <div className="header-actions mobile-actions">

          <ViewToggle
            value={viewMode}
            onChange={setViewMode}
          />

          <button
            className="btn-primary"
            onClick={handleCreate}
          >

            + Nueva reserva

          </button>

        </div>

      </div>


      {/* ==================================================
          DESKTOP FILTERS
      ================================================== */}

      <div className="filters-bar">

        <div className="filter-group">

          <label>
            Desde
          </label>

          <input
            type="date"
            value={startDateFilter}
            onChange={(e) =>
              setStartDateFilter(
                e.target.value
              )
            }
          />

        </div>


        <div className="filter-group">

          <label>
            Hasta
          </label>

          <input
            type="date"
            value={endDateFilter}
            onChange={(e) =>
              setEndDateFilter(
                e.target.value
              )
            }
          />

        </div>


        <div className="filter-group">

          <label>
            Estado
          </label>

          <Select

            options={
              statusOptions
            }

            value={
              statusOptions.find(
                opt =>
                  opt.value ===
                  statusFilter
              )
            }

            onChange={
              (selected) =>
                setStatusFilter(
                  selected?.value ||
                  ""
                )
            }

            isSearchable={false}

            menuPortalTarget={
              document.body
            }

            menuPosition="fixed"

          />

        </div>


        <div className="filter-group search">

          <label>
            Buscar
          </label>

          <input

            className="search-input"

            type="text"

            placeholder="Cliente, servicio o # reserva"

            value={searchTerm}

            onChange={(e) => {

              setSearchTerm(
                e.target.value
              );

              setCurrentPage(
                1
              );

            }}

          />

        </div>


        <button

          className="btn-secondary"

          onClick={() => {

            setStartDateFilter(
              ""
            );

            setEndDateFilter(
              ""
            );

            setStatusFilter(
              ""
            );

            setSearchTerm(
              ""
            );

          }}

        >

          Limpiar

        </button>

      </div>


      {/* ==================================================
          MOBILE FILTERS
      ================================================== */}

      <div className="filters-collapsible">

        <button

          className={
            `filters-toggle ${
              hasFilters
                ? "active"
                : ""
            }`
          }

          onClick={() =>
            setShowFilters(
              prev =>
                !prev
            )
          }

        >

          🔍 Filtros{" "}

          {
            hasFilters &&
            "•"
          }

        </button>


        <div

          className={
            `filters-content ${
              showFilters
                ? "open"
                : ""
            }`
          }

        >

          <div className="filter-group">

            <label>
              Desde
            </label>

            <input

              type="date"

              value={
                startDateFilter
              }

              onChange={(e) =>
                setStartDateFilter(
                  e.target.value
                )
              }

            />

          </div>


          <div className="filter-group">

            <label>
              Hasta
            </label>

            <input

              type="date"

              value={
                endDateFilter
              }

              onChange={(e) =>
                setEndDateFilter(
                  e.target.value
                )
              }

            />

          </div>


          <div className="filter-group">

            <label>
              Estado
            </label>

            <Select

              options={
                statusOptions
              }

              value={
                statusOptions.find(
                  opt =>
                    opt.value ===
                    statusFilter
                )
              }

              onChange={
                (selected) => {

                  setStatusFilter(
                    selected?.value ||
                    ""
                  );

                }
              }

              isSearchable={false}

              menuPortalTarget={
                document.body
              }

              menuPosition="fixed"

            />

          </div>


          <div className="filter-group">

            <label>
              Buscar
            </label>

            <input

              type="text"

              placeholder="Cliente, servicio o # reserva"

              value={
                searchTerm
              }

              onChange={(e) => {

                setSearchTerm(
                  e.target.value
                );

                setCurrentPage(
                  1
                );

              }}

            />

          </div>


          <button

            className="btn-secondary full"

            onClick={() => {

              setStartDateFilter(
                ""
              );

              setEndDateFilter(
                ""
              );

              setStatusFilter(
                ""
              );

              setSearchTerm(
                ""
              );

              setShowFilters(
                false
              );

            }}

          >

            Limpiar

          </button>

        </div>

      </div>


      {/* ==================================================
          LOADING
      ================================================== */}

      {
        loading && (

          <div
            style={{
              textAlign:
                "center"
            }}
          >

            <Loading />

          </div>

        )
      }


      {/* ==================================================
          EMPTY
      ================================================== */}

      {
        !loading &&
        filteredReservations.length === 0 && (

          <div className="empty-state">

            <p>
              No hay reservas en este rango.
            </p>

          </div>

        )
      }


      {/* ==================================================
          GRID
      ================================================== */}

      {
        !loading &&
        viewMode === "grid" && (

          <div className="reservations-grid">

            {
              filteredReservations.map(
                r => (

                  <div
                    key={r.id}
                    className="reservation-card"
                  >

                    <div className="reservation-top">

                      <h4
                        onClick={() =>
                          handleEdit(r)
                        }
                      >

                        {r.clientName}

                      </h4>


                      <span

                        className={
                          getStatusClass(
                            r.status
                          )
                        }

                        onClick={() =>
                          handleEdit(r)
                        }

                      >

                        {r.status}

                      </span>

                    </div>


                    <p

                      className="service"

                      onClick={() =>
                        handleEdit(r)
                      }

                    >

                      {
                        r.serviceTypeName
                      }

                    </p>


                    <div

                      className="reservation-info"

                      onClick={() =>
                        handleEdit(r)
                      }

                    >

                      <p>

                        <strong>
                          Fecha:
                        </strong>

                        {" "}

                        {
                          formatDate(
                            r.date
                          )
                        }

                      </p>


                      {
                        r.endDate && (

                          <p>

                            <strong>
                              Fin:
                            </strong>

                            {" "}

                            {
                              formatDate(
                                r.endDate
                              )
                            }

                          </p>

                        )
                      }

                    </div>


                    <div className="reservation-actions">

                      <button

                        className="btn-edit"

                        onClick={() =>
                          handleEdit(r)
                        }

                      >

                        Editar

                      </button>


                      <button

                        className="btn-delete"

                        onClick={() =>
                          handleDelete(
                            r.id
                          )
                        }

                      >

                        Eliminar

                      </button>

                    </div>

                  </div>

                )
              )
            }

          </div>

        )
      }


      {/* ==================================================
          TABLE
      ================================================== */}

      {
        !loading &&
        viewMode === "table" && (

          <div className="reservations-table-wrapper">

            <DataTable

              data={
                filteredReservations
              }

              columns={[

                {
                  key:
                    "reservationNumber",

                  label:
                    "Booking ID",

                  sortable:
                    true

                },

                {
                  key:
                    "clientName",

                  label:
                    "Cliente",

                  sortable:
                    true

                },

                {
                  key:
                    "serviceTypeName",

                  label:
                    "Servicio",

                  sortable:
                    true

                },

                {
                  key:
                    "date",

                  label:
                    "Fecha",

                  sortable:
                    true

                },

                {
                  key:
                    "status",

                  label:
                    "Estado",

                  sortable:
                    true

                },

                {
                  key:
                    "actions",

                  label:
                    "Acciones",

                  sortable:
                    false

                }

              ]}


              renderRow={(r) => (

                <>

                  <td
                    onClick={() =>
                      handleEdit(r)
                    }
                  >

                    {
                      r.reservationNumber
                    }

                  </td>


                  <td
                    onClick={() =>
                      handleEdit(r)
                    }
                  >

                    {
                      r.clientName
                    }

                  </td>


                  <td
                    onClick={() =>
                      handleEdit(r)
                    }
                  >

                    {
                      r.serviceTypeName
                    }

                  </td>


                  <td
                    onClick={() =>
                      handleEdit(r)
                    }
                  >

                    {
                      formatDate(
                        r.date
                      )
                    }

                  </td>


                  <td>

                    <span
                      className={
                        getStatusClass(
                          r.status
                        )
                      }
                    >

                      {
                        r.status
                      }

                    </span>

                  </td>


                  <td className="table-actions">

                    {/* ====================================
                        ACTIONS
                    ==================================== */}

                    <button

                      className="btn-link"

                      onClick={() =>
                        handleActions(r)
                      }

                    >

                      Acciones

                    </button>


                    {/* ====================================
                        EDIT
                    ==================================== */}

                    <button

                      className="btn-link"

                      onClick={() =>
                        handleEdit(r)
                      }

                    >

                      Editar

                    </button>


                    {/* ====================================
                        DELETE
                    ==================================== */}

                    <button

                      className="btn-link"

                      onClick={() =>
                        handleDelete(
                          r.id
                        )
                      }

                    >

                      Eliminar

                    </button>

                  </td>

                </>

              )}


              rowsPerPageOptions={[
                5,
                10,
                20,
                50
              ]}

              defaultRowsPerPage={
                10
              }

            />

          </div>

        )
      }


      {/* ==================================================
          TRANSPORTATION MODAL
      ================================================== */}

      <TransportationModal

        isOpen={
          modalOpen
        }

        onClose={() =>
          setModalOpen(
            false
          )
        }

        onSave={
          handleSave
        }

        onConfirm={
          handleConfirm
        }

        reservation={
          selectedReservation
        }

        mode={
          mode
        }

        companyId={
          companyId
        }

        user={
          user
        }

      />


      {/* ==================================================
          RESERVATION ACTIONS MODAL
      ================================================== */}

      <ReservationActionsModal

        isOpen={
          actionsModalOpen
        }

        onClose={() =>
          setActionsModalOpen(
            false
          )
        }

        companyId={
          companyId
        }

        reservation={
          selectedActionReservation
        }

        user={
          user
        }

      />


    </div>

  );

};


export default TransportationList;