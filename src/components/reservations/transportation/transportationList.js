import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import Select from "react-select";

import TransportationModal from "./transportationModal";
import ReservationActionsModal from "./ReservationActionsModal";

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

import "../../../style/transportation/transportationList.css";


const TransportationList = ({
  companyId,
  user
}) => {

  /* =========================================================
     STATE
  ========================================================= */

  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [selectedActionReservation, setSelectedActionReservation] =
    useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);

  const [mode, setMode] = useState("create");
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");


  /* =========================================================
     LOAD RESERVATIONS
  ========================================================= */

  const loadReservations = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const data =
        await getTransportation(companyId);

      setReservations(data);
    } catch (error) {
      console.error(
        "Error cargando reservas:",
        error
      );

      notifyError(
        "Error",
        "No se pudieron cargar las reservas."
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);


  useEffect(() => {
    loadReservations();
  }, [loadReservations]);


  /* =========================================================
     MODALS
  ========================================================= */

  const handleCreate = () => {
    setSelectedReservation(null);
    setMode("create");
    setModalOpen(true);
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setMode("edit");
    setModalOpen(true);
  };

  const handleActions = (reservation) => {
    setSelectedActionReservation(reservation);
    setActionsModalOpen(true);
  };


  /* =========================================================
     FILTERS
  ========================================================= */

  const clearFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setStatusFilter("");
    setSearchTerm("");
    setShowFilters(false);
  };

  const hasFilters =
    Boolean(
      startDateFilter ||
      endDateFilter ||
      statusFilter ||
      searchTerm
    );


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (id) => {
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

      await loadReservations();
    } catch (error) {
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


  /* =========================================================
     SAVE RESERVATION
  ========================================================= */

  const handleSave = async (formData) => {
    try {
      let savedBooking;

      if (mode === "create") {
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
      } else {
        await updateTransportation(
          companyId,
          selectedReservation.id,
          formData,
          user
        );

        savedBooking = {
          id: selectedReservation.id,
          ...formData
        };

        notifySuccess(
          "Reserva actualizada",
          "Los cambios fueron guardados."
        );
      }

      if (!savedBooking?.id) {
        return false;
      }


      /* -----------------------------------------------------
         COMMISSION
      ----------------------------------------------------- */

      const existingList =
        await getCommissionByBooking(
          companyId,
          savedBooking.id
        );

      const existing =
        existingList?.[0];

      const price =
        Number(formData.price || 0);

      const discount =
        Number(formData.discountAmount || 0);

      const base =
        Number(
          (
            price - discount
          ).toFixed(2)
        );


      if (
        formData.commissionEnabled &&
        formData.commissionBeneficiaryId
      ) {
        const amount =
          formData.commissionType === "percentage"
            ? base *
              (
                Number(
                  formData.commissionValue || 0
                ) / 100
              )
            : Number(
                formData.commissionValue || 0
              );

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
            base,

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
        } else {
          await createCommission(
            companyId,
            commissionData,
            user
          );
        }
      } else if (existing) {
        await deleteCommission(
          companyId,
          existing.id
        );
      }


      /* -----------------------------------------------------
         UPDATE UI
      ----------------------------------------------------- */

      if (mode === "create") {
        setModalOpen(false);
      } else {
        setSelectedReservation((prev) =>
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
    } catch (error) {
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


  /* =========================================================
     CONFIRM RESERVATION
  ========================================================= */

  const handleConfirm = async (reservationData) => {
    if (!companyId) {
      notifyError(
        "Error",
        "No se encontró la empresa."
      );

      return false;
    }

    if (!selectedReservation?.id) {
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

      setSelectedReservation((prev) =>
        prev
          ? {
              ...prev,
              status: "confirmed",
              updatedAt: new Date()
            }
          : prev
      );

      await loadReservations();

      notifySuccess(
        "Reserva confirmada",
        "La reserva fue confirmada correctamente."
      );

      return response;
    } catch (error) {
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


  /* =========================================================
     HELPERS
  ========================================================= */

  const getDateValue = (value) => {
    if (!value) return null;

    if (
      typeof value?.seconds === "number"
    ) {
      return new Date(
        value.seconds * 1000
      );
    }

    if (
      typeof value?.toDate === "function"
    ) {
      return value.toDate();
    }

    return new Date(value);
  };

  const formatDate = (value) => {
    const date =
      getDateValue(value);

    if (
      !date ||
      Number.isNaN(date.getTime())
    ) {
      return "-";
    }

    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    const classes = {
      confirmed: "status confirmed",
      pending: "status pending",
      cancelled: "status cancelled"
    };

    return (
      classes[status] ||
      "status"
    );
  };


  /* =========================================================
     FILTERED RESERVATIONS
  ========================================================= */

  const filteredReservations =
    useMemo(() => {

      const term =
        searchTerm
          .toLowerCase()
          .trim();

      const startDate =
        startDateFilter
          ? new Date(startDateFilter)
          : null;

      const endDate =
        endDateFilter
          ? new Date(endDateFilter)
          : null;

      if (endDate) {
        endDate.setHours(
          23,
          59,
          59,
          999
        );
      }

      return reservations.filter(
        (reservation) => {

          const reservationDate =
            getDateValue(
              reservation.date
            );

          if (
            reservationDate &&
            startDate &&
            reservationDate < startDate
          ) {
            return false;
          }

          if (
            reservationDate &&
            endDate &&
            reservationDate > endDate
          ) {
            return false;
          }

          if (
            statusFilter &&
            reservation.status !==
              statusFilter
          ) {
            return false;
          }

          if (term) {
            const searchableText = [
              reservation.clientName,
              reservation.serviceTypeName,
              reservation.reservationNumber
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchableText.includes(term)
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


  /* =========================================================
     OPTIONS
  ========================================================= */

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


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="transportation-container">

      {/* HEADER */}

      <div className="reservation-header">

        <div className="mobile-header">
          <h2>
            Reservas de transporte
          </h2>

          <p className="results">
            {filteredReservations.length}{" "}
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


      {/* DESKTOP FILTERS */}

      <div className="filters-bar">

        <div className="filter-group">
          <label>Desde</label>

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
          <label>Hasta</label>

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
          <label>Estado</label>

          <Select
            options={statusOptions}
            value={
              statusOptions.find(
                (option) =>
                  option.value ===
                  statusFilter
              )
            }
            onChange={(selected) =>
              setStatusFilter(
                selected?.value || ""
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
          <label>Buscar</label>

          <input
            className="search-input"
            type="text"
            placeholder="Cliente, servicio o # reserva"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>


        <button
          className="btn-secondary"
          onClick={clearFilters}
        >
          Limpiar
        </button>

      </div>


      {/* MOBILE FILTERS */}

      <div className="filters-collapsible">

        <button
          className={`filters-toggle ${
            hasFilters ? "active" : ""
          }`}
          onClick={() =>
            setShowFilters(
              (prev) => !prev
            )
          }
        >
          🔍 Filtros{" "}
          {hasFilters && "•"}
        </button>


        <div
          className={`filters-content ${
            showFilters ? "open" : ""
          }`}
        >

          <div className="filter-group">
            <label>Desde</label>

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
            <label>Hasta</label>

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
            <label>Estado</label>

            <Select
              options={statusOptions}
              value={
                statusOptions.find(
                  (option) =>
                    option.value ===
                    statusFilter
                )
              }
              onChange={(selected) =>
                setStatusFilter(
                  selected?.value || ""
                )
              }
              isSearchable={false}
              menuPortalTarget={
                document.body
              }
              menuPosition="fixed"
            />
          </div>


          <div className="filter-group">
            <label>Buscar</label>

            <input
              type="text"
              placeholder="Cliente, servicio o # reserva"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />
          </div>


          <button
            className="btn-secondary full"
            onClick={clearFilters}
          >
            Limpiar
          </button>

        </div>

      </div>


      {/* LOADING */}

      {loading && (
        <div
          style={{
            textAlign: "center"
          }}
        >
          <Loading />
        </div>
      )}


      {/* EMPTY */}

      {!loading &&
        filteredReservations.length === 0 && (
          <div className="empty-state">
            <p>
              No hay reservas en este rango.
            </p>
          </div>
        )}


      {/* GRID */}

      {!loading &&
        viewMode === "grid" && (
          <div className="reservations-grid">

            {filteredReservations.map(
              (reservation) => (
                <div
                  key={reservation.id}
                  className="reservation-card"
                >

                  <div className="reservation-top">

                    <h4
                      onClick={() =>
                        handleEdit(
                          reservation
                        )
                      }
                    >
                      {reservation.clientName}
                    </h4>

                    <span
                      className={getStatusClass(
                        reservation.status
                      )}
                      onClick={() =>
                        handleEdit(
                          reservation
                        )
                      }
                    >
                      {reservation.status}
                    </span>

                  </div>


                  <p
                    className="service"
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >
                    {reservation.serviceTypeName}
                  </p>


                  <div
                    className="reservation-info"
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >

                    <p>
                      <strong>
                        Fecha:
                      </strong>{" "}
                      {formatDate(
                        reservation.date
                      )}
                    </p>

                    {reservation.endDate && (
                      <p>
                        <strong>
                          Fin:
                        </strong>{" "}
                        {formatDate(
                          reservation.endDate
                        )}
                      </p>
                    )}

                  </div>


                  <div className="reservation-actions">

                    <button
                      className="btn-edit"
                      onClick={() =>
                        handleEdit(
                          reservation
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(
                          reservation.id
                        )
                      }
                    >
                      Eliminar
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}


      {/* TABLE */}

      {!loading &&
        viewMode === "table" && (
          <div className="reservations-table-wrapper">

            <DataTable
              data={filteredReservations}

              columns={[
                {
                  key: "reservationNumber",
                  label: "Booking ID",
                  sortable: true
                },
                {
                  key: "clientName",
                  label: "Cliente",
                  sortable: true
                },
                {
                  key: "serviceTypeName",
                  label: "Servicio",
                  sortable: true
                },
                {
                  key: "date",
                  label: "Fecha",
                  sortable: true
                },
                {
                  key: "status",
                  label: "Estado",
                  sortable: true
                },
                {
                  key: "actions",
                  label: "Acciones",
                  sortable: false
                }
              ]}

              renderRow={(reservation) => (
                <>
                  <td
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >
                    {reservation.reservationNumber}
                  </td>

                  <td
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >
                    {reservation.clientName}
                  </td>

                  <td
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >
                    {reservation.serviceTypeName}
                  </td>

                  <td
                    onClick={() =>
                      handleEdit(
                        reservation
                      )
                    }
                  >
                    {formatDate(
                      reservation.date
                    )}
                  </td>

                  <td>
                    <span
                      className={getStatusClass(
                        reservation.status
                      )}
                    >
                      {reservation.status}
                    </span>
                  </td>

                  <td className="table-actions">

                    <button
                      className="btn-link"
                      onClick={() =>
                        handleActions(
                          reservation
                        )
                      }
                    >
                      Acciones
                    </button>

                    <button
                      className="btn-link"
                      onClick={() =>
                        handleEdit(
                          reservation
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="btn-link"
                      onClick={() =>
                        handleDelete(
                          reservation.id
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

              defaultRowsPerPage={10}
            />

          </div>
        )}


      {/* TRANSPORTATION MODAL */}

      <TransportationModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSave={handleSave}
        onConfirm={handleConfirm}
        reservation={selectedReservation}
        mode={mode}
        companyId={companyId}
        user={user}
      />


      {/* ACTIONS MODAL */}

      <ReservationActionsModal
        isOpen={actionsModalOpen}
        onClose={() =>
          setActionsModalOpen(false)
        }
        companyId={companyId}
        reservation={
          selectedActionReservation
        }
        user={user}
      />

    </div>
  );
};


export default TransportationList;