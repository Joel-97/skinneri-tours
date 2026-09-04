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

    vehicles

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
  PENDING RESERVATION
  =========================================================
  */

  const isPending =

    data.status === "pending";


  return (

    <div className="modal-section section-card">

      <h4 className="section-title">

        Servicio

      </h4>


      {/* =========================
          TIPO DE RESERVA - CODIGO DE RUTA
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

            Tipo de reserva <span className="required">*</span>

          </label>

          <Select

            {...selectPortal}

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


        <div className="form-field">

          <label className="field-label">

            Código de ruta

          </label>

          <Select

            {...selectPortal}

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

      </div>


      {/* =========================
          FECHA Y ESTADO
      ========================= */}

      <div className="form-grid two-columns">


        <div className="form-field">

          <label className="field-label">

            Fecha y hora <span className="required">*</span>

          </label>

          <input

            type="datetime-local"

            name="date"

            value={data.date || ""}

            onChange={handleChange}

          />

        </div>


        <div className="form-field">

          <label className="field-label">

            Estado <span className="required">*</span>

          </label>

          <Select

            {...selectPortal}

            options={statusOptions}

            value={

              statusOptions.find(

                option =>

                  option.value ===

                  data.status

              ) || null

            }

            onChange={(selectedOption) => {

              /*
              ------------------------------------------------
              PENDING RESERVATIONS CANNOT CHANGE STATUS
              HERE.

              Confirmation is handled separately through
              the "Confirmar reserva" action.
              ------------------------------------------------
              */

              if (isPending) {

                return;

              }


              setData(prev => ({

                ...prev,

                status:

                  selectedOption?.value || ""

              }));

            }}

            isSearchable={false}

            isDisabled={isPending}

          />

        </div>

      </div>


      {/* =========================
          LUGAR DE RECOGIDA Y DESTINO
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

            Lugar de recogida <span className="required">*</span>

          </label>

          <Select

            {...selectPortal}

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


        <div className="form-field">

          <label className="field-label">

            Lugar de destino <span className="required">*</span>

          </label>

          <Select

            {...selectPortal}

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


      {/* =========================
          CANTIDAD DE PAX Y NUMERO DE VUELO
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

            Cantidad de pasajeros <span className="required">*</span>

          </label>

          <input

            type="number"

            name="passengers"

            value={data.passengers ?? 1}

            onChange={handleChange}

          />

        </div>


        <div className="form-field">

          <label className="field-label">

            Nº de vuelo

          </label>

          <input

            type="text"

            name="flightNumber"

            placeholder="Ej: AA1337"

            value={data.flightNumber || ""}

            onChange={handleChange}

          />

        </div>

      </div>


      {/* =========================
          VEHICULO Y CHOFER
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

            Vehículo

          </label>

          <Select

            {...selectPortal}

            options={vehicleOptions}

            value={

              vehicleOptions.find(

                option =>

                  option.value ===

                  data.vehicleId

              ) || null

            }

            onChange={(selectedOption) => {

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

            }}

            placeholder="Seleccionar vehículo"

            isClearable

            isSearchable

          />

        </div>


        <div className="form-field">

          <label className="field-label">

            Chofer asignado

          </label>

          <Select

            {...selectPortal}

            options={driverOptions}

            value={

              driverOptions.find(

                option =>

                  option.value ===

                  data.driverId

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                driverId:

                  selectedOption?.value || ""

              }))

            }

            isClearable

          />

        </div>

      </div>

    </div>

  );

}