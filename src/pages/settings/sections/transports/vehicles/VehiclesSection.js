import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  toggleVehicleStatus
} from "../../../../../services/settings/transportation/vehiclesService";

import { useAuth } from "../../../../../context/AuthContext";

import VehicleForm from "./VehicleForm";

import DataTable from "../../../../../components/general/dataTable";
import Pagination from "../../../../../components/general/pagination";
import Loading from "../../../../../components/general/loading";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import { VEHICLE_TYPES } from "../../../../../constants/transportation/vehicleTypes";
import { VEHICLE_STATUS } from "../../../../../constants/transportation/vehicleStatus";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

const VehiclesSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { session } = useAuth();

  const user = session?.user;

  const companyId = session?.company?.id;

  /* ======================================================
     STATE
  ====================================================== */

  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [typeFilter, setTypeFilter] = useState(null);

  const [statusFilter, setStatusFilter] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc"
  });

  /* ======================================================
     SORT
  ====================================================== */

  const handleSort = (key) => {

    setSortConfig((prev) => ({

      key,

      direction:

        prev.key === key &&
        prev.direction === "asc"

          ? "desc"

          : "asc"

    }));

  };

  /* ======================================================
     LOAD DATA
  ====================================================== */

  const fetchVehicles = async () => {

    if (!companyId) return;

    try {

      setLoading(true);

      const data = await getVehicles(companyId);

      const orderedVehicles = data.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setVehicles(orderedVehicles);

    } catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar los vehículos."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchVehicles();

  }, [companyId]);

  /* ======================================================
     PAGINATION
  ====================================================== */

  useEffect(() => {

    setCurrentPage(1);

  }, [

    rowsPerPage,

    searchTerm,

    typeFilter,

    statusFilter

  ]);

  /* ======================================================
     PROCESS DATA
  ====================================================== */

  const processedVehicles = useMemo(() => {

    let result = [...vehicles];

    /* =========================
       SEARCH
    ========================== */

    if (searchTerm.trim()) {

      const term = searchTerm.toLowerCase().trim();

      result = result.filter((vehicle) => {

        const searchableFields = [

          vehicle.name,
          vehicle.plate,
          vehicle.brand,
          vehicle.model,
          vehicle.color,
          vehicle.vin

        ];

        return searchableFields.some((field) =>

          (field || "")
            .toLowerCase()
            .includes(term)

        );

      });

    }

    /* =========================
       TYPE FILTER
    ========================== */

    if (typeFilter) {

      result = result.filter(

        (vehicle) =>

          vehicle.type === typeFilter.value

      );

    }

    /* =========================
       STATUS FILTER
    ========================== */

    if (statusFilter) {

      result = result.filter(

        (vehicle) =>

          vehicle.status === statusFilter.value

      );

    }

    /* =========================
       SORT
    ========================== */

    result.sort((a, b) => {

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === undefined || aValue === null)
        aValue = "";

      if (bValue === undefined || bValue === null)
        bValue = "";

      if (typeof aValue === "string") {

        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();

      }

      if (typeof aValue === "boolean") {

        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;

      }

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

    vehicles,

    searchTerm,

    typeFilter,

    statusFilter,

    sortConfig

  ]);

  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedVehicle(null);

    setShowModal(true);

  };

  const openEditModal = (vehicle) => {

    setSelectedVehicle(vehicle);

    setShowModal(true);

  };

  const closeModal = () => {

    setSelectedVehicle(null);

    setShowModal(false);

  };

  /* ======================================================
     CREATE / UPDATE
  ====================================================== */

  const handleSave = async (vehicleData) => {

    try {

      if (selectedVehicle) {

        await updateVehicle(
          companyId,
          selectedVehicle.id,
          vehicleData,
          user
        );

        notifySuccess(
          "Vehículo actualizado",
          "Los cambios fueron guardados correctamente."
        );

      } else {

        await createVehicle(
          companyId,
          vehicleData,
          user
        );

        notifySuccess(
          "Vehículo creado",
          "El vehículo fue creado correctamente."
        );

      }

      closeModal();

      await fetchVehicles();

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

  const handleToggle = async (vehicle) => {

    const action =
      vehicle.isActive === "active"
        ? "desactivar"
        : "activar";

    const confirmed = await notifyConfirm(
      `¿Deseas ${action} este vehículo?`
    );

    if (!confirmed) return;

    try {

      await toggleVehicleStatus(
        companyId,
        vehicle.id,
        vehicle.status,
        user
      );

      notifySuccess(
        "Estado actualizado",
        `El vehículo fue ${action === "activar"
          ? "activado"
          : "desactivado"} correctamente.`
      );

      await fetchVehicles();

    } catch (error) {

      console.error(error);

      notifyError(
        error?.message ||
        "No fue posible actualizar el estado."
      );

    }

  };

  /* ======================================================
     RENDER
  ====================================================== */

  if (loading) {

    return <Loading />;

  }

  return (

    <div className="catalog-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <CatalogHeader
        title="Vehículos"
        description="Administra la flotilla de vehículos de la empresa."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar vehículo..."
          />

          <Select
            className="catalog-filter"
            value={typeFilter}
            onChange={setTypeFilter}
            options={VEHICLE_TYPES}
            isClearable
            placeholder="Tipo"
          />

          <Select
            className="catalog-filter"
            value={statusFilter}
            onChange={setStatusFilter}
            options={VEHICLE_STATUS}
            isClearable
            placeholder="Estado"
          />

          <button
            className="btn-primary"
            onClick={openCreateModal}
          >
            + Agregar vehículo
          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ======================================================
          FORM
      ====================================================== */}

      {showModal && (

        <VehicleForm
          vehicle={selectedVehicle}
          onClose={closeModal}
          onSave={handleSave}
        />

      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="catalog-content">

        {processedVehicles.length === 0 ? (

          <CatalogEmpty
            message="No hay vehículos registrados todavía."
          />

        ) : (

          <DataTable

            data={processedVehicles}

            currentPage={currentPage}

            rowsPerPage={rowsPerPage}

            sortConfig={sortConfig}

            onSort={handleSort}

            columns={[

              {
                key: "name",
                label: "Nombre",
                sortable: true
              },

              {
                key: "plate",
                label: "Placa",
                sortable: true
              },

              {
                key: "type",
                label: "Tipo",
                sortable: true
              },

              {
                key: "brand",
                label: "Marca",
                sortable: true
              },

              {
                key: "passengers",
                label: "Capacidad",
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

            renderRow={(vehicle) => {

              const vehicleType =

                VEHICLE_TYPES.find(

                  item => item.value === vehicle.type

                )?.label || "-";

              const vehicleStatus =

                VEHICLE_STATUS.find(

                  item => item.value === vehicle.status

                )?.label || "-";

              return (

                <>

                  <td>

                    <strong>

                      {vehicle.name}

                    </strong>

                  </td>

                  <td>

                    {vehicle.plate}

                  </td>

                  <td>

                    {vehicleType}

                  </td>

                  <td>

                    {vehicle.brand || "-"}

                  </td>

                  <td>

                    {vehicle.passengers || "-"}

                  </td>

                  <td>

                    <CatalogStatusBadge
                      value={vehicle.status}
                      options={VEHICLE_STATUS}
                    />

                  </td>

                  <td>

                    <CatalogActions>

                      <button
                        className="catalog-action"
                        onClick={() => openEditModal(vehicle)}
                      >
                        Editar
                      </button>

                      <button
                        className="catalog-action"
                        onClick={() => handleToggle(vehicle)}
                      >
                        {
                          vehicle.status === "active"
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

        )}

      </div>

    </div>

  );

};

export default VehiclesSection;