import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  getDrivers,
  createDriver,
  updateDriver,
  toggleDriverStatus
} from "../../../../../services/settings/transportation/driversService";

import {
  DRIVER_TYPES
} from "../../../../../constants/transportation/driverTypes";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import DriverForm from "./DriverForm";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

/* ======================================================
   COMPONENT
====================================================== */

const DriversSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { session } = useAuth();

  const user = session?.user;

  const company = session?.company;

  /* ======================================================
     STATE
  ====================================================== */

  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDriver, setSelectedDriver] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ======================================================
     FETCH
  ====================================================== */

  const fetchDrivers = useCallback(async () => {

    if (!company?.id) return;

    try {

      setLoading(true);

      const data = await getDrivers(company.id);

      setDrivers(data);

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar los conductores."

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

    fetchDrivers();

  }, [fetchDrivers]);

  /* ======================================================
     FILTERED DATA
  ====================================================== */

  const filteredDrivers = useMemo(() => {

    const search = searchTerm.toLowerCase();

    return drivers.filter(driver => {

      const driverType = DRIVER_TYPES.find(

        type =>

          type.value === driver.driverType

      );

      return (

        driver.name
          ?.toLowerCase()
          .includes(search)

        ||

        driver.phone
          ?.toLowerCase()
          .includes(search)

        ||

        driver.email
          ?.toLowerCase()
          .includes(search)

        ||

        driverType?.label
          ?.toLowerCase()
          .includes(search)

      );

    });

  }, [

    drivers,

    searchTerm

  ]);

  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedDriver(null);

    setShowModal(true);

  };

  const openEditModal = (driver) => {

    setSelectedDriver(driver);

    setShowModal(true);

  };

  const closeModal = () => {

    setShowModal(false);

    setSelectedDriver(null);

  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (formData) => {

    try {

      if (selectedDriver) {

        await updateDriver(

          company.id,

          selectedDriver.id,

          formData,

          user

        );

        notifySuccess(

          "Conductor actualizado",

          "Los cambios fueron guardados correctamente."

        );

      }

      else {

        await createDriver(

          company.id,

          formData,

          user

        );

        notifySuccess(

          "Conductor creado",

          "El conductor fue creado correctamente."

        );

      }

      closeModal();

      fetchDrivers();

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

  const handleToggleStatus = async (driver) => {

    const action =

      driver.isActive

        ? "desactivar"

        : "activar";

    const confirmed = await notifyConfirm(

      `¿Deseas ${action} este conductor?`

    );

    if (!confirmed) return;

    try {

      await toggleDriverStatus(

        company.id,

        driver.id,

        driver.isActive

      );

      notifySuccess(

        "Estado actualizado",

        `El conductor fue ${

          action === "activar"

            ? "activado"

            : "desactivado"

        } correctamente.`

      );

      fetchDrivers();

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
      key: "name",
      label: "Nombre",
      sortable: true,
      minWidth: "250px",
      maxWidth: "280px"
    },

    {
      key: "phone",
      label: "Teléfono",
      minWidth: "170px",
      maxWidth: "180px"
    },

    {
      key: "email",
      label: "Email",
      minWidth: "240px",
      maxWidth: "280px"
    },

    {
      key: "driverType",
      label: "Tipo",
      width: "170px",
      align: "center"
    },

    {
      key: "availability",
      label: "Disponible",
      width: "150px",
      align: "center"
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
        title="Conductores"
        description="Administra los conductores disponibles para los servicios de transporte."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar conductor..."
          />

          <button
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar conductor

          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {

          !loading &&
          filteredDrivers.length === 0 && (

            <CatalogEmpty
              message="Todavía no hay conductores registrados."
            />

          )

        }

        {

          filteredDrivers.length > 0 && (

            <DataTable

              columns={columns}

              data={filteredDrivers}

              renderRow={(driver) => {

                const driverType = DRIVER_TYPES.find(

                  type =>

                    type.value ===

                    driver.driverType

                );

                return (

                  <>

                    {/* ======================================
                        NAME
                    ====================================== */}

                    <td>

                      <strong>

                        {driver.name}

                      </strong>

                    </td>

                    {/* ======================================
                        PHONE
                    ====================================== */}

                    <td>

                      {driver.phone || "-"}

                    </td>

                    {/* ======================================
                        EMAIL
                    ====================================== */}

                    <td>

                      {driver.email || "-"}

                    </td>

                    {/* ======================================
                        DRIVER TYPE
                    ====================================== */}

                    <td
                      style={{
                        textAlign: "center"
                      }}
                    >

                      {

                        driverType?.label || "-"

                      }

                    </td>

                    {/* ======================================
                        AVAILABLE
                    ====================================== */}

                    <td
                      style={{
                        textAlign: "center"
                      }}
                    >

                      <CatalogStatusBadge
                        value={

                          driver.isAvailable

                            ? "available"

                            : "unavailable"

                        }
                        options={[

                          {

                            value: "available",

                            label: "Disponible"

                          },

                          {

                            value: "unavailable",

                            label: "No disponible"

                          }

                        ]}
                      />

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

                          driver.isActive

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
                              driver
                            )
                          }
                        >

                          Editar

                        </button>

                        <button
                          className="catalog-action"
                          onClick={() =>
                            handleToggleStatus(
                              driver
                            )
                          }
                        >

                          {

                            driver.isActive

                              ? "Desactivar"

                              : "Activar"

                          }

                        </button>

                      </CatalogActions>

                    </td>

                  </>

                );

              }}

            />

          )

        }

      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {

        showModal && (

          <DriverForm

            driver={selectedDriver}

            onClose={closeModal}

            onSave={handleSave}

          />

        )

      }

    </div>

  );

};

export default DriversSection;