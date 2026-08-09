import { useEffect, useMemo, useState } from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import {
  getVehicles
} from "../../../../../services/settings/transportation/vehiclesService";

import {
  MAINTENANCE_SYSTEMS
} from "../../../../../constants/transportation/maintenanceTypes";

import {
  MAINTENANCE_CATEGORIES
} from "../../../../../constants/transportation/maintenanceCategories";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

/* ======================================================
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {

  vehicle: null,

  category: null,

  area: null,

  date: "",

  mileage: "",

  nextMileage: "",

  provider: "",

  cost: "",

  description: "",

  isActive: true

};

/* ======================================================
   COMPONENT
====================================================== */

const MaintenanceForm = ({

  companyId,

  maintenance = null,

  onClose,

  onSave

}) => {

  /* ======================================================
     STATE
  ====================================================== */

  const isEditing = useMemo(

    () => !!maintenance,

    [maintenance]

  );

  const [formData, setFormData] =

    useState(EMPTY_FORM);

  const [vehicles, setVehicles] =

    useState([]);

  const [errors, setErrors] =

    useState({});

  const [loading, setLoading] =

    useState(false);

  /* ======================================================
     LOAD VEHICLES
  ====================================================== */

  useEffect(() => {

    const loadVehicles = async () => {

      try {

        const data =

          await getVehicles(

            companyId

          );

        setVehicles(

          data

            .filter(

              vehicle =>

                vehicle.isActive

            )

            .sort(

              (a,b)=>

                a.name.localeCompare(

                  b.name

                )

            )

        );

      }

      catch (error) {

        console.error(error);

      }

    };

    if (companyId) {

      loadVehicles();

    }

  }, [companyId]);

  /* ======================================================
     VEHICLE OPTIONS
  ====================================================== */

  const vehicleOptions = useMemo(

    () => (

      vehicles.map(vehicle => ({

        ...vehicle,

        value: vehicle.id,

        label:

          `${vehicle.name} - ${vehicle.plate}`

      }))

    ),

    [vehicles]

  );

  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    if (maintenance) {

      const vehicle = vehicles.find(

        item =>

          item.id ===

          maintenance.vehicle?.id

      );

      setFormData({

        vehicle:

          vehicle

            ? {

                ...vehicle,

                value: vehicle.id,

                label:

                  `${vehicle.name} - ${vehicle.plate}`

              }

            : null,

        category:

          maintenance.category || null,

        area:

          maintenance.area || null,

        date:

          maintenance.date || "",

        mileage:

          maintenance.mileage || "",

        nextMileage:

          maintenance.nextMileage || "",

        provider:

          maintenance.provider || "",

        cost:

          maintenance.cost || "",

        description:

          maintenance.description || "",

        isActive:

          maintenance.isActive ?? true

      });

    }

    else {

      setFormData(

        EMPTY_FORM

      );

    }

    setErrors({});

  }, [

    maintenance,

    vehicles

  ]);

  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (

    field,

    value

  ) => {

    setFormData(prev => ({

      ...prev,

      [field]: value

    }));

    if (errors[field]) {

      setErrors(prev => ({

        ...prev,

        [field]: null

      }));

    }

  };

    /* ======================================================
     VALIDATION
  ====================================================== */

  const validateForm = () => {

    const newErrors = {};

    if (!formData.vehicle) {

      newErrors.vehicle =
        "Seleccione un vehículo.";

    }

    if (!formData.category) {

      newErrors.category =
        "Seleccione un tipo de mantenimiento.";

    }

    if (!formData.area) {

      newErrors.area =
        "Seleccione un área.";

    }

    if (!formData.date) {

      newErrors.date =
        "Seleccione una fecha.";

    }

    setErrors(newErrors);

    return (

      Object.keys(newErrors).length === 0

    );

  };

  /* ======================================================
     SUBMIT
  ====================================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      await onSave({

        vehicle: {

          id: formData.vehicle.id,

          plate: formData.vehicle.plate,

          name: formData.vehicle.name

        },

        category: {

          value: formData.category.value,

          label: formData.category.label

        },

        area: {

          value: formData.area.value,

          label: formData.area.label

        },

        date: formData.date,

        mileage:

          formData.mileage === ""

            ? null

            : Number(formData.mileage),

        nextMileage:

          formData.nextMileage === ""

            ? null

            : Number(formData.nextMileage),

        provider:

          formData.provider.trim(),

        cost:

          formData.cost === ""

            ? 0

            : Number(formData.cost),

        description:

          formData.description.trim(),

        isActive:

          formData.isActive

      });

    }

    finally {

      setLoading(false);

    }

  };

    /* ======================================================
     RENDER
  ====================================================== */

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

                  ? "Editar mantenimiento"

                  : "Nuevo mantenimiento"

              }

            </h2>

            <p>

              {

                isEditing

                  ? "Actualiza la información del mantenimiento."

                  : "Completa la información para registrar un nuevo mantenimiento."

              }

            </p>

          </div>

          <button
            type="button"
            className="catalog-form-close"
            onClick={onClose}
            aria-label="Cerrar"
          >

            ×

          </button>

        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="catalog-form-body">

          {/* ==============================================
              GENERAL INFORMATION
          ============================================== */}

          <section className="catalog-form-section">

            <h3>

              Datos del mantenimiento

            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              {/* VEHICLE */}

              <div className="catalog-form-group">

                <label>

                  Vehículo <span>*</span>

                </label>

                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={vehicleOptions}

                  value={formData.vehicle}

                  onChange={(option)=>

                    handleChange(

                      "vehicle",

                      option

                    )

                  }

                  placeholder="Seleccione un vehículo"

                  isClearable

                />

                {

                  errors.vehicle &&

                  <small>

                    {errors.vehicle}

                  </small>

                }

              </div>

              {/* AREA */}

              <div className="catalog-form-group">

                <label>

                  Área <span>*</span>

                </label>

                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={MAINTENANCE_CATEGORIES}

                  value={formData.area}

                  onChange={(option)=>

                    handleChange(

                      "area",

                      option

                    )

                  }

                  placeholder="Seleccione..."

                  isClearable

                />

                {

                  errors.area &&

                  <small>

                    {errors.area}

                  </small>

                }

              </div>

              {/* CATEGORY */}

              <div className="catalog-form-group">

                <label>

                  Tipo de mantenimiento <span>*</span>

                </label>

                <Select

                  className="catalog-select"

                  classNamePrefix="catalog-select"

                  options={MAINTENANCE_SYSTEMS}

                  value={formData.category}

                  onChange={(option)=>

                    handleChange(

                      "category",

                      option

                    )

                  }

                  placeholder="Seleccione..."

                  isClearable

                />

                {

                  errors.category &&

                  <small>

                    {errors.category}

                  </small>

                }

              </div>

              {/* DATE */}

              <div className="catalog-form-group">

                <label>

                  Fecha <span>*</span>

                </label>

                <input

                  type="date"

                  value={formData.date}

                  onChange={(e)=>

                    handleChange(

                      "date",

                      e.target.value

                    )

                  }

                />

                {

                  errors.date &&

                  <small>

                    {errors.date}

                  </small>

                }

              </div>

              {/* MILEAGE */}

              <div className="catalog-form-group">

                <label>

                  Kilometraje (km)

                </label>

                <input

                  type="number"

                  min="0"

                  step="1"

                  placeholder="Ej. 125000"

                  value={formData.mileage}

                  onChange={(e)=>

                    handleChange(

                      "mileage",

                      e.target.value

                    )

                  }

                />

              </div>

              {/* NEXT MILEAGE */}

              <div className="catalog-form-group">

                <label>

                  Próximo mantenimiento (km)

                </label>

                <input

                  type="number"

                  min="0"

                  step="1"

                  placeholder="Ej. 135000"

                  value={formData.nextMileage}

                  onChange={(e)=>

                    handleChange(

                      "nextMileage",

                      e.target.value

                    )

                  }

                />

              </div>

            </div>

          </section>

          {/* ==============================================
              SERVICE INFORMATION
          ============================================== */}

          <section className="catalog-form-section">

            <h3>

              Detalles del servicio

            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              {/* PROVIDER */}

              <div className="catalog-form-group">

                <label>

                  Taller / Proveedor

                </label>

                <input

                  type="text"

                  value={formData.provider}

                  onChange={(e)=>

                    handleChange(

                      "provider",

                      e.target.value

                    )

                  }

                />

              </div>

              {/* COST */}

              <div className="catalog-form-group">

                <label>

                  Costo del mantenimiento

                </label>

                <input

                  type="number"

                  min="0"

                  step="0.01"

                  placeholder="0.00"

                  value={formData.cost}

                  onChange={(e)=>

                    handleChange(

                      "cost",

                      e.target.value

                    )

                  }

                />

              </div>

              {/* DESCRIPTION */}

              <div className="catalog-form-group catalog-form-group-full">

                <label>

                  Descripción

                </label>

                <textarea

                  value={formData.description}

                  onChange={(e)=>

                    handleChange(

                      "description",

                      e.target.value

                    )

                  }

                  placeholder="Describe el mantenimiento realizado..."

                />

              </div>

            </div>

          </section>

          {/* ==============================================
              STATUS
          ============================================== */}

          <section className="catalog-form-section">

            <h3>

              Estado

            </h3>

            <div className="catalog-form-checkbox">

              <label>

                <input

                  type="checkbox"

                  checked={formData.isActive}

                  onChange={(e)=>

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

export default MaintenanceForm;