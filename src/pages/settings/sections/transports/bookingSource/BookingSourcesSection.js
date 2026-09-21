import { useCallback, useEffect, useMemo, useState } from "react";

import { Plus } from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  getBookingSources,
  createBookingSource,
  updateBookingSource,
  toggleBookingSourceStatus
} from "../../../../../services/settings/transportation/bookingSourcesService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import BookingSourceForm from "./BookingSourceForm";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Activo"
  },
  {
    value: "inactive",
    label: "Inactivo"
  }
];


const TABLE_COLUMNS = [
  {
    key: "name",
    label: "Nombre",
    sortable: true,
    maxWidth: "250px"
  },
  {
    key: "description",
    label: "Descripción",
    minWidth: "220px",
    maxWidth: "320px",
    className: "table-description"
  },
  {
    key: "isActive",
    label: "Estado",
    width: "140px",
    align: "center"
  },
  {
    key: "actions",
    label: "Acciones",
    width: "220px",
    align: "center"
  }
];


const BookingSourcesSection = () => {
  const { session } = useAuth();

  const user = session?.user;
  const companyId = session?.company?.id;


  const [bookingSources, setBookingSources] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedBookingSource, setSelectedBookingSource] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);


  /* =========================================================
     LOAD
  ========================================================= */

  const fetchBookingSources = useCallback(
    async () => {
      if (!companyId) {
        setBookingSources([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await getBookingSources(
            companyId
          );

        setBookingSources(data);
      } catch (error) {
        console.error(
          "Error loading booking sources:",
          error
        );

        notifyError(
          error?.message ||
          "No fue posible cargar los orígenes de la reserva."
        );
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );


  useEffect(() => {
    fetchBookingSources();
  }, [fetchBookingSources]);


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredBookingSources =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return bookingSources;
      }

      return bookingSources.filter(
        source =>
          source.name
            ?.toLowerCase()
            .includes(term) ||
          source.description
            ?.toLowerCase()
            .includes(term)
      );
    }, [
      bookingSources,
      searchTerm
    ]);


  /* =========================================================
     MODAL
  ========================================================= */

  const openCreateModal = () => {
    setSelectedBookingSource(null);
    setShowModal(true);
  };


  const openEditModal = (
    bookingSource
  ) => {
    setSelectedBookingSource(
      bookingSource
    );

    setShowModal(true);
  };


  const closeModal = () => {
    setSelectedBookingSource(null);
    setShowModal(false);
  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async (
    formData
  ) => {
    if (!companyId) {
      throw new Error(
        "No se encontró la empresa."
      );
    }

    if (!user) {
      throw new Error(
        "No se encontró el usuario autenticado."
      );
    }

    try {
      if (selectedBookingSource?.id) {
        await updateBookingSource(
          companyId,
          selectedBookingSource.id,
          formData,
          user
        );

        notifySuccess(
          "Origen de reserva actualizado",
          "Los cambios fueron guardados correctamente."
        );
      } else {
        await createBookingSource(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Origen de reserva creado",
          "El origen de reserva fue creado correctamente."
        );
      }

      closeModal();
      await fetchBookingSources();
    } catch (error) {
      console.error(
        "Error saving booking source:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible guardar el origen de reserva."
      );

      throw error;
    }
  };


  /* =========================================================
     TOGGLE STATUS
  ========================================================= */

  const handleToggleStatus = async (
    bookingSource
  ) => {
    if (!companyId) {
      notifyError(
        "No se encontró la empresa."
      );
      return;
    }

    const isActive =
      Boolean(
        bookingSource.isActive
      );

    const action =
      isActive
        ? "desactivar"
        : "activar";

    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este origen de reserva?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await toggleBookingSourceStatus(
        companyId,
        bookingSource.id,
        isActive
      );

      notifySuccess(
        "Estado actualizado",
        `El origen de la reserva fue ${
          isActive
            ? "desactivado"
            : "activado"
        } correctamente.`
      );

      await fetchBookingSources();
    } catch (error) {
      console.error(
        "Error updating booking source status:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible actualizar el estado."
      );
    }
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="catalog-container">

      <CatalogHeader
        title="Origen de reserva"
        description="Administra los diferentes orígenes desde donde llegan las reservas."
      >
        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar origen..."
          />

          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Agregar origen
          </button>

        </CatalogToolbar>
      </CatalogHeader>


      <div className="catalog-content">

        {loading ? null : (
          filteredBookingSources.length === 0 ? (
            <CatalogEmpty
              message="Todavía no hay orígenes de reserva registrados."
            />
          ) : (
            <DataTable
              columns={TABLE_COLUMNS}
              data={filteredBookingSources}
              renderRow={
                bookingSource => (
                  <>
                    <td>
                      <strong>
                        {bookingSource.name || "—"}
                      </strong>
                    </td>

                    <td>
                      <span className="catalog-description">
                        {
                          bookingSource.description ||
                          "—"
                        }
                      </span>
                    </td>

                    <td
                      style={{
                        textAlign: "center"
                      }}
                    >
                      <CatalogStatusBadge
                        value={
                          bookingSource.isActive
                            ? "active"
                            : "inactive"
                        }
                        options={
                          STATUS_OPTIONS
                        }
                      />
                    </td>

                    <td
                      style={{
                        textAlign: "center"
                      }}
                    >
                      <CatalogActions>

                        <button
                          type="button"
                          className="catalog-action"
                          onClick={() =>
                            openEditModal(
                              bookingSource
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="catalog-action"
                          onClick={() =>
                            handleToggleStatus(
                              bookingSource
                            )
                          }
                        >
                          {
                            bookingSource.isActive
                              ? "Desactivar"
                              : "Activar"
                          }
                        </button>

                      </CatalogActions>
                    </td>
                  </>
                )
              }
            />
          )
        )}

      </div>


      {showModal && (
        <BookingSourceForm
          bookingSource={
            selectedBookingSource
          }
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

    </div>
  );
};


export default BookingSourcesSection;