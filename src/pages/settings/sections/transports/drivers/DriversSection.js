/*
==========================================================
DRIVERS SECTION
==========================================================
*/

import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

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
  getDrivers,
  createDriver,
  updateDriver,
  toggleDriverStatus
} from "../../../../../services/settings/transportation/driversService";

import {
  getVehicles
} from "../../../../../services/settings/transportation/vehiclesService";

import {
  DRIVER_TYPES
} from "../../../../../constants/transportation/driverTypes";

import CatalogHeader
  from "../../../components/CatalogHeader";

import CatalogToolbar
  from "../../../components/CatalogToolbar";

import CatalogSearch
  from "../../../components/CatalogSearch";

import CatalogEmpty
  from "../../../components/CatalogEmpty";

import CatalogStatusBadge
  from "../../../components/CatalogStatusBadge";

import CatalogActions
  from "../../../components/CatalogActions";

import DriverForm
  from "./DriverForm";

import DataTable
  from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


/*
==========================================================
COMPONENT
==========================================================
*/

const DriversSection = () => {


  /*
  ==========================================================
  AUTHENTICATION
  ==========================================================
  */

  const {
    session,
    loading: authLoading
  } = useAuth();


  /*
  ==========================================================
  USER UID
  ==========================================================
  */

  /*
    AuthContext actualmente guarda:

      session = {
        auth: {
          uid,
          ...
        },
        user,
        company
      }

    Por seguridad soportamos también las otras
    estructuras que podrían existir en sesiones
    anteriores.
  */

  const userUid =
    session?.auth?.uid ||
    session?.user?.uid ||
    session?.uid ||
    null;


  /*
  ==========================================================
  USER OBJECT
  ==========================================================
  */

  /*
    driversService espera:

      user.uid

    Por eso construimos explícitamente el objeto
    solamente cuando tenemos un UID válido.
  */

  const user =
    userUid
      ? {
          uid: userUid
        }
      : null;


  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  const company =
    session?.company || null;


  const companyId =
    company?.id || null;


  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [
    drivers,
    setDrivers
  ] = useState([]);


  const [
    vehicles,
    setVehicles
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    selectedDriver,
    setSelectedDriver
  ] = useState(null);


  /*
    MUY IMPORTANTE:

    El modal comienza cerrado.

    No debe abrirse automáticamente cuando
    se carga la página.
  */

  const [
    showModal,
    setShowModal
  ] = useState(false);


  /*
  ==========================================================
  FETCH DATA
  ==========================================================
  */

  const fetchData = useCallback(
    async () => {

      /*
      ------------------------------------------------------
      WAIT FOR AUTHENTICATION
      ------------------------------------------------------
      */

      if (authLoading) {

        return;

      }


      /*
      ------------------------------------------------------
      COMPANY VALIDATION
      ------------------------------------------------------
      */

      if (!companyId) {

        setDrivers([]);

        setVehicles([]);

        setLoading(false);

        return;

      }


      try {

        setLoading(true);


        /*
        ----------------------------------------------------
        LOAD DRIVERS + VEHICLES
        ----------------------------------------------------

        Ambas colecciones pertenecen a la misma empresa:

          companies/{companyId}/drivers
          companies/{companyId}/vehicles

        Se cargan simultáneamente.
        */

        const [
          driversData,
          vehiclesData
        ] = await Promise.all([

          getDrivers(
            companyId
          ),

          getVehicles(
            companyId
          )

        ]);


        /*
        ----------------------------------------------------
        DRIVERS
        ----------------------------------------------------
        */

        setDrivers(

          Array.isArray(
            driversData
          )
            ? driversData
            : []

        );


        /*
        ----------------------------------------------------
        VEHICLES
        ----------------------------------------------------
        */

        setVehicles(

          Array.isArray(
            vehiclesData
          )
            ? vehiclesData
            : []

        );

      }

      catch (error) {

        console.error(
          "Error loading drivers and vehicles:",
          error
        );


        notifyError(

          "Error",

          error?.message ||
          "No fue posible cargar los conductores y vehículos."

        );

      }

      finally {

        setLoading(false);

      }

    },

    [
      companyId,
      authLoading
    ]

  );


  /*
  ==========================================================
  LOAD DATA
  ==========================================================
  */

  useEffect(() => {

    fetchData();

  }, [
    fetchData
  ]);


  /*
  ==========================================================
  VEHICLE MAP
  ==========================================================
  */

  /*
    Convertimos los vehículos a un Map:

      vehicle.id -> vehicle

    Esto permite resolver rápidamente:

      driver.vehicleId

    contra:

      vehicle.id
  */

  const vehicleMap =
    useMemo(() => {

      const map = new Map();


      if (
        !Array.isArray(
          vehicles
        )
      ) {

        return map;

      }


      vehicles.forEach(
        (vehicle) => {

          if (
            vehicle?.id
          ) {

            map.set(
              vehicle.id,
              vehicle
            );

          }

        }
      );


      return map;

    }, [
      vehicles
    ]);


  /*
  ==========================================================
  FILTERED DRIVERS
  ==========================================================
  */

  const filteredDrivers =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      /*
      ------------------------------------------------------
      NO SEARCH
      ------------------------------------------------------
      */

      if (!search) {

        return drivers;

      }


      /*
      ------------------------------------------------------
      FILTER
      ------------------------------------------------------
      */

      return drivers.filter(
        (driver) => {

          /*
          --------------------------------------------------
          DRIVER TYPE
          --------------------------------------------------
          */

          const driverType =
            DRIVER_TYPES.find(

              (type) =>

                type.value ===
                driver.driverType

            );


          /*
          --------------------------------------------------
          ASSIGNED VEHICLE
          --------------------------------------------------
          */

          const assignedVehicle =
            driver?.vehicleId
              ? vehicleMap.get(
                  driver.vehicleId
                )
              : null;


          /*
          --------------------------------------------------
          VEHICLE DATA
          --------------------------------------------------
          */

          const vehicleName =
            assignedVehicle?.name
              ?.toLowerCase() ||
            "";


          const vehiclePlate =
            assignedVehicle?.plate
              ?.toLowerCase() ||
            "";


          /*
          --------------------------------------------------
          SEARCH
          --------------------------------------------------
          */

          return (

            driver?.name
              ?.toLowerCase()
              .includes(search)

            ||

            driver?.phone
              ?.toLowerCase()
              .includes(search)

            ||

            driver?.email
              ?.toLowerCase()
              .includes(search)

            ||

            driverType?.label
              ?.toLowerCase()
              .includes(search)

            ||

            vehicleName
              .includes(search)

            ||

            vehiclePlate
              .includes(search)

          );

        }

      );

    }, [

      drivers,
      searchTerm,
      vehicleMap

    ]);


  /*
  ==========================================================
  OPEN CREATE MODAL
  ==========================================================
  */

  const openCreateModal =
    () => {

      /*
      ------------------------------------------------------
      RESET SELECTED DRIVER
      ------------------------------------------------------
      */

      setSelectedDriver(
        null
      );


      /*
      ------------------------------------------------------
      OPEN
      ------------------------------------------------------
      */

      setShowModal(
        true
      );

    };


  /*
  ==========================================================
  OPEN EDIT MODAL
  ==========================================================
  */

  const openEditModal =
    (driver) => {

      if (!driver) {

        return;

      }


      /*
      ------------------------------------------------------
      SET DRIVER
      ------------------------------------------------------
      */

      setSelectedDriver(
        driver
      );


      /*
      ------------------------------------------------------
      OPEN
      ------------------------------------------------------
      */

      setShowModal(
        true
      );

    };


  /*
  ==========================================================
  CLOSE MODAL
  ==========================================================
  */

  const closeModal =
    () => {

      /*
      ------------------------------------------------------
      CLOSE FIRST
      ------------------------------------------------------
      */

      setShowModal(
        false
      );


      /*
      ------------------------------------------------------
      CLEAR DRIVER
      ------------------------------------------------------
      */

      setSelectedDriver(
        null
      );

    };


  /*
  ==========================================================
  SAVE DRIVER
  ==========================================================
  */

  const handleSave =
    async (
      formData
    ) => {

      /*
      ------------------------------------------------------
      AUTHENTICATION
      ------------------------------------------------------
      */

      if (authLoading) {

        notifyError(

          "Error",

          "La sesión todavía se está cargando. Inténtalo nuevamente."

        );

        return;

      }


      /*
      ------------------------------------------------------
      COMPANY VALIDATION
      ------------------------------------------------------
      */

      if (!companyId) {

        console.error(
          "DriversSection: companyId is missing.",
          session
        );


        notifyError(

          "Error",

          "No se pudo identificar la empresa actual."

        );

        return;

      }


      /*
      ------------------------------------------------------
      USER VALIDATION
      ------------------------------------------------------
      */

      if (!userUid) {

        console.error(
          "DriversSection: user UID is missing.",
          session
        );


        notifyError(

          "Error",

          "No se pudo identificar al usuario actual. Inicia sesión nuevamente."

        );

        return;

      }


      try {

        /*
        ====================================================
        NORMALIZE FORM DATA
        ====================================================

        Dejamos que driversService haga la normalización
        definitiva de vehicleId.

        Aquí solamente garantizamos que siempre exista
        un objeto.
        */

        const safeFormData =
          formData || {};


        /*
        ====================================================
        UPDATE DRIVER
        ====================================================
        */

        if (
          selectedDriver
        ) {

          await updateDriver(

            companyId,

            selectedDriver.id,

            safeFormData,

            user

          );


          notifySuccess(

            "Conductor actualizado",

            "Los cambios fueron guardados correctamente."

          );

        }


        /*
        ====================================================
        CREATE DRIVER
        ====================================================
        */

        else {

          await createDriver(

            companyId,

            safeFormData,

            user

          );


          notifySuccess(

            "Conductor creado",

            "El conductor fue creado correctamente."

          );

        }


        /*
        ====================================================
        CLOSE MODAL
        ====================================================

        Solamente cerramos después de que Firestore
        confirmó correctamente la operación.
        */

        closeModal();


        /*
        ====================================================
        RELOAD DATA
        ====================================================

        Esto actualiza tanto:

          - conductores
          - vehículos

        y por lo tanto también la relación
        conductor -> vehículo.
        */

        await fetchData();

      }

      catch (error) {

        console.error(
          "Error saving driver:",
          error
        );


        notifyError(

          "Error",

          error?.message ||
          "Ocurrió un error inesperado."

        );

      }

    };


  /*
  ==========================================================
  TOGGLE DRIVER STATUS
  ==========================================================
  */

  const handleToggleStatus =
    async (
      driver
    ) => {

      if (!driver) {

        return;

      }


      /*
      ------------------------------------------------------
      ACTION
      ------------------------------------------------------
      */

      const action =
        driver.isActive
          ? "desactivar"
          : "activar";


      /*
      ------------------------------------------------------
      CONFIRM
      ------------------------------------------------------
      */

      const confirmed =
        await notifyConfirm(

          `¿Deseas ${action} este conductor?`

        );


      if (!confirmed) {

        return;

      }


      /*
      ------------------------------------------------------
      COMPANY
      ------------------------------------------------------
      */

      if (!companyId) {

        notifyError(

          "Error",

          "No se pudo identificar la empresa actual."

        );

        return;

      }


      try {

        await toggleDriverStatus(

          companyId,

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


        /*
        ----------------------------------------------------
        RELOAD
        ----------------------------------------------------
        */

        await fetchData();

      }

      catch (error) {

        console.error(
          "Error updating driver status:",
          error
        );


        notifyError(

          "Error",

          error?.message ||
          "No fue posible actualizar el estado."

        );

      }

    };


  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

  const columns = [

    {
      key: "name",

      label: "Nombre",

      sortable: true,

      minWidth: "220px",

      maxWidth: "260px"

    },


    {
      key: "phone",

      label: "Teléfono",

      minWidth: "150px",

      maxWidth: "170px"

    },


    {
      key: "email",

      label: "Email",

      minWidth: "220px",

      maxWidth: "260px"

    },


    {
      key: "driverType",

      label: "Tipo",

      width: "150px",

      align: "center"

    },


    {
      key: "vehicle",

      label: "Vehículo",

      width: "220px",

      align: "center"

    },


    {
      key: "availability",

      label: "Disponible",

      width: "140px",

      align: "center"

    },


    {
      key: "status",

      label: "Estado",

      width: "130px",

      align: "center"

    },


    {
      key: "actions",

      label: "Acciones",

      width: "220px",

      align: "center"

    }

  ];


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

        title="Conductores"

        description="Administra los conductores disponibles para los servicios de transporte."

      >

        <CatalogToolbar>

          <CatalogSearch

            value={
              searchTerm
            }

            onChange={
              setSearchTerm
            }

            placeholder="Buscar conductor..."

          />


          <button

            type="button"

            className="btn-primary"

            onClick={
              openCreateModal
            }

          >

            <Plus
              size={18}
            />

            Agregar conductor

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div
        className="catalog-content"
      >

        {/* =================================================
            EMPTY
        ================================================= */}

        {

          !loading &&

          filteredDrivers.length === 0 && (

            <CatalogEmpty

              message={
                searchTerm
                  ? "No se encontraron conductores."
                  : "Todavía no hay conductores registrados."
              }

            />

          )

        }


        {/* =================================================
            TABLE
        ================================================= */}

        {

          filteredDrivers.length > 0 && (

            <DataTable

              columns={
                columns
              }

              data={
                filteredDrivers
              }

              renderRow={
                (driver) => {

                  /*
                  ==========================================
                  DRIVER TYPE
                  ==========================================
                  */

                  const driverType =
                    DRIVER_TYPES.find(

                      (type) =>

                        type.value ===
                        driver.driverType

                    );


                  /*
                  ==========================================
                  ASSIGNED VEHICLE
                  ==========================================
                  */

                  const assignedVehicle =
                    driver?.vehicleId
                      ? vehicleMap.get(
                          driver.vehicleId
                        )
                      : null;


                  return (

                    <>

                      {/* ==================================
                          NAME
                      ================================== */}

                      <td>

                        <strong>

                          {
                            driver.name ||
                            "-"
                          }

                        </strong>

                      </td>


                      {/* ==================================
                          PHONE
                      ================================== */}

                      <td>

                        {
                          driver.phone ||
                          "-"
                        }

                      </td>


                      {/* ==================================
                          EMAIL
                      ================================== */}

                      <td>

                        {
                          driver.email ||
                          "-"
                        }

                      </td>


                      {/* ==================================
                          DRIVER TYPE
                      ================================== */}

                      <td
                        style={{
                          textAlign:
                            "center"
                        }}
                      >

                        {
                          driverType?.label ||
                          "-"
                        }

                      </td>


                      {/* ==================================
                          VEHICLE
                      ================================== */}

                      <td
                        style={{
                          textAlign:
                            "center"
                        }}
                      >

                        {

                          assignedVehicle ? (

                            <div
                              style={{

                                display:
                                  "flex",

                                flexDirection:
                                  "column",

                                alignItems:
                                  "center",

                                gap:
                                  "2px"

                              }}
                            >

                              <strong>

                                {
                                  assignedVehicle.name ||
                                  "Vehículo"
                                }

                              </strong>


                              {

                                assignedVehicle.plate && (

                                  <span
                                    style={{

                                      fontSize:
                                        "0.8rem",

                                      color:
                                        "#6b7280"

                                    }}
                                  >

                                    {
                                      assignedVehicle.plate
                                    }

                                  </span>

                                )

                              }

                            </div>

                          ) : (

                            <span
                              style={{

                                color:
                                  "#9ca3af"

                              }}
                            >

                              Sin asignar

                            </span>

                          )

                        }

                      </td>


                      {/* ==================================
                          AVAILABLE
                      ================================== */}

                      <td
                        style={{
                          textAlign:
                            "center"
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
                              value:
                                "available",

                              label:
                                "Disponible"

                            },

                            {
                              value:
                                "unavailable",

                              label:
                                "No disponible"

                            }

                          ]}

                        />

                      </td>


                      {/* ==================================
                          STATUS
                      ================================== */}

                      <td
                        style={{
                          textAlign:
                            "center"
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
                              value:
                                "active",

                              label:
                                "Activo"

                            },

                            {
                              value:
                                "inactive",

                              label:
                                "Inactivo"

                            }

                          ]}

                        />

                      </td>


                      {/* ==================================
                          ACTIONS
                      ================================== */}

                      <td
                        style={{
                          textAlign:
                            "center"
                        }}
                      >

                        <CatalogActions>

                          <button

                            type="button"

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

                            type="button"

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

                }

              }

            />

          )

        }

      </div>


      {/* ==================================================
          DRIVER FORM
      ==================================================

          IMPORTANTE:

          El componente NO se monta mientras showModal
          sea false.

          Esto evita que DriverForm ejecute efectos,
          cargue datos o abra estados internos antes
          de que el administrador pulse "Agregar
          conductor" o "Editar".
      ================================================== */}

      {

        showModal && (

          <DriverForm

            driver={
              selectedDriver
            }

            vehicles={
              vehicles
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

    </div>

  );

};


export default DriversSection;