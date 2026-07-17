import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus
} from "lucide-react";

import {
  useAuth
} from "../../../../../context/AuthContext";

import {
  useCompany
} from "../../../../../context/CompanyContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  getRoutes,
  createRoute,
  updateRoute,
  toggleRouteStatus
} from "../../../../../services/settings/transportation/routesService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import RouteForm from "./RouteForm";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

/* ======================================================
   COMPONENT
====================================================== */

const RoutesSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { user } = useAuth();

  const { company } = useCompany();

  /* ======================================================
     STATE
  ====================================================== */

  const [routes, setRoutes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRoute, setSelectedRoute] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ======================================================
     FETCH
  ====================================================== */

  const fetchRoutes = useCallback(async () => {

    if (!company?.id) return;

    try {

      setLoading(true);

      const data = await getRoutes(company.id);

      setRoutes(data);

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar las rutas."

      );

    }

    finally {

      setLoading(false);

    }

  }, [company]);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    fetchRoutes();

  }, [fetchRoutes]);

  /* ======================================================
     FILTERED DATA
  ====================================================== */

  const filteredRoutes = useMemo(() => {

    return routes.filter(route => {

      const search = searchTerm.toLowerCase();

      return (

        route.code
          ?.toLowerCase()
          .includes(search)

        ||

        route.origin?.name
          ?.toLowerCase()
          .includes(search)

        ||

        route.destination?.name
          ?.toLowerCase()
          .includes(search)

      );

    });

  }, [

    routes,

    searchTerm

  ]);

  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedRoute(null);

    setShowModal(true);

  };

  const openEditModal = (route) => {

    setSelectedRoute(route);

    setShowModal(true);

  };

  const closeModal = () => {

    setShowModal(false);

    setSelectedRoute(null);

  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (formData) => {

    try {

      if (selectedRoute) {

        await updateRoute(

          company.id,

          selectedRoute.id,

          formData,

          user

        );

        notifySuccess(

          "Ruta actualizada",

          "Los cambios fueron guardados correctamente."

        );

      }

      else {

        await createRoute(

          company.id,

          formData,

          user

        );

        notifySuccess(

          "Ruta creada",

          "La ruta fue creada correctamente."

        );

      }

      closeModal();

      fetchRoutes();

    }

    catch (error) {

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

  const handleToggleStatus = async (route) => {

    const action =

      route.isActive

        ? "desactivar"

        : "activar";

    const confirmed = await notifyConfirm(

      `¿Deseas ${action} esta ruta?`

    );

    if (!confirmed) return;

    try {

      await toggleRouteStatus(

        company.id,

        route.id,

        route.isActive

      );

      notifySuccess(

        "Estado actualizado",

        `La ruta fue ${

          action === "activar"

            ? "activada"

            : "desactivada"

        } correctamente.`

      );

      fetchRoutes();

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible actualizar el estado."

      );

    }

  };

    /* ======================================================
     COLUMNS
  ====================================================== */

  const columns = [

    {
      key: "code",
      label: "Código",
      sortable: true,
      maxWidth: "180px"
    },

    {
      key: "origin",
      label: "Origen",

      minWidth: "220px",

      maxWidth: "260px"
    },

    {
      key: "destination",
      label: "Destino",

      minWidth: "220px",

      maxWidth: "260px"
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
        title="Rutas"
        description="Administra las rutas disponibles para los servicios de transporte."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar ruta..."
          />

          <button
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar ruta

          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {

          !loading &&
          filteredRoutes.length === 0 && (

            <CatalogEmpty
              message="Todavía no hay rutas registradas."
            />

          )

        }

        {

          filteredRoutes.length > 0 && (

            <>

              <DataTable
                columns={columns}
                data={filteredRoutes}
                renderRow={(route) => (

                  <>

                    {/* ======================================
                        CODE
                    ====================================== */}

                    <td>

                      <strong>

                        {route.code}

                      </strong>

                    </td>

                    {/* ======================================
                        ORIGIN
                    ====================================== */}

                    <td>

                      {route.origin?.name || "-"}

                    </td>

                    {/* ======================================
                        DESTINATION
                    ====================================== */}

                    <td>

                      {route.destination?.name || "-"}

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
                          route.isActive
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
                              route
                            )
                          }
                        >

                          Editar

                        </button>

                        <button
                          className="catalog-action"
                          onClick={() =>
                            handleToggleStatus(
                              route
                            )
                          }
                        >

                          {

                            route.isActive

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

          <RouteForm
            companyId={company.id}
            route={selectedRoute}
            onClose={closeModal}
            onSave={handleSave}
          />

        )

      }

    </div>

  );

};

export default RoutesSection;