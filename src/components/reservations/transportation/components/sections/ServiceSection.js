import React from "react";
import Select from "react-select";

import {
  statusOptions,
  selectPortal
} from "../../constants/transportationConstants";


export default function ServiceSection({ controller }) {

  const {
    form,
    settings,
    options,
    actions
  } = controller;


  const {
    data,
    setData
  } = form;


  const {
    routes,
    vehicles,
    drivers
  } = settings;


  const {
    serviceTypeOptions,
    locationOptions,
    driverOptions,
    routeOptions,
    vehicleOptions
  } = options;


  const {
    handleChange
  } = actions;


  /*
  =========================================================
  REACT SELECT STYLES
  =========================================================
  */

  const selectStyles = {

    ...selectPortal.styles,


    option: (base, state) => ({
      ...base,

      backgroundColor:
        state.isSelected
          ? "#08204B"
          : state.isFocused
            ? "#08204B"
            : "#FFFFFF",

      color:
        state.isSelected || state.isFocused
          ? "#FFFFFF"
          : "#334155",

      cursor: "pointer"
    }),


    control: (base, state) => ({
      ...base,

      borderColor:
        state.isFocused
          ? "#08204B"
          : "#d1d9e3",

      boxShadow:
        state.isFocused
          ? "0 0 0 3px rgba(8, 32, 75, 0.07)"
          : "none",

      "&:hover": {
        borderColor: "#08204B"
      }
    }),


    singleValue: (base) => ({
      ...base,

      color: "#334155"
    }),


    placeholder: (base) => ({
      ...base,

      color: "#94a3b8"
    }),


    dropdownIndicator: (base, state) => ({
      ...base,

      color:
        state.isFocused
          ? "#08204B"
          : "#94a3b8",

      "&:hover": {
        color: "#08204B"
      }
    }),


    clearIndicator: (base) => ({
      ...base,

      color: "#94a3b8",

      "&:hover": {
        color: "#08204B"
      }
    }),


    menuPortal: (base) => ({
      ...base,

      zIndex: 99999
    })

  };


  /*
  =========================================================
  VEHICLE OPTIONS
  =========================================================

  Extends the existing vehicle options with the vehicle
  information needed by the custom vehicle selector.
  =========================================================
  */

  const vehicleSelectOptions =
    vehicleOptions.map(option => {

      const vehicle =
        vehicles.find(
          item =>
            item.id === option.value
        );


      return {

        ...option,

        vehicleName:
          vehicle?.name ||
          option.label ||
          "",

        vehiclePlate:
          vehicle?.plate ||
          ""

      };

    });


  /*
  =========================================================
  VEHICLE OPTION LABEL
  =========================================================

  Displays the vehicle name and plate separately.

  The same formatter is used for:
  - Selected vehicle
  - Dropdown options
  =========================================================
  */

  const formatVehicleOption = (
    option,
    { context }
  ) => {

    const vehicleName =
      option.vehicleName ||
      option.label ||
      "";


    const vehiclePlate =
      option.vehiclePlate ||
      "";


    /*
    ---------------------------------------------------------
    SELECTED VEHICLE
    ---------------------------------------------------------
    */

    if (context === "value") {

      return (

        <div className="transportation-service-section-vehicle-value">

          <span className="transportation-service-section-vehicle-name">
            {vehicleName}
          </span>


          {vehiclePlate && (

            <span className="transportation-service-section-vehicle-plate">
              {vehiclePlate}
            </span>

          )}

        </div>

      );

    }


    /*
    ---------------------------------------------------------
    DROPDOWN OPTION
    ---------------------------------------------------------
    */

    return (

      <div className="transportation-service-section-vehicle-option">

        <div className="transportation-service-section-vehicle-option-main">

          <span className="transportation-service-section-vehicle-option-name">
            {vehicleName}
          </span>


          {vehiclePlate && (

            <span className="transportation-service-section-vehicle-option-plate">
              {vehiclePlate}
            </span>

          )}

        </div>

      </div>

    );

  };


  /*
  =========================================================
  DRIVER SELECTION
  =========================================================

  Selecting a driver automatically loads the vehicle
  assigned to that driver.

  The vehicle can still be manually changed afterward
  for this specific reservation.
  =========================================================
  */

  const handleDriverChange = (
    selectedOption
  ) => {

    const driverId =
      selectedOption?.value || "";


    const selectedDriver =
      drivers.find(
        driver =>
          driver.id === driverId
      );


    /*
    ---------------------------------------------------------
    NO DRIVER SELECTED
    ---------------------------------------------------------

    Clear driver information.

    The vehicle is intentionally preserved because the
    reservation may have a manually selected vehicle.
    ---------------------------------------------------------
    */

    if (!selectedDriver) {

      setData(prev => ({

        ...prev,

        driverId: "",

        driverName: "",

        driverType: ""

      }));

      return;

    }


    /*
    ---------------------------------------------------------
    FIND DRIVER'S DEFAULT VEHICLE
    ---------------------------------------------------------
    */

    const assignedVehicleId =
      selectedDriver.vehicleId || "";


    const assignedVehicle =
      vehicles.find(
        vehicle =>
          vehicle.id === assignedVehicleId
      );


    /*
    ---------------------------------------------------------
    UPDATE DRIVER + AUTOMATIC VEHICLE
    ---------------------------------------------------------
    */

    setData(prev => ({

      ...prev,

      driverId:
        selectedDriver.id || "",

      driverName:
        selectedDriver.name || "",

      driverType:
        selectedDriver.driverType || "",


      vehicleId:
        assignedVehicle?.id || "",

      vehicleName:
        assignedVehicle?.name || "",

      vehiclePlate:
        assignedVehicle?.plate || "",

      vehicleType:
        assignedVehicle?.type || ""

    }));

  };


  /*
  =========================================================
  VEHICLE SELECTION
  =========================================================

  Allows the user to override the driver's default vehicle
  for this specific reservation.
  =========================================================
  */

  const handleVehicleChange = (
    selectedOption
  ) => {

    const selectedVehicle =
      vehicles.find(
        vehicle =>
          vehicle.id ===
          selectedOption?.value
      );


    setData(prev => ({

      ...prev,

      vehicleId:
        selectedVehicle?.id || "",

      vehicleName:
        selectedVehicle?.name || "",

      vehiclePlate:
        selectedVehicle?.plate || "",

      vehicleType:
        selectedVehicle?.type || ""

    }));

  };


  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (

    <div className="transportation-service-section section-card">

      <div className="transportation-service-section-header">

        <h4 className="transportation-service-section-title">
          Servicio
        </h4>

      </div>


      {/* ==================================================
          TIPO DE RESERVA - ESTADO
      ================================================== */}

      <div className="transportation-service-section-grid transportation-service-section-grid-two-columns">


        {/* TIPO DE RESERVA */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Tipo de reserva{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-select"

            name="serviceTypeId"

            options={serviceTypeOptions}

            value={

              serviceTypeOptions.find(

                option =>

                  option.value ===
                  data.serviceTypeId

              ) || null

            }

            onChange={(selectedOption) =>

              handleChange({

                target: {

                  name:
                    "serviceTypeId",

                  value:
                    selectedOption?.value || ""

                }

              })

            }

            placeholder="Seleccionar tipo"

            isClearable

            isSearchable

          />

        </div>


        {/* ESTADO */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Estado{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-select"

            options={statusOptions}

            value={

              statusOptions.find(

                option =>

                  option.value ===
                  data.status

              ) || null

            }

            onChange={(selectedOption) => {

              setData(prev => ({

                ...prev,

                status:
                  selectedOption?.value || ""

              }));

            }}

            isSearchable={false}

            isClearable

          />

        </div>


        {/* ==================================================
            CÓDIGO DE RUTA
        ================================================== */}

        {/*
        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">
            Código de ruta
          </label>

          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-select"

            options={routeOptions}

            value={

              routeOptions.find(

                option =>

                  option.value ===
                  data.routeId

              ) || null

            }

            onChange={(selectedOption) => {

              const selectedRoute =
                routes.find(

                  route =>

                    route.id ===
                    selectedOption?.value

                );


              setData(prev => ({

                ...prev,

                routeId:
                  selectedRoute?.id || "",

                routeCode:
                  selectedRoute?.code || "",

                routeName:
                  selectedRoute?.name || ""

              }));

            }}

            placeholder="Seleccionar ruta"

            isClearable

            isSearchable

          />

        </div>
        */}

      </div>


      {/* ==================================================
          FECHA Y PASAJEROS
      ================================================== */}

      <div className="transportation-service-section-grid transportation-service-section-grid-two-columns">


        {/* FECHA */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Fecha y hora{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <input

            className="transportation-service-section-input"

            type="datetime-local"

            name="date"

            value={
              data.date || ""
            }

            onChange={
              handleChange
            }

          />

        </div>


        {/* PASAJEROS */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Cantidad de pasajeros{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <input

            className="transportation-service-section-input"

            type="number"

            name="passengers"

            value={
              data.passengers ?? 1
            }

            onChange={
              handleChange
            }

          />

        </div>


      </div>


      {/* ==================================================
          LUGAR DE RECOGIDA Y DESTINO
      ================================================== */}

      <div className="transportation-service-section-grid transportation-service-section-grid-two-columns">


        {/* RECOGIDA */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Lugar de recogida{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-select"

            options={locationOptions}

            value={

              locationOptions.find(

                option =>

                  option.value ===
                  data.locationFromId

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                locationFromId:
                  selectedOption?.value || ""

              }))

            }

            isClearable

            isSearchable

          />

        </div>


        {/* DESTINO */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Lugar de destino{" "}

            <span className="transportation-service-section-required">
              *
            </span>

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-select"

            options={locationOptions}

            value={

              locationOptions.find(

                option =>

                  option.value ===
                  data.locationToId

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                locationToId:
                  selectedOption?.value || ""

              }))

            }

            isClearable

            isSearchable

          />

        </div>

      </div>


      {/* ==================================================
          VEHÍCULO Y CHOFER
      ================================================== */}

      <div className="transportation-service-section-grid transportation-service-section-grid-two-columns">


        {/* ==================================================
            CHOFER
        ================================================== */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Chofer asignado

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-driver-select"

            options={driverOptions}

            value={

              driverOptions.find(

                option =>

                  option.value ===
                  data.driverId

              ) || null

            }

            onChange={
              handleDriverChange
            }

            placeholder="Seleccionar chofer"

            isClearable

            isSearchable

          />

        </div>


        {/* ==================================================
            VEHÍCULO
        ================================================== */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Vehículo

          </label>


          <Select

            {...selectPortal}

            styles={selectStyles}

            className="transportation-service-section-select"

            classNamePrefix="transportation-service-section-vehicle-select"

            options={vehicleSelectOptions}

            value={

              vehicleSelectOptions.find(

                option =>

                  option.value ===
                  data.vehicleId

              ) || null

            }

            formatOptionLabel={
              formatVehicleOption
            }

            onChange={
              handleVehicleChange
            }

            placeholder="Seleccionar vehículo"

            isClearable

            isSearchable

          />

        </div>

      </div>


      {/* ==================================================
          VUELO
      ================================================== */}

      <div className="transportation-service-section-grid transportation-service-section-grid-two-columns">


        {/* VUELO */}

        <div className="transportation-service-section-field">

          <label className="transportation-service-section-label">

            Nº de vuelo

          </label>


          <input

            className="transportation-service-section-input"

            type="text"

            name="flightNumber"

            placeholder="Ej: AA1337"

            value={
              data.flightNumber || ""
            }

            onChange={
              handleChange
            }

          />

        </div>


      </div>


    </div>

  );

}