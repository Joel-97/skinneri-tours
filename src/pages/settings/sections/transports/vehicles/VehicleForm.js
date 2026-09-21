/*
==========================================================
VEHICLE FORM
==========================================================
*/

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Select from "react-select";

import Modal
  from "../../../../../components/general/modal";

import {
  VEHICLE_TYPES
} from "../../../../../constants/transportation/vehicleTypes";

import {
  VEHICLE_STATUS
} from "../../../../../constants/transportation/vehicleStatus";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


/*
==========================================================
EMPTY FORM
==========================================================
*/

const EMPTY_FORM = {

  name: "",

  plate: "",

  type: "",

  status: "active",

  brand: "",

  model: "",

  year: "",

  color: "",

  passengers: "",

  luggage: "",

  mileage: "",

  vin: "",

  notes: ""

};


/*
==========================================================
VEHICLE FORM
==========================================================
*/

const VehicleForm = ({

  vehicle = null,

  onClose,

  onSave

}) => {


  /*
  ========================================================
  EDIT MODE
  ========================================================
  */

  const isEditing = useMemo(

    () => Boolean(vehicle),

    [vehicle]

  );


  /*
  ========================================================
  STATE
  ========================================================
  */

  const [formData, setFormData] = useState(

    EMPTY_FORM

  );

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);


  /*
  ========================================================
  LOAD VEHICLE
  ========================================================
  */

  useEffect(() => {

    if (vehicle) {

      setFormData({

        name:
          vehicle.name || "",

        plate:
          vehicle.plate || "",

        type:
          vehicle.type || "",

        status:
          vehicle.status || "active",

        brand:
          vehicle.brand || "",

        model:
          vehicle.model || "",

        year:
          vehicle.year || "",

        color:
          vehicle.color || "",

        passengers:
          vehicle.passengers ?? "",

        luggage:
          vehicle.luggage ?? "",

        mileage:
          vehicle.mileage ?? "",

        vin:
          vehicle.vin || "",

        notes:
          vehicle.notes || ""

      });

    } else {

      setFormData({

        ...EMPTY_FORM

      });

    }

    setErrors({});

  }, [vehicle]);


  /*
  ========================================================
  HANDLE CHANGE
  ========================================================
  */

  const handleChange = (

    field,

    value

  ) => {

    setFormData((previous) => ({

      ...previous,

      [field]: value

    }));


    if (errors[field]) {

      setErrors((previous) => ({

        ...previous,

        [field]: null

      }));

    }

  };


  /*
  ========================================================
  VALIDATE FORM
  ========================================================
  */

  const validateForm = () => {

    const newErrors = {};


    /*
    ======================================================
    NAME
    ======================================================
    */

    if (!formData.name.trim()) {

      newErrors.name =
        "El nombre es obligatorio.";

    }


    /*
    ======================================================
    PLATE
    ======================================================
    */

    if (!formData.plate.trim()) {

      newErrors.plate =
        "La placa es obligatoria.";

    }


    /*
    ======================================================
    TYPE
    ======================================================
    */

    if (!formData.type) {

      newErrors.type =
        "Seleccione un tipo de vehículo.";

    }


    /*
    ======================================================
    STATUS
    ======================================================
    */

    if (!formData.status) {

      newErrors.status =
        "Seleccione un estado.";

    }


    /*
    ======================================================
    PASSENGERS
    ======================================================
    */

    if (

      formData.passengers === "" ||

      Number(formData.passengers) <= 0

    ) {

      newErrors.passengers =
        "Debe indicar la capacidad de pasajeros.";

    }


    /*
    ======================================================
    YEAR
    ======================================================
    */

    if (formData.year) {

      const currentYear =
        new Date().getFullYear();

      const year =
        Number(formData.year);

      if (

        year < 1950 ||

        year > currentYear + 1

      ) {

        newErrors.year =
          "Ingrese un año válido.";

      }

    }


    /*
    ======================================================
    SET ERRORS
    ======================================================
    */

    setErrors(newErrors);


    return (
      Object.keys(newErrors).length === 0
    );

  };


  /*
  ========================================================
  HANDLE SUBMIT
  ========================================================
  */

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (!validateForm()) {

      return;

    }


    try {

      setLoading(true);

      await onSave({

        ...formData,

        name:
          formData.name.trim(),

        plate:
          formData.plate.trim(),

        brand:
          formData.brand.trim(),

        model:
          formData.model.trim(),

        color:
          formData.color.trim(),

        vin:
          formData.vin.trim(),

        notes:
          formData.notes.trim(),

        year:
          formData.year === ""
            ? ""
            : Number(formData.year),

        passengers:
          formData.passengers === ""
            ? ""
            : Number(formData.passengers),

        luggage:
          formData.luggage === ""
            ? ""
            : Number(formData.luggage),

        mileage:
          formData.mileage === ""
            ? ""
            : Number(formData.mileage)

      });

    } finally {

      setLoading(false);

    }

  };


  /*
  ========================================================
  RENDER
  ========================================================
  */

  return (

    <Modal
      size="lg"
      onClose={onClose}
    >

      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="catalog-form-header">

          <div className="catalog-form-header-left">

            <h2>

              {
                isEditing
                  ? "Editar vehículo"
                  : "Nuevo vehículo"
              }

            </h2>

            <p>

              {
                isEditing
                  ? "Actualiza la información del vehículo."
                  : "Completa la información para registrar un nuevo vehículo."
              }

            </p>

          </div>


          <button
            type="button"
            className="catalog-form-close"
            onClick={onClose}
            aria-label="Cerrar"
            disabled={loading}
          >

            ×

          </button>

        </div>


        {/* ==================================================
            BODY
        ================================================== */}

        <div className="catalog-form-body">


          {/* ==================================================
              INFORMACIÓN GENERAL
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Información General
            </h3>


            <div className="catalog-form-grid">


              {/* ------------------------------------------
                  NAME
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>

                  Nombre <span>*</span>

                </label>


                <input
                  type="text"
                  value={formData.name}
                  placeholder="Ej. Toyota Hiace 01"
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />


                {
                  errors.name && (

                    <small>
                      {errors.name}
                    </small>

                  )
                }

              </div>


              {/* ------------------------------------------
                  PLATE
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>

                  Placa <span>*</span>

                </label>


                <input
                  type="text"
                  value={formData.plate}
                  placeholder="ABC-123"
                  onChange={(event) =>
                    handleChange(
                      "plate",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />


                {
                  errors.plate && (

                    <small>
                      {errors.plate}
                    </small>

                  )
                }

              </div>


              {/* ------------------------------------------
                  TYPE
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>

                  Tipo <span>*</span>

                </label>


                <Select
                  options={VEHICLE_TYPES}
                  value={
                    VEHICLE_TYPES.find(
                      (item) =>
                        item.value ===
                        formData.type
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange(
                      "type",
                      option?.value || ""
                    )
                  }
                  placeholder="Seleccione..."
                  isDisabled={loading}
                  isClearable={false}
                />


                {
                  errors.type && (

                    <small>
                      {errors.type}
                    </small>

                  )
                }

              </div>


              {/* ------------------------------------------
                  STATUS
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>

                  Estado <span>*</span>

                </label>


                <Select
                  options={VEHICLE_STATUS}
                  value={
                    VEHICLE_STATUS.find(
                      (item) =>
                        item.value ===
                        formData.status
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange(
                      "status",
                      option?.value || ""
                    )
                  }
                  placeholder="Seleccione..."
                  isDisabled={loading}
                  isClearable={false}
                />


                {
                  errors.status && (

                    <small>
                      {errors.status}
                    </small>

                  )
                }

              </div>

            </div>

          </section>


          {/* ==================================================
              ESPECIFICACIONES
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Especificaciones
            </h3>


            <div className="catalog-form-grid">


              {/* ------------------------------------------
                  BRAND
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Marca
                </label>


                <input
                  type="text"
                  value={formData.brand}
                  placeholder="Ej. Toyota"
                  onChange={(event) =>
                    handleChange(
                      "brand",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* ------------------------------------------
                  MODEL
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Modelo
                </label>


                <input
                  type="text"
                  value={formData.model}
                  placeholder="Ej. Hiace"
                  onChange={(event) =>
                    handleChange(
                      "model",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* ------------------------------------------
                  YEAR
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Año
                </label>


                <input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  placeholder="2024"
                  onChange={(event) =>
                    handleChange(
                      "year",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />


                {
                  errors.year && (

                    <small>
                      {errors.year}
                    </small>

                  )
                }

              </div>


              {/* ------------------------------------------
                  COLOR
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Color
                </label>


                <input
                  type="text"
                  value={formData.color}
                  placeholder="Blanco"
                  onChange={(event) =>
                    handleChange(
                      "color",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              CAPACIDAD
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Capacidad
            </h3>


            <div className="catalog-form-grid">


              {/* ------------------------------------------
                  PASSENGERS
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>

                  Pasajeros <span>*</span>

                </label>


                <input
                  type="number"
                  min="1"
                  value={formData.passengers}
                  placeholder="12"
                  onChange={(event) =>
                    handleChange(
                      "passengers",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />


                {
                  errors.passengers && (

                    <small>
                      {errors.passengers}
                    </small>

                  )
                }

              </div>


              {/* ------------------------------------------
                  LUGGAGE
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Equipaje
                </label>


                <input
                  type="number"
                  min="0"
                  value={formData.luggage}
                  placeholder="10"
                  onChange={(event) =>
                    handleChange(
                      "luggage",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              OPERACIÓN
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Operación
            </h3>


            <div className="catalog-form-grid">


              {/* ------------------------------------------
                  MILEAGE
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  Kilometraje
                </label>


                <input
                  type="number"
                  min="0"
                  value={formData.mileage}
                  placeholder="120000"
                  onChange={(event) =>
                    handleChange(
                      "mileage",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>


              {/* ------------------------------------------
                  VIN
              ------------------------------------------ */}

              <div className="catalog-form-group">

                <label>
                  VIN
                </label>


                <input
                  type="text"
                  value={formData.vin}
                  placeholder="Número de identificación del vehículo"
                  onChange={(event) =>
                    handleChange(
                      "vin",
                      event.target.value
                    )
                  }
                  disabled={loading}
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              OBSERVACIONES
          ================================================== */}

          <section className="catalog-form-section">

            <h3>
              Observaciones
            </h3>


            <div className="catalog-form-group">

              <textarea
                rows={5}
                value={formData.notes}
                placeholder="Escriba aquí cualquier observación relacionada con el vehículo..."
                onChange={(event) =>
                  handleChange(
                    "notes",
                    event.target.value
                  )
                }
                disabled={loading}
              />

            </div>

          </section>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="catalog-form-footer">

          <div className="catalog-form-actions">

            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >

              Cancelar

            </button>


            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
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


export default VehicleForm;