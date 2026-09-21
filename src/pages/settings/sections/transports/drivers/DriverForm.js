/*
==========================================================
DRIVER FORM
==========================================================
*/

import {
  useEffect,
  useMemo,
  useState
} from "react";


import {
  Timestamp
} from "firebase/firestore";


import Select from "react-select";


import Modal
  from "../../../../../components/general/modal";


import {
  DRIVER_LICENSE_TYPES
} from "../../../../../constants/transportation/driverLicenseTypes";


import {
  DRIVER_TYPES
} from "../../../../../constants/transportation/driverTypes";


import "../../../../../style/settings/transportation/catalog/catalogForm.css";


/* ======================================================
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {

  name: "",

  phone: "",

  email: "",

  licenses: [],

  driverType: null,

  vehicleId: "",

  isAvailable: true,

  isActive: true

};


/* ======================================================
   VEHICLE LABEL
====================================================== */

const getVehicleLabel = (
  vehicle
) => {

  if (!vehicle) {

    return "Vehículo";

  }


  const vehicleName =

    vehicle.name ||

    vehicle.vehicleName ||

    vehicle.model ||

    "";


  const plate =

    vehicle.plate ||

    vehicle.licensePlate ||

    vehicle.license ||

    "";


  if (
    vehicleName &&
    plate
  ) {

    return `${vehicleName} - ${plate}`;

  }


  if (vehicleName) {

    return vehicleName;

  }


  if (plate) {

    return plate;

  }


  return "Vehículo";

};


/* ======================================================
   COMPONENT
====================================================== */

const DriverForm = ({

  driver = null,

  vehicles = [],

  onClose,

  onSave

}) => {


  /* ======================================================
     STATE
  ====================================================== */

  const isEditing =
    useMemo(

      () => !!driver,

      [driver]

    );


  const [formData, setFormData] =
    useState({

      ...EMPTY_FORM

    });


  const [errors, setErrors] =
    useState({});


  const [loading, setLoading] =
    useState(false);


  /* ======================================================
     VEHICLE OPTIONS
  ====================================================== */

  /*
    IMPORTANTE:

    "vehicles" contiene los documentos originales
    de Firestore.

    Ejemplo:

    {
      id: "abc123",
      name: "Toyota 1",
      plate: "GB4232",
      isActive: true
    }

    Aquí los convertimos a:

    {
      value: "abc123",
      label: "Toyota 1 - GB4232"
    }

  */

  const vehicleOptions =
    useMemo(() => {

      if (!Array.isArray(vehicles)) {

        return [];

      }


      return vehicles

        .filter(
          (vehicle) =>

            vehicle?.id &&

            vehicle?.isActive !== false

        )

        .map(
          (vehicle) => ({

            value:
              vehicle.id,

            label:
              getVehicleLabel(
                vehicle
              ),

            vehicle

          })
        )

        .sort(
          (a, b) =>

            a.label.localeCompare(
              b.label
            )

        );

    }, [
      vehicles
    ]);


  /* ======================================================
     SELECTED VEHICLE
  ====================================================== */

  const selectedVehicle =
    useMemo(() => {

      if (!formData.vehicleId) {

        return null;

      }


      return (

        vehicleOptions.find(

          (option) =>

            option.value ===
            formData.vehicleId

        ) || null

      );

    }, [

      formData.vehicleId,

      vehicleOptions

    ]);


  /* ======================================================
     LOAD DRIVER
  ====================================================== */

  useEffect(() => {

    if (driver) {

      setFormData({

        name:
          driver.name || "",

        phone:
          driver.phone || "",

        email:
          driver.email || "",

        licenses:

          (driver.licenses || [])
            .map(
              (license) => ({

                type:
                  license.type,

                expiresAt:

                  license.expiresAt?.toDate

                    ? license.expiresAt
                        .toDate()
                        .toISOString()
                        .split("T")[0]

                    : ""

              })
            ),

        driverType:

          DRIVER_TYPES.find(

            (option) =>

              option.value ===
              driver.driverType

          ) || null,

        /*
          El vehículo se guarda como ID.
        */

        vehicleId:
          driver.vehicleId || "",

        isAvailable:
          driver.isAvailable ?? true,

        isActive:
          driver.isActive ?? true

      });

    }

    else {

      setFormData({

        ...EMPTY_FORM

      });

    }


    setErrors({});

  }, [
    driver
  ]);


  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (

    field,

    value

  ) => {

    setFormData(
      (prev) => ({

        ...prev,

        [field]:
          value

      })
    );


    if (errors[field]) {

      setErrors(
        (prev) => ({

          ...prev,

          [field]:
            null

        })
      );

    }

  };


  /* ======================================================
     LICENSE TOGGLE
  ====================================================== */

  const handleLicenseToggle = (

    type,

    checked

  ) => {

    if (checked) {

      setFormData(
        (prev) => ({

          ...prev,

          licenses: [

            ...prev.licenses,

            {

              type,

              expiresAt:
                ""

            }

          ]

        })
      );

    }

    else {

      setFormData(
        (prev) => ({

          ...prev,

          licenses:

            prev.licenses.filter(

              (license) =>

                license.type !==
                type

            )

        })
      );

    }


    if (errors.licenses) {

      setErrors(
        (prev) => ({

          ...prev,

          licenses:
            null

        })
      );

    }

  };


  /* ======================================================
     LICENSE EXPIRATION
  ====================================================== */

  const handleLicenseExpiration = (

    type,

    value

  ) => {

    setFormData(
      (prev) => ({

        ...prev,

        licenses:

          prev.licenses.map(

            (license) =>

              license.type === type

                ? {

                    ...license,

                    expiresAt:
                      value

                  }

                : license

          )

      })
    );

  };


  /* ======================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {

    const newErrors = {};


    if (
      !formData.name.trim()
    ) {

      newErrors.name =
        "El nombre es obligatorio.";

    }


    if (
      formData.licenses.length === 0
    ) {

      newErrors.licenses =
        "Seleccione al menos una licencia.";

    }


    const missingExpiration =

      formData.licenses.some(

        (license) =>

          !license.expiresAt

      );


    if (missingExpiration) {

      newErrors.licenses =
        "Todas las licencias deben tener fecha de vencimiento.";

    }


    if (!formData.driverType) {

      newErrors.driverType =
        "Seleccione un tipo de conductor.";

    }


    setErrors(
      newErrors
    );


    return (
      Object.keys(
        newErrors
      ).length === 0
    );

  };


  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();


    if (!validateForm()) {

      return;

    }


    try {

      setLoading(
        true
      );


      await onSave({

        name:
          formData.name.trim(),

        phone:
          formData.phone.trim(),

        email:
          formData.email.trim(),

        licenses:

          formData.licenses.map(

            (license) => ({

              type:
                license.type,

              expiresAt:

                Timestamp.fromDate(

                  new Date(
                    license.expiresAt
                  )

                )

            })

          ),

        driverType:
          formData.driverType.value,

        /*
          VEHÍCULO OPCIONAL

          Si no hay vehículo:

          vehicleId = ""

          Si hay vehículo:

          vehicleId = ID del vehículo
        */

        vehicleId:
          formData.vehicleId || "",

        isAvailable:
          formData.isAvailable,

        isActive:
          formData.isActive

      });

    }

    finally {

      setLoading(
        false
      );

    }

  };


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <Modal
      size="lg"
      onClose={
        onClose
      }

    >

      <form

        className="catalog-form"

        onSubmit={
          handleSubmit
        }

      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="catalog-form-header"
        >

          <div
            className="catalog-form-header-left"
          >

            <h2>

              {

                isEditing

                  ? "Editar conductor"

                  : "Nuevo conductor"

              }

            </h2>


            <p>

              {

                isEditing

                  ? "Actualiza la información del conductor."

                  : "Completa la información para registrar un nuevo conductor."

              }

            </p>

          </div>


          <button

            type="button"

            className="catalog-form-close"

            onClick={
              onClose
            }

            aria-label="Cerrar"

          >

            ×

          </button>

        </div>


        {/* ==================================================
            BODY
        ================================================== */}

        <div
          className="catalog-form-body"
        >

          {/* ==================================================
              GENERAL INFORMATION
          ================================================== */}

          <section
            className="catalog-form-section"
          >

            <h3>
              Información general
            </h3>


            <div
              className="catalog-form-grid catalog-form-grid-2"
            >

              {/* ============================================
                  FULL NAME
              ============================================ */}

              <div
                className="catalog-form-group"
              >

                <label>

                  Nombre completo{" "}

                  <span>
                    *
                  </span>

                </label>


                <input

                  type="text"

                  value={
                    formData.name
                  }

                  onChange={
                    (e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                  }

                />


                {

                  errors.name && (

                    <small>
                      {errors.name}
                    </small>

                  )

                }

              </div>


              {/* ============================================
                  PHONE
              ============================================ */}

              <div
                className="catalog-form-group"
              >

                <label>
                  Teléfono
                </label>


                <input

                  type="text"

                  value={
                    formData.phone
                  }

                  onChange={
                    (e) =>
                      handleChange(
                        "phone",
                        e.target.value
                      )
                  }

                />

              </div>


              {/* ============================================
                  EMAIL
              ============================================ */}

              <div
                className="catalog-form-group"
              >

                <label>
                  Email
                </label>


                <input

                  type="email"

                  value={
                    formData.email
                  }

                  onChange={
                    (e) =>
                      handleChange(
                        "email",
                        e.target.value
                      )
                  }

                />

              </div>


              {/* ============================================
                  DRIVER TYPE
              ============================================ */}

              <div
                className="catalog-form-group"
              >

                <label>

                  Tipo de conductor{" "}

                  <span>
                    *
                  </span>

                </label>


                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={
                    DRIVER_TYPES
                  }

                  value={
                    formData.driverType
                  }

                  onChange={
                    (option) =>
                      handleChange(
                        "driverType",
                        option
                      )
                  }

                  placeholder="Seleccione..."

                  isClearable

                />


                {

                  errors.driverType && (

                    <small>
                      {errors.driverType}
                    </small>

                  )

                }

              </div>


              {/* ============================================
                  VEHICLE
              ============================================ */}

              <div
                className="catalog-form-group"
              >

                <label>

                  Vehículo asignado{" "}

                  <span
                    className="catalog-form-label-optional"
                  >
                    Opcional
                  </span>

                </label>


                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={
                    vehicleOptions
                  }

                  value={
                    selectedVehicle
                  }

                  onChange={
                    (option) =>

                      handleChange(

                        "vehicleId",

                        option?.value || ""

                      )
                  }

                  placeholder={

                    vehicleOptions.length > 0

                      ? "Seleccione un vehículo..."

                      : "No hay vehículos disponibles"

                  }

                  isClearable

                  isSearchable

                  isDisabled={
                    vehicleOptions.length === 0
                  }

                  noOptionsMessage={() =>
                    "No hay vehículos disponibles"
                  }

                />


                <div
                  className="catalog-form-help"
                >

                  <small>

                    Puedes asignar un vehículo al conductor o dejar este campo vacío.

                  </small>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              LICENSES
          ================================================== */}

          <section
            className="catalog-form-section"
          >

            <h3>
              Licencias
            </h3>


            <div
              className="catalog-form-grid catalog-form-grid-3"
            >

              {

                ["A", "B", "C"].map(

                  (group) => (

                    <div

                      key={
                        group
                      }

                      className="catalog-form-group"

                    >

                      <label>

                        Tipo {group}

                      </label>


                      {

                        DRIVER_LICENSE_TYPES

                          .filter(
                            (item) =>

                              item.value.startsWith(
                                group
                              )
                          )

                          .map(
                            (license) => {

                              const selected =

                                formData.licenses.find(

                                  (item) =>

                                    item.type ===
                                    license.value

                                );


                              return (

                                <div

                                  key={
                                    license.value
                                  }

                                  className="catalog-form-checkbox"

                                >

                                  <label>

                                    <input

                                      type="checkbox"

                                      checked={
                                        !!selected
                                      }

                                      onChange={
                                        (e) =>

                                          handleLicenseToggle(

                                            license.value,

                                            e.target.checked

                                          )
                                      }

                                    />

                                    {license.label}

                                  </label>

                                </div>

                              );

                            }

                          )

                      }

                    </div>

                  )

                )

              }

            </div>


            {

              formData.licenses.length > 0 && (

                <>

                  <div
                    className="catalog-form-divider"
                  />


                  <h3
                    style={{
                      marginTop:
                        "32px"
                    }}
                  >

                    Vencimiento de licencias

                  </h3>


                  <div
                    className="catalog-form-grid catalog-form-grid-2"
                  >

                    {

                      formData.licenses.map(

                        (license) => (

                          <div

                            key={
                              license.type
                            }

                            className="catalog-form-group"

                          >

                            <label>

                              {license.type}{" "}

                              <span>
                                *
                              </span>

                            </label>


                            <input

                              type="date"

                              value={
                                license.expiresAt
                              }

                              onChange={
                                (e) =>

                                  handleLicenseExpiration(

                                    license.type,

                                    e.target.value

                                  )
                              }

                            />

                          </div>

                        )

                      )

                    }

                  </div>

                </>

              )

            }


            {

              errors.licenses && (

                <div
                  className="catalog-form-help"
                >

                  <small>
                    {errors.licenses}
                  </small>

                </div>

              )

            }

          </section>


          {/* ==================================================
              STATUS
          ================================================== */}

          <section
            className="catalog-form-section"
          >

            <h3>
              Estado
            </h3>


            <div
              className="catalog-form-checkbox-group"
            >

              <label>

                <input

                  type="checkbox"

                  checked={
                    formData.isAvailable
                  }

                  onChange={
                    (e) =>

                      handleChange(

                        "isAvailable",

                        e.target.checked

                      )
                  }

                />

                Disponible

              </label>


              <label>

                <input

                  type="checkbox"

                  checked={
                    formData.isActive
                  }

                  onChange={
                    (e) =>

                      handleChange(

                        "isActive",

                        e.target.checked

                      )
                  }

                />

                Activo

              </label>

            </div>

          </section>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          className="catalog-form-footer"
        >

          <div
            className="catalog-form-actions"
          >

            <button

              type="button"

              className="btn-secondary"

              onClick={
                onClose
              }

              disabled={
                loading
              }

            >

              Cancelar

            </button>


            <button

              type="submit"

              className="btn-primary"

              disabled={
                loading
              }

            >

              {

                loading

                  ? "Guardando..."

                  : isEditing

                    ? "Guardar cambios"

                    : "Guardar"

              }

            </button>

          </div>

        </div>

      </form>

    </Modal>

  );

};


export default DriverForm;