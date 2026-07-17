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

  getMaintenance,

  createMaintenance,

  updateMaintenance,

  toggleMaintenanceStatus

} from "../../../../../services/settings/transportation/maintenanceService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import MaintenanceForm from "./MaintenanceForm";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

/* ======================================================
   COMPONENT
====================================================== */

const MaintenanceSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { user } = useAuth();

  const { company } = useCompany();

  /* ======================================================
     STATE
  ====================================================== */

  const [maintenance, setMaintenance] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedMaintenance, setSelectedMaintenance] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  /* ======================================================
     FETCH
  ====================================================== */

  const fetchMaintenance = useCallback(async () => {

    if (!company?.id) return;

    try {

      setLoading(true);

      const data = await getMaintenance(

        company.id

      );

      setMaintenance(data);

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar los mantenimientos."

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

    fetchMaintenance();

  }, [fetchMaintenance]);

  /* ======================================================
     FILTERED DATA
  ====================================================== */

  const filteredMaintenance = useMemo(() => {

    const search =

      searchTerm.toLowerCase();

    return maintenance.filter(item => (

      item.vehicle?.code

        ?.toLowerCase()

        .includes(search)

      ||

      item.vehicle?.name

        ?.toLowerCase()

        .includes(search)

      ||

      item.category?.label

        ?.toLowerCase()

        .includes(search)

      ||

      item.area?.label

        ?.toLowerCase()

        .includes(search)

      ||

      item.provider

        ?.toLowerCase()

        .includes(search)

    ));

  }, [

    maintenance,

    searchTerm

  ]);

    /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedMaintenance(null);

    setShowModal(true);

  };

  const openEditModal = (maintenance) => {

    setSelectedMaintenance(maintenance);

    setShowModal(true);

  };

  const closeModal = () => {

    setShowModal(false);

    setSelectedMaintenance(null);

  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (

    formData,

    options = {}

  ) => {

    try {

      if (selectedMaintenance) {

        await updateMaintenance(

          company.id,

          selectedMaintenance.id,

          formData,

          user,

          options

        );

        notifySuccess(

          "Mantenimiento actualizado",

          "Los cambios fueron guardados correctamente."

        );

      }

      else {

        await createMaintenance(

          company.id,

          formData,

          user,

          options

        );

        notifySuccess(

          "Mantenimiento registrado",

          "El mantenimiento fue registrado correctamente."

        );

      }

      closeModal();

      fetchMaintenance();

    }

    catch (error) {

      /* ==========================================
         LOWER MILEAGE
      ========================================== */

      if (

        error.code ===

        "LOWER_MILEAGE"

      ) {

        const confirmed =

          await notifyConfirm(

            `El kilometraje ingresado es menor que el último registrado (${error.highestMileage} km).

¿Desea guardar el mantenimiento de todas formas?`

          );

        if (!confirmed) return;

        return handleSave(

          formData,

          {

            force: true

          }

        );

      }

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

  const handleToggleStatus = async (

    maintenance

  ) => {

    const action =

      maintenance.isActive

        ? "desactivar"

        : "activar";

    const confirmed =

      await notifyConfirm(

        `¿Deseas ${action} este mantenimiento?`

      );

    if (!confirmed) return;

    try {

      await toggleMaintenanceStatus(

        company.id,

        maintenance.id,

        maintenance.isActive

      );

      notifySuccess(

        "Estado actualizado",

        `El mantenimiento fue ${

          action === "activar"

            ? "activado"

            : "desactivado"

        } correctamente.`

      );

      fetchMaintenance();

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

      key: "vehicle",

      label: "Vehículo",

      minWidth: "240px",

      sortable: true

    },

    {

      key: "category",

      label: "Tipo",

      minWidth: "180px"

    },

    {

      key: "area",

      label: "Área",

      minWidth: "180px"

    },

    {

      key: "date",

      label: "Fecha",

      width: "160px",

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
        title="Mantenimiento"
        description="Administra el historial de mantenimiento de los vehículos."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar mantenimiento..."
          />

          <button
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar mantenimiento

          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {

          !loading &&
          filteredMaintenance.length === 0 && (

            <CatalogEmpty
              message="Todavía no hay mantenimientos registrados."
            />

          )

        }

        {

          filteredMaintenance.length > 0 && (

            <DataTable

              columns={columns}

              data={filteredMaintenance}

              renderRow={(maintenance) => (

                <>

                  {/* ======================================
                      VEHICLE
                  ====================================== */}

                  <td>

                    <strong>

                      {

                        maintenance.vehicle?.code

                      }

                    </strong>

                    <br />

                    <span>

                      {

                        maintenance.vehicle?.name

                      }

                    </span>

                  </td>

                  {/* ======================================
                      CATEGORY
                  ====================================== */}

                  <td>

                    {

                      maintenance.category?.label ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      AREA
                  ====================================== */}

                  <td>

                    {

                      maintenance.area?.label ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      DATE
                  ====================================== */}

                  <td
                    style={{
                      textAlign:"center"
                    }}
                  >

                    {

                      maintenance.date ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      MILEAGE
                  ====================================== */}

                  <td
                    style={{
                      textAlign:"center"
                    }}
                  >

                    {

                      maintenance.mileage

                        ? `${maintenance.mileage.toLocaleString()} km`

                        : "-"

                    }

                  </td>

                  {/* ======================================
                      STATUS
                  ====================================== */}

                  <td
                    style={{
                      textAlign:"center"
                    }}
                  >

                    <CatalogStatusBadge

                      value={

                        maintenance.isActive

                          ? "active"

                          : "inactive"

                      }

                      options={[

                        {

                          value:"active",

                          label:"Activo"

                        },

                        {

                          value:"inactive",

                          label:"Inactivo"

                        }

                      ]}

                    />

                  </td>

                  {/* ======================================
                      ACTIONS
                  ====================================== */}

                  <td
                    style={{
                      textAlign:"center"
                    }}
                  >

                    <CatalogActions>

                      <button

                        className="catalog-action"

                        onClick={() =>

                          openEditModal(

                            maintenance

                          )

                        }

                      >

                        Editar

                      </button>

                      <button

                        className="catalog-action"

                        onClick={() =>

                          handleToggleStatus(

                            maintenance

                          )

                        }

                      >

                        {

                          maintenance.isActive

                            ? "Desactivar"

                            : "Activar"

                        }

                      </button>

                    </CatalogActions>

                  </td>

                </>

              )}

            />

          )

        }

      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {

        showModal && (

          <MaintenanceForm

            companyId={company.id}

            maintenance={selectedMaintenance}

            onClose={closeModal}

            onSave={handleSave}

          />

        )

      }

    </div>

  );

};

export default MaintenanceSection;