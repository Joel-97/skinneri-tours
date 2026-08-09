import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus
} from "lucide-react";

import {
  useAuth
} from "../../../../../context/AuthContext";

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

/* ======================================================
   COMPONENT
====================================================== */

const BookingSourcesSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { session } = useAuth();

  const user = session?.user;

  const company = session?.company;

  /* ======================================================
     STATE
  ====================================================== */

  const [bookingSources, setBookingSources] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedBookingSource, setSelectedBookingSource] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ======================================================
     FETCH
  ====================================================== */

  const fetchBookingSources = useCallback(async () => {

    if (!company?.id) return;

    try {

      setLoading(true);

      const data = await getBookingSources(company.id);

      setBookingSources(data);

    } catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar los origenes de la reserva."

      );

    } finally {

      setLoading(false);

    }

  }, [company]);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    fetchBookingSources();

  }, [fetchBookingSources]);

  /* ======================================================
     FILTERED DATA
  ====================================================== */

  const filteredBookingSources = useMemo(() => {

    return bookingSources.filter(source => {

      return (

        source.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())

      );

    });

  }, [

    bookingSources,

    searchTerm

  ]);

  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedBookingSource(null);

    setShowModal(true);

  };

  const openEditModal = (bookingSource) => {

    setSelectedBookingSource(

      bookingSource

    );

    setShowModal(true);

  };

  const closeModal = () => {

    setShowModal(false);

    setSelectedBookingSource(null);

  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (formData) => {

    try {

      if (selectedBookingSource) {

        await updateBookingSource(

          company.id,

          selectedBookingSource.id,

          formData,

          user

        );

        notifySuccess(
          "Origen de la reserva actualizado",
          "Los cambios fueron guardados correctamente."
        );

      } else {

        await createBookingSource(

          company.id,

          formData,

          user

        );

        notifySuccess(
          "Origen de la reserva creado",
          "Origen de la reserva fue creado correctamente."
        );

      }

      closeModal();

      fetchBookingSources();

    } catch (error) {

      console.error(error);
      
      notifyError(
        error?.message ||
        "Ocurrió un error inesperado."
      );

    }

  };

  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (bookingSource) => {

    const action =
      bookingSource.isActive === true
        ? "desactivar"
        : "activar";

    const confirmed = await notifyConfirm(
      `¿Deseas ${action} este origen de reserva?`
    );

    if (!confirmed) return;

    try {

      await toggleBookingSourceStatus(

        company.id,

        bookingSource.id,

        bookingSource.isActive

      );

      notifySuccess(
        "Estado actualizado",
        `El origen de la reserva fue ${action === "activar"
          ? "activado"
          : "desactivado"} correctamente.`
      );

      fetchBookingSources();

    } catch (error) {

      console.error(error);
      
      notifyError(
        error?.message ||
        "No fue posible actualizar el estado."
      );

    }

  };

    /* ======================================================
     COLUMNS
    ============¡========================================= */

    const columns = [

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
        key: "status",
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

  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="catalog-container">

      {/* ==================================================
          HEADER
      ================================================== */}

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
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar origen

          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {

          !loading &&
          filteredBookingSources.length === 0 && (

            <CatalogEmpty
              message="Todavía no hay orígenes de reserva registrados."
            />

          )

        }

        {

          filteredBookingSources.length > 0 && (

            <>

              <DataTable
                columns={columns}
                data={filteredBookingSources}
                renderRow={(bookingSource) => (

                <>

                    {/* ======================================
                        NAME
                    ====================================== */}

                    <td>

                    <strong>

                        {bookingSource.name}

                    </strong>

                    </td>

                    {/* ======================================
                        DESCRIPTION
                    ====================================== */}

                    <td>

                    <span className="catalog-description">

                        {

                        bookingSource.description ||

                        "-"

                        }

                    </span>

                    </td>

                    {/* ======================================
                        STATUS
                    ====================================== */}

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
                        options={[
                        {
                            value: "active",
                            label: "Activo"
                        },
                        {
                            value: "inactive",
                            label: "Inactivo"
                        }
                        ]}
                    />

                    </td>

                    {/* ======================================
                        ACTIONS
                    ====================================== */}

                    <td
                    style={{
                        textAlign: "center"
                    }}
                    >

                    <CatalogActions>

                        <button
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

                )}
              />

            </>

          )

        }

      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {

        showModal && (

          <BookingSourceForm
            bookingSource={
              selectedBookingSource
            }
            onClose={closeModal}
            onSave={handleSave}
          />

        )

      }

    </div>

  );

};

export default BookingSourcesSection;