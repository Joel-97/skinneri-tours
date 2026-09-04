import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import {
  getLocations,
  createLocations,
  updateLocations,
  toggleLocationStatus
} from "../../../../services/settings/transportation/locationsService";

import {
  useAuth
} from "../../../../context/AuthContext";

import Modal from "../../../../components/general/modal";

import Pagination from "../../../../components/general/pagination";

import DataTable from "../../../../components/general/dataTable";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../services/notificationService";

import "../../../../style/settings/transportation/locationsSection.css";

import Loading from "../../../../components/general/loading";


/* ===============================
   COMPONENT
================================= */

const LocationsSection = () => {

  const { session } = useAuth();

  const user = session?.user;

  const companyId = session?.company?.id;


  /* ===============================
     DATA
  ================================= */

  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /* ===============================
     FORM
  ================================= */

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState({

      code: "",

      name: "",

      isActive: true

    });


  /* ===============================
     SORT
  ================================= */

  const [sortConfig, setSortConfig] =
    useState({

      key: "name",

      direction: "asc"

    });


  /* ===============================
     SEARCH
  ================================= */

  const [searchTerm, setSearchTerm] =
    useState("");


  /* ===============================
     PAGINATION
  ================================= */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);


  /* ===============================
     SORT HANDLER
  ================================= */

  const handleSort = (key) => {

    setSortConfig(prev => ({

      key,

      direction:
        prev.key === key &&
        prev.direction === "asc"

          ? "desc"

          : "asc"

    }));

  };


  /* ===============================
     NORMALIZE CODE INPUT
  ================================= */

  const normalizeCodeInput = (
    value
  ) => {

    if (
      typeof value !==
      "string"
    ) {

      return "";

    }


    return value

      .toLowerCase()

      .replace(
        /[^a-z0-9-]/g,
        "-"
      )

      .replace(
        /-+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        "");

  };


  /* ===============================
     GENERATE CODE FROM NAME
  ================================= */

  const generateCodeFromName = (
    name
  ) => {

    if (
      typeof name !==
      "string"
    ) {

      return "";

    }


    return name

      .trim()

      .toLowerCase()

      .replace(
        /[^a-z0-9]+/g,
        "-"
      )

      .replace(
        /^-+|-+$/g,
        "");

  };


  /* ===============================
     PROCESSING
     FILTER + SORT
  ================================= */

  const processedLocations =
    useMemo(() => {

      let result =
        locations;


      /* ===============================
         FILTER
      ================================= */

      if (searchTerm) {

        const term =
          searchTerm
            .toLowerCase()
            .trim();


        result =
          result.filter((location) => (

            location.code
              ?.toLowerCase()
              .includes(term)

            ||

            location.name
              ?.toLowerCase()
              .includes(term)

          ));

      }


      /* ===============================
         SORT
      ================================= */

      result =
        [...result].sort((a, b) => {

          let aValue =
            a[sortConfig.key];

          let bValue =
            b[sortConfig.key];


          /* ===============================
             BOOLEAN
          ================================= */

          if (
            typeof aValue ===
            "boolean"
          ) {

            aValue =
              aValue ? 1 : 0;

            bValue =
              bValue ? 1 : 0;

          }


          /* ===============================
             STRING
          ================================= */

          if (
            typeof aValue ===
            "string"
          ) {

            aValue =
              aValue.toLowerCase();

            bValue =
              bValue.toLowerCase();

          }


          /* ===============================
             NULL SAFETY
          ================================= */

          if (
            aValue == null
          ) {

            aValue = "";

          }

          if (
            bValue == null
          ) {

            bValue = "";

          }


          /* ===============================
             COMPARE
          ================================= */

          if (
            aValue < bValue
          ) {

            return (
              sortConfig.direction ===
              "asc"
            )
              ? -1
              : 1;

          }


          if (
            aValue > bValue
          ) {

            return (
              sortConfig.direction ===
              "asc"
            )
              ? 1
              : -1;

          }


          return 0;

        });


      return result;

    }, [
      locations,
      searchTerm,
      sortConfig
    ]);


  /* ===============================
     PAGINATION
  ================================= */

  const totalPages =
    Math.ceil(
      processedLocations.length /
      rowsPerPage
    );


  const currentLocations =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        rowsPerPage;


      return processedLocations.slice(
        start,
        start + rowsPerPage
      );

    }, [
      processedLocations,
      currentPage,
      rowsPerPage
    ]);


  /* ===============================
     LOAD DATA
  ================================= */

  const cargarLocations = async () => {

    if (!companyId) {

      return;

    }


    try {

      const data =
        await getLocations(
          companyId
        );


      const ordenados =
        [...data].sort((a, b) =>
          (a.name || "").localeCompare(
            b.name || ""
          )
        );


      setLocations(
        ordenados
      );


    } catch (error) {

      console.error(error);

      notifyError(
        "Error cargando lugares",
        error.message ||
        "No se pudieron cargar los lugares."
      );

    } finally {

      setLoading(false);

    }

  };


  /* ===============================
     INITIAL LOAD
  ================================= */

  useEffect(() => {

    cargarLocations();

  }, [companyId]);


  /* ===============================
     RESET PAGINATION
  ================================= */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    rowsPerPage,
    searchTerm
  ]);


  /* ===============================
     RESET FORM
  ================================= */

  const resetForm = () => {

    setForm({

      code: "",

      name: "",

      isActive: true

    });


    setEditingId(
      null
    );


    setShowForm(
      false
    );

  };


  /* ===============================
     CREATE / UPDATE
  ================================= */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    /* ===============================
       VALIDATE NAME
    ================================= */

    if (
      !form.name?.trim()
    ) {

      notifyError(
        "El nombre es obligatorio."
      );

      return;

    }


    /* ===============================
       VALIDATE CODE
    ================================= */

    if (
      !form.code?.trim()
    ) {

      notifyError(
        "El código es obligatorio."
      );

      return;

    }


    try {

      const finalForm = {

        ...form,

        code:
          normalizeCodeInput(
            form.code
          ),

        name:
          form.name.trim()

      };


      /* ===============================
         UPDATE
      ================================= */

      if (editingId) {

        await updateLocations(

          companyId,

          editingId,

          finalForm,

          user

        );


        notifySuccess(
          "Lugar actualizado",
          "Los cambios fueron guardados."
        );

      }


      /* ===============================
         CREATE
      ================================= */

      else {

        await createLocations(

          companyId,

          finalForm,

          user

        );


        notifySuccess(
          "Lugar creado",
          "El lugar fue creado correctamente."
        );

      }


      /* ===============================
         RESET + RELOAD
      ================================= */

      resetForm();

      await cargarLocations();


    } catch (error) {

      console.error(error);

      notifyError(
        error.message ||
        "Ocurrió un error inesperado."
      );

    }

  };


  /* ===============================
     EDIT
  ================================= */

  const handleEdit = (
    location
  ) => {

    /*
    ==========================================
    LEGACY LOCATION

    Si una ubicación antigua no tiene código,
    generamos uno automáticamente a partir
    del nombre.
    ==========================================
    */

    const locationCode =
      location.code ||
      generateCodeFromName(
        location.name
      );


    setForm({

      code:
        locationCode,

      name:
        location.name ||
        "",

      isActive:
        location.isActive ??
        true

    });


    setEditingId(
      location.id
    );


    setShowForm(
      true
    );

  };


  /* ===============================
     TOGGLE STATUS
  ================================= */

  const handleToggle = async (
    location
  ) => {

    const confirmed =
      await notifyConfirm(

        `¿Deseas ${
          location.isActive
            ? "desactivar"
            : "activar"
        } este lugar?`

      );


    if (!confirmed) {

      return;

    }


    try {

      await toggleLocationStatus(

        companyId,

        location.id,

        location.isActive

      );


      notifySuccess(

        "Estado actualizado",

        `El lugar fue ${
          location.isActive
            ? "desactivado"
            : "activado"
        } correctamente.`

      );


      await cargarLocations();


    } catch (error) {

      notifyError(
        error.message ||
        "No se pudo actualizar."
      );

    }

  };


  /* ===============================
     RENDER
  ================================= */

  if (loading) {

    return <Loading />;

  }


  return (

    <div className="locations-container">


      {/* ===============================
          HEADER
      ================================= */}

      <div className="locations-header">


        {/* ===============================
            LEFT
        ================================= */}

        <div className="locations-header-left">

          <h3>
            Lugares
          </h3>

          <p>
            Administra los puntos disponibles para reservas.
          </p>

        </div>


        {/* ===============================
            RIGHT
        ================================= */}

        <div className="locations-header-right">


          <input

            type="text"

            className="search-input"

            placeholder="Buscar lugar..."

            value={
              searchTerm
            }

            onChange={(e) => {

              setSearchTerm(
                e.target.value
              );

              setCurrentPage(1);

            }}

          />


          <button

            className="btn-primary"

            onClick={() =>
              setShowForm(true)
            }

          >

            + Agregar lugar

          </button>


        </div>


      </div>


      {/* ===============================
          FORM MODAL
      ================================= */}

      {showForm && (

        <Modal
          onClose={
            resetForm
          }
        >

          <div className="app-modal-header">

            <h4>

              {
                editingId
                  ? "Editar lugar"
                  : "Nuevo lugar"
              }

            </h4>


            <button

              className="close-btn"

              onClick={
                resetForm
              }

            >

              ✕

            </button>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >


            {/* ===============================
                CODE
            ================================= */}

            <div className="form-group">

              <label>
                Código
              </label>


              <input

                type="text"

                value={
                  form.code
                }

                onChange={(e) =>
                  setForm({

                    ...form,

                    code:
                      normalizeCodeInput(
                        e.target.value
                      )

                  })
                }

                placeholder="Ej: aeropuerto-lir"

                maxLength={50}

                required

              />


              <small>

                Identificador público del lugar. Usa letras, números y guiones.

              </small>

            </div>


            {/* ===============================
                NAME
            ================================= */}

            <div className="form-group">

              <label>
                Lugar
              </label>


              <input

                type="text"

                value={
                  form.name
                }

                onChange={(e) =>
                  setForm({

                    ...form,

                    name:
                      e.target.value

                  })
                }

                required

              />

            </div>


            {/* ===============================
                ACTIVE
            ================================= */}

            <div className="form-checkbox">

              <label>

                <input

                  type="checkbox"

                  checked={
                    form.isActive
                  }

                  onChange={(e) =>
                    setForm({

                      ...form,

                      isActive:
                        e.target.checked

                    })
                  }

                />

                Activo

              </label>

            </div>


            {/* ===============================
                BUTTONS
            ================================= */}

            <div className="form-actions">


              <button

                type="button"

                className="btn-secondary"

                onClick={
                  resetForm
                }

              >

                Cancelar

              </button>


              <button

                className="btn-primary"

                type="submit"

              >

                {
                  editingId
                    ? "Actualizar"
                    : "Crear"
                }

              </button>


            </div>


          </form>

        </Modal>

      )}


      {/* ===============================
          TABLE
      ================================= */}

      <div className="locations-content">


        {locations.length === 0 ? (

          <div className="locations-empty">

            <p>
              No hay lugares registrados todavía.
            </p>

          </div>

        ) : (

          <DataTable

            data={
              currentLocations
            }

            rowsPerPage={
              rowsPerPage
            }

            columns={[

              {
                key:
                  "code",

                label:
                  "Código",

                sortable:
                  true

              },

              {
                key:
                  "name",

                label:
                  "Nombre",

                sortable:
                  true

              },

              {
                key:
                  "isActive",

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


            renderRow={(location) => (

              <>


                {/* ===============================
                    CODE
                ================================= */}

                <td>

                  <span>

                    {
                      location.code ||
                      "—"
                    }

                  </span>

                </td>


                {/* ===============================
                    NAME
                ================================= */}

                <td>

                  {
                    location.name
                  }

                </td>


                {/* ===============================
                    STATUS
                ================================= */}

                <td>

                  <span

                    className={

                      location.isActive

                        ? "badge-active"

                        : "badge-inactive"

                    }

                  >

                    {
                      location.isActive
                        ? "Activo"
                        : "Inactivo"
                    }

                  </span>

                </td>


                {/* ===============================
                    ACTIONS
                ================================= */}

                <td>

                  <button

                    className="btn-link"

                    onClick={() =>
                      handleEdit(location)
                    }

                  >

                    Editar

                  </button>


                  <button

                    className="btn-link"

                    onClick={() =>
                      handleToggle(location)
                    }

                  >

                    {
                      location.isActive
                        ? "Desactivar"
                        : "Activar"
                    }

                  </button>

                </td>


              </>

            )}

          />

        )}

      </div>

    </div>

  );

};


export default LocationsSection;