import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import { VEHICLE_TYPES } from "../../../../../constants/transportation/vehicleTypes";
import { VEHICLE_STATUS } from "../../../../../constants/transportation/vehicleStatus";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

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

const VehicleForm = ({
  vehicle = null,
  onClose,
  onSave
}) => {

  const isEditing = useMemo(() => !!vehicle, [vehicle]);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (vehicle) {

      setFormData({

        name: vehicle.name || "",
        plate: vehicle.plate || "",
        type: vehicle.type || "",
        status: vehicle.status || "active",

        brand: vehicle.brand || "",
        model: vehicle.model || "",
        year: vehicle.year || "",
        color: vehicle.color || "",

        passengers: vehicle.passengers || "",
        luggage: vehicle.luggage || "",

        mileage: vehicle.mileage || "",
        vin: vehicle.vin || "",

        notes: vehicle.notes || ""

      });

    } else {

      setFormData(EMPTY_FORM);

    }

    setErrors({});

  }, [vehicle]);

  const handleChange = (field, value) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {

      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));

    }

  };

  const validateForm = () => {

    const newErrors = {};

    if (!formData.name.trim()) {

      newErrors.name = "El nombre es obligatorio.";

    }

    if (!formData.plate.trim()) {

      newErrors.plate = "La placa es obligatoria.";

    }

    if (!formData.type) {

      newErrors.type = "Seleccione un tipo de vehículo.";

    }

    if (!formData.status) {

      newErrors.status = "Seleccione un estado.";

    }

    if (
      formData.passengers === "" ||
      Number(formData.passengers) <= 0
    ) {

      newErrors.passengers =
        "Debe indicar la capacidad de pasajeros.";

    }

    if (
      formData.year &&
      (Number(formData.year) < 1950 ||
        Number(formData.year) > new Date().getFullYear() + 1)
    ) {

      newErrors.year = "Ingrese un año válido.";

    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validateForm()) return;

    try {

      setLoading(true);

      await onSave(formData);

    } finally {

      setLoading(false);

    }

  };

  return (

    <Modal size="lg" onClose={onClose}>

      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

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
          >
            ×
          </button>

        </div>

        <div className="catalog-form-body">

          <section className="catalog-form-section">

            <h3>Información General</h3>

            <div className="catalog-form-grid">

              <div className="catalog-form-group">

                <label>

                  Nombre <span>*</span>

                </label>

                <input
                  type="text"
                  value={formData.name}
                  placeholder="Ej. Toyota Hiace 01"
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                />

                {errors.name && (
                  <small>{errors.name}</small>
                )}

              </div>

              <div className="catalog-form-group">

                <label>

                  Placa <span>*</span>

                </label>

                <input
                  type="text"
                  value={formData.plate}
                  placeholder="ABC-123"
                  onChange={(e) =>
                    handleChange("plate", e.target.value)
                  }
                />

                {errors.plate && (
                  <small>{errors.plate}</small>
                )}

              </div>

              <div className="catalog-form-group">

                <label>

                  Tipo <span>*</span>

                </label>

                <Select
                  options={VEHICLE_TYPES}
                  value={
                    VEHICLE_TYPES.find(
                      (item) =>
                        item.value === formData.type
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange(
                      "type",
                      option?.value || ""
                    )
                  }
                  placeholder="Seleccione..."
                />

                {errors.type && (
                  <small>{errors.type}</small>
                )}

              </div>

              <div className="catalog-form-group">

                <label>

                  Estado <span>*</span>

                </label>

                <Select
                  options={VEHICLE_STATUS}
                  value={
                    VEHICLE_STATUS.find(
                      (item) =>
                        item.value === formData.status
                    ) || null
                  }
                  onChange={(option) =>
                    handleChange(
                      "status",
                      option?.value || ""
                    )
                  }
                  placeholder="Seleccione..."
                />

                {errors.status && (
                  <small>{errors.status}</small>
                )}

              </div>
            </div>
              
          </section>

          {/* ======================================================
              ESPECIFICACIONES
          ====================================================== */}

          <section className="catalog-form-section">

            <h3>Especificaciones</h3>

            <div className="catalog-form-grid">

              <div className="catalog-form-group">

                <label>Marca</label>

                <input
                  type="text"
                  value={formData.brand}
                  placeholder="Ej. Toyota"
                  onChange={(e) =>
                    handleChange("brand", e.target.value)
                  }
                />

              </div>

              <div className="catalog-form-group">

                <label>Modelo</label>

                <input
                  type="text"
                  value={formData.model}
                  placeholder="Ej. Hiace"
                  onChange={(e) =>
                    handleChange("model", e.target.value)
                  }
                />

              </div>

              <div className="catalog-form-group">

                <label>Año</label>

                <input
                  type="number"
                  value={formData.year}
                  placeholder="2024"
                  onChange={(e) =>
                    handleChange("year", e.target.value)
                  }
                />

                {errors.year && (
                  <small>{errors.year}</small>
                )}

              </div>

              <div className="catalog-form-group">

                <label>Color</label>

                <input
                  type="text"
                  value={formData.color}
                  placeholder="Blanco"
                  onChange={(e) =>
                    handleChange("color", e.target.value)
                  }
                />

              </div>

            </div>

          </section>

          {/* ======================================================
              CAPACIDAD
          ====================================================== */}

          <section className="catalog-form-section">

            <h3>Capacidad</h3>

            <div className="catalog-form-grid">

              <div className="catalog-form-group">

                <label>

                  Pasajeros <span>*</span>

                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.passengers}
                  placeholder="12"
                  onChange={(e) =>
                    handleChange("passengers", e.target.value)
                  }
                />

                {errors.passengers && (
                  <small>{errors.passengers}</small>
                )}

              </div>

              <div className="catalog-form-group">

                <label>Equipaje</label>

                <input
                  type="number"
                  min="0"
                  value={formData.luggage}
                  placeholder="10"
                  onChange={(e) =>
                    handleChange("luggage", e.target.value)
                  }
                />

              </div>

            </div>

          </section>

          {/* ======================================================
              OPERACIÓN
          ====================================================== */}

          <section className="catalog-form-section">

            <h3>Operación</h3>

            <div className="catalog-form-grid">

              <div className="catalog-form-group">

                <label>Kilometraje</label>

                <input
                  type="number"
                  min="0"
                  value={formData.mileage}
                  placeholder="120000"
                  onChange={(e) =>
                    handleChange("mileage", e.target.value)
                  }
                />

              </div>

              <div className="catalog-form-group">

                <label>VIN</label>

                <input
                  type="text"
                  value={formData.vin}
                  placeholder="Número de identificación del vehículo"
                  onChange={(e) =>
                    handleChange("vin", e.target.value)
                  }
                />

              </div>

            </div>

          </section>

          {/* ======================================================
              OBSERVACIONES
          ====================================================== */}

          <section className="catalog-form-section">

            <h3>Observaciones</h3>

            <div className="catalog-form-group">

              <textarea
                rows={5}
                value={formData.notes}
                placeholder="Escriba aquí cualquier observación relacionada con el vehículo..."
                onChange={(e) =>
                  handleChange("notes", e.target.value)
                }
              />

            </div>

          </section>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

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