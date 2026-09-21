/*
==========================================================
IMPORTS
==========================================================
*/

import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import Select from "react-select";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  toggleVehicleStatus
} from "../../../../../services/settings/transportation/vehiclesService";

import {
  useAuth
} from "../../../../../context/AuthContext";

import VehicleForm
  from "./VehicleForm";

import DataTable
  from "../../../../../components/general/dataTable";

import Loading
  from "../../../../../components/general/loading";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  VEHICLE_TYPES
} from "../../../../../constants/transportation/vehicleTypes";

import {
  VEHICLE_STATUS
} from "../../../../../constants/transportation/vehicleStatus";

import CatalogHeader
  from "../../../components/CatalogHeader";

import CatalogSearch
  from "../../../components/CatalogSearch";

import CatalogToolbar
  from "../../../components/CatalogToolbar";

import CatalogEmpty
  from "../../../components/CatalogEmpty";

import CatalogStatusBadge
  from "../../../components/CatalogStatusBadge";

import CatalogActions
  from "../../../components/CatalogActions";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


/*
==========================================================
COMPONENT
==========================================================
*/

const VehiclesSection = () => {

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  const {
    session
  } = useAuth();


  const user =
    session?.user;


  const companyId =
    session?.company?.id;


  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [
    vehicles,
    setVehicles
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    showModal,
    setShowModal
  ] = useState(false);


  const [
    selectedVehicle,
    setSelectedVehicle
  ] = useState(null);


  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    typeFilter,
    setTypeFilter
  ] = useState(null);


  const [
    statusFilter,
    setStatusFilter
  ] = useState(null);


  const [
    currentPage,
    setCurrentPage
  ] = useState(1);


  const [
    rowsPerPage,
    setRowsPerPage
  ] = useState(10);


  const [
    sortConfig,
    setSortConfig
  ] = useState({

    key: "name",

    direction: "asc"

  });


  /*
  ==========================================================
  LOAD VEHICLES
  ==========================================================
  */

  const fetchVehicles = async () => {

    if (!companyId) {

      setVehicles([]);

      setLoading(false);

      return;

    }


    try {

      setLoading(true);


      const data =
        await getVehicles(
          companyId
        );


      const orderedVehicles =
        [...data].sort(
          (a, b) =>

            (a.name || "")
              .localeCompare(
                b.name || ""
              )

        );


      setVehicles(
        orderedVehicles
      );

    }

    catch (error) {

      console.error(
        "Error loading vehicles:",
        error
      );


      notifyError(

        error?.message ||

        "No fue posible cargar los vehículos."

      );

    }

    finally {

      setLoading(false);

    }

  };


  /*
  ==========================================================
  INITIAL LOAD
  ==========================================================
  */

  useEffect(() => {

    fetchVehicles();

  }, [

    companyId

  ]);


  /*
  ==========================================================
  RESET PAGINATION
  ==========================================================
  */

  useEffect(() => {

    setCurrentPage(1);

  }, [

    rowsPerPage,

    searchTerm,

    typeFilter,

    statusFilter

  ]);


  /*
  ==========================================================
  SORT
  ==========================================================
  */

  const handleSort = (
    key
  ) => {

    setSortConfig(
      (previous) => ({

        key,

        direction:

          previous.key === key &&
          previous.direction === "asc"

            ? "desc"

            : "asc"

      })
    );

  };


  /*
  ==========================================================
  PROCESS VEHICLES
  ==========================================================
  */

  const processedVehicles =
    useMemo(() => {

      let result =
        [...vehicles];


      /*
      --------------------------------------------------------
      SEARCH
      --------------------------------------------------------
      */

      if (
        searchTerm.trim()
      ) {

        const term =
          searchTerm
            .toLowerCase()
            .trim();


        result =
          result.filter(
            (vehicle) => {

              const searchableFields = [

                vehicle.name,

                vehicle.plate,

                vehicle.brand,

                vehicle.model,

                vehicle.color,

                vehicle.vin

              ];


              return searchableFields.some(
                (field) =>

                  String(
                    field || ""
                  )
                    .toLowerCase()
                    .includes(term)

              );

            }
          );

      }


      /*
      --------------------------------------------------------
      TYPE FILTER
      --------------------------------------------------------
      */

      if (typeFilter) {

        result =
          result.filter(
            (vehicle) =>

              vehicle.type ===
              typeFilter.value

          );

      }


      /*
      --------------------------------------------------------
      STATUS FILTER
      --------------------------------------------------------
      */

      if (statusFilter) {

        result =
          result.filter(
            (vehicle) => {

              const vehicleStatus =
                vehicle.status ||

                (
                  vehicle.isActive
                    ? "active"
                    : "inactive"
                );


              return (
                vehicleStatus ===
                statusFilter.value
              );

            }
          );

      }


      /*
      --------------------------------------------------------
      SORT
      --------------------------------------------------------
      */

      result.sort(
        (a, b) => {

          let aValue =
            a[
              sortConfig.key
            ];


          let bValue =
            b[
              sortConfig.key
            ];


          if (
            aValue === undefined ||
            aValue === null
          ) {

            aValue = "";

          }


          if (
            bValue === undefined ||
            bValue === null
          ) {

            bValue = "";

          }


          if (
            typeof aValue ===
            "string"
          ) {

            aValue =
              aValue.toLowerCase();


            bValue =
              String(
                bValue
              ).toLowerCase();

          }


          if (
            typeof aValue ===
            "boolean"
          ) {

            aValue =
              aValue ? 1 : 0;


            bValue =
              bValue ? 1 : 0;

          }


          if (
            aValue < bValue
          ) {

            return (
              sortConfig.direction ===
              "asc"
                ? -1
                : 1
            );

          }


          if (
            aValue > bValue
          ) {

            return (
              sortConfig.direction ===
              "asc"
                ? 1
                : -1
            );

          }


          return 0;

        }
      );


      return result;

    }, [

      vehicles,

      searchTerm,

      typeFilter,

      statusFilter,

      sortConfig

    ]);


  /*
  ==========================================================
  MODAL
  ==========================================================
  */

  const openCreateModal = () => {

    setSelectedVehicle(
      null
    );


    setShowModal(
      true
    );

  };


  const openEditModal = (
    vehicle
  ) => {

    setSelectedVehicle(
      vehicle
    );


    setShowModal(
      true
    );

  };


  const closeModal = () => {

    setSelectedVehicle(
      null
    );


    setShowModal(
      false
    );

  };


  /*
  ==========================================================
  SAVE VEHICLE
  ==========================================================
  */

  const handleSave = async (
    vehicleData
  ) => {

    try {

      if (
        selectedVehicle
      ) {

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

      }

      else {

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

    }

    catch (error) {

      console.error(
        "Error saving vehicle:",
        error
      );


      notifyError(

        error?.message ||

        "Ocurrió un error inesperado."

      );

    }

  };


  /*
  ==========================================================
  TOGGLE STATUS
  ==========================================================
  */

  const handleToggle = async (
    vehicle
  ) => {

    const currentStatus =

      vehicle.status ||

      (
        vehicle.isActive
          ? "active"
          : "inactive"
      );


    const action =
      currentStatus === "active"
        ? "desactivar"
        : "activar";


    const confirmed =
      await notifyConfirm(

        `¿Deseas ${action} este vehículo?`

      );


    if (!confirmed) {

      return;

    }


    try {

      await toggleVehicleStatus(

        companyId,

        vehicle.id,

        currentStatus

      );


      notifySuccess(

        "Estado actualizado",

        `El vehículo fue ${
          action === "activar"
            ? "activado"
            : "desactivado"
        } correctamente.`

      );


      await fetchVehicles();

    }

    catch (error) {

      console.error(
        "Error updating vehicle status:",
        error
      );


      notifyError(

        error?.message ||

        "No fue posible actualizar el estado."

      );

    }

  };


  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {

    return <Loading />;

  }


  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div
      className="catalog-container"
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <CatalogHeader

        title="Vehículos"

        description={
          "Administra la flotilla de vehículos de la empresa."
        }

      >

        <CatalogToolbar>

          <CatalogSearch

            value={
              searchTerm
            }

            onChange={
              setSearchTerm
            }

            placeholder="Buscar vehículo..."

          />


          <Select

            className="catalog-filter"

            value={
              typeFilter
            }

            onChange={
              setTypeFilter
            }

            options={
              VEHICLE_TYPES
            }

            isClearable

            placeholder="Tipo"

          />


          <Select

            className="catalog-filter"

            value={
              statusFilter
            }

            onChange={
              setStatusFilter
            }

            options={
              VEHICLE_STATUS
            }

            isClearable

            placeholder="Estado"

          />


          <button

            type="button"

            className="btn-primary"

            onClick={
              openCreateModal
            }

          >

            + Agregar vehículo

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          FORM
      ================================================== */}

      {
        showModal && (

          <VehicleForm

            vehicle={
              selectedVehicle
            }

            onClose={
              closeModal
            }

            onSave={
              handleSave
            }

          />

        )
      }


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="catalog-content"
      >

        {
          processedVehicles.length === 0

            ? (

              <CatalogEmpty

                message={
                  "No hay vehículos registrados todavía."
                }

              />

            )

            : (

              <DataTable

                data={
                  processedVehicles
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


                renderRow={(
                  vehicle
                ) => {

                  const vehicleType =

                    VEHICLE_TYPES.find(

                      item =>
                        item.value ===
                        vehicle.type

                    )?.label ||

                    "-";


                  const vehicleStatus =

                    VEHICLE_STATUS.find(

                      item =>
                        item.value ===
                        (
                          vehicle.status ||

                          (
                            vehicle.isActive
                              ? "active"
                              : "inactive"
                          )
                        )

                    )?.label ||

                    "-";


                  const currentStatus =

                    vehicle.status ||

                    (
                      vehicle.isActive
                        ? "active"
                        : "inactive"
                    );


                  return (

                    <>

                      <td>

                        <strong>

                          {
                            vehicle.name ||
                            "-"
                          }

                        </strong>

                      </td>


                      <td>

                        {
                          vehicle.plate ||
                          "-"
                        }

                      </td>


                      <td>

                        {
                          vehicleType
                        }

                      </td>


                      <td>

                        {
                          vehicle.brand ||
                          "-"
                        }

                      </td>


                      <td>

                        {
                          vehicle.passengers ||
                          "-"
                        }

                      </td>


                      <td>

                        <CatalogStatusBadge

                          value={
                            currentStatus
                          }

                          options={
                            VEHICLE_STATUS
                          }

                        />

                      </td>


                      <td>

                        <CatalogActions>

                          <button

                            type="button"

                            className="catalog-action"

                            onClick={() =>
                              openEditModal(
                                vehicle
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
                                vehicle
                              )
                            }

                          >

                            {
                              currentStatus ===
                              "active"

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

    </div>

  );

};


export default VehiclesSection;