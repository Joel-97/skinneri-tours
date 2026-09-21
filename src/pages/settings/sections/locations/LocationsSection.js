import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
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

import DataTable
  from "../../../../components/general/dataTable";

import Loading
  from "../../../../components/general/loading";

import LocationsForm
  from "./LocationsForm";

import CatalogHeader
  from "../../components/CatalogHeader";

import CatalogSearch
  from "../../components/CatalogSearch";

import CatalogToolbar
  from "../../components/CatalogToolbar";

import CatalogEmpty
  from "../../components/CatalogEmpty";

import CatalogStatusBadge
  from "../../components/CatalogStatusBadge";

import CatalogActions
  from "../../components/CatalogActions";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../services/notificationService";

import "../../../../style/settings/transportation/locationsSection.css";


const LOCATION_STATUS_OPTIONS = [
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
    key: "code",
    label: "Código",
    sortable: true
  },
  {
    key: "name",
    label: "Nombre",
    sortable: true
  },
  {
    key: "isActive",
    label: "Estado",
    sortable: true
  },
  {
    key: "actions",
    label: "Acciones",
    sortable: false
  }
];


const compareValues = (a, b) => {
  if (typeof a === "boolean") {
    return Number(a) - Number(b);
  }

  return String(a ?? "")
    .toLowerCase()
    .localeCompare(
      String(b ?? "").toLowerCase()
    );
};


const LocationsSection = () => {
  const { session } = useAuth();

  const user = session?.user;
  const companyId =
    session?.company?.id;


  const [locations, setLocations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [sortConfig, setSortConfig] =
    useState({
      key: "name",
      direction: "asc"
    });


  /*
   * LOAD
   */

  const fetchLocations =
    useCallback(async () => {
      if (!companyId) {
        setLocations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await getLocations(
            companyId
          );

        setLocations(
          [...data].sort(
            (a, b) =>
              String(a.name || "")
                .localeCompare(
                  String(b.name || "")
                )
          )
        );
      } catch (error) {
        console.error(
          "Error loading locations:",
          error
        );

        notifyError(
          error?.message ||
          "No se pudieron cargar los lugares."
        );
      } finally {
        setLoading(false);
      }
    }, [companyId]);


  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);


  /*
   * RESET PAGINATION
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    rowsPerPage
  ]);


  /*
   * SORT
   */

  const handleSort = useCallback(
    key => {
      setSortConfig(previous => ({
        key,
        direction:
          previous.key === key &&
          previous.direction === "asc"
            ? "desc"
            : "asc"
      }));
    },
    []
  );


  /*
   * FILTER + SORT
   */

  const processedLocations =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered = term
        ? locations.filter(
            location =>
              [
                location.code,
                location.name
              ].some(value =>
                String(value || "")
                  .toLowerCase()
                  .includes(term)
              )
          )
        : [...locations];

      const {
        key,
        direction
      } = sortConfig;

      return filtered.sort(
        (a, b) => {
          const result =
            compareValues(
              a?.[key],
              b?.[key]
            );

          return direction === "asc"
            ? result
            : -result;
        }
      );
    }, [
      locations,
      searchTerm,
      sortConfig
    ]);


  /*
   * MODAL
   */

  const openCreateForm = () => {
    setSelectedLocation(null);
    setShowForm(true);
  };


  const openEditForm = (
    location
  ) => {
    setSelectedLocation(location);
    setShowForm(true);
  };


  const closeForm = () => {
    setSelectedLocation(null);
    setShowForm(false);
  };


  /*
   * SAVE
   */

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
      if (selectedLocation?.id) {
        await updateLocations(
          companyId,
          selectedLocation.id,
          formData,
          user
        );

        notifySuccess(
          "Lugar actualizado",
          "Los cambios fueron guardados correctamente."
        );
      } else {
        await createLocations(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Lugar creado",
          "El lugar fue creado correctamente."
        );
      }

      closeForm();
      await fetchLocations();
    } catch (error) {
      console.error(
        "Error saving location:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible guardar el lugar."
      );

      throw error;
    }
  };


  /*
   * TOGGLE
   */

  const handleToggle = async (
    location
  ) => {
    const isActive =
      Boolean(location.isActive);

    const action =
      isActive
        ? "desactivar"
        : "activar";

    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este lugar?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await toggleLocationStatus(
        companyId,
        location.id,
        isActive
      );

      notifySuccess(
        "Estado actualizado",
        `El lugar fue ${
          isActive
            ? "desactivado"
            : "activado"
        } correctamente.`
      );

      await fetchLocations();
    } catch (error) {
      console.error(
        "Error updating location status:",
        error
      );

      notifyError(
        error?.message ||
        "No se pudo actualizar el estado."
      );
    }
  };


  /*
   * LOADING
   */

  if (loading) {
    return <Loading />;
  }


  /*
   * RENDER
   */

  return (
    <div className="locations-container">

      <CatalogHeader
        title="Lugares"
        description="Administra los puntos disponibles para reservas."
      >
        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar lugar..."
          />

          <button
            type="button"
            className="btn-primary"
            onClick={openCreateForm}
          >
            + Agregar lugar
          </button>

        </CatalogToolbar>
      </CatalogHeader>


      {showForm && (
        <LocationsForm
          location={
            selectedLocation
          }
          onClose={closeForm}
          onSave={handleSave}
        />
      )}


      <div className="locations-content">

        {processedLocations.length === 0 ? (
          <CatalogEmpty
            message="No hay lugares registrados todavía."
          />
        ) : (
          <DataTable
            data={
              processedLocations
            }
            currentPage={
              currentPage
            }
            rowsPerPage={
              rowsPerPage
            }
            sortConfig={
              sortConfig
            }
            onSort={
              handleSort
            }
            columns={
              TABLE_COLUMNS
            }
            renderRow={
              location => (
                <React.Fragment
                  key={location.id}
                >

                  <td>
                    {location.code ||
                      "—"}
                  </td>


                  <td>
                    {location.name ||
                      "—"}
                  </td>


                  <td>
                    <CatalogStatusBadge
                      value={
                        location.isActive
                          ? "active"
                          : "inactive"
                      }
                      options={
                        LOCATION_STATUS_OPTIONS
                      }
                    />
                  </td>


                  <td>
                    <CatalogActions>

                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          openEditForm(
                            location
                          )
                        }
                      >
                        Editar
                      </button>


                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggle(
                            location
                          )
                        }
                      >
                        {
                          location.isActive
                            ? "Desactivar"
                            : "Activar"
                        }
                      </button>

                    </CatalogActions>
                  </td>

                </React.Fragment>
              )
            }
          />
        )}

      </div>

    </div>
  );
};


export default LocationsSection;