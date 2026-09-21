import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";


const SERVICE_CATEGORY = "transportation";
const DEFAULT_COLOR = "#0a2a63";

const EMPTY_FORM = {
  code: "",
  name: "",
  category: SERVICE_CATEGORY,
  pricingMode: "fixed",
  pricingType: "per_booking",
  basePrice: "",
  currency: "",
  symbol: "",
  durationValue: "",
  durationUnit: "minutes",
  durationMinutes: null,
  color: DEFAULT_COLOR,
  staffPayment: {
    enabled: false,
    type: "fixed",
    value: ""
  },
  isActive: true
};

const PRICING_OPTIONS = [
  {
    value: "fixed",
    label: "Precio fijo"
  },
  {
    value: "manual",
    label: "Precio manual"
  }
];

const DURATION_OPTIONS = [
  {
    value: "minutes",
    label: "Minutos"
  },
  {
    value: "hours",
    label: "Horas"
  },
  {
    value: "days",
    label: "Días"
  }
];


const normalizeCode = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");


const normalizeCodeInput = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");


const getDurationFields = (durationMinutes) => {
  const minutes = Number(durationMinutes);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return {
      durationValue: "",
      durationUnit: "minutes"
    };
  }

  if (minutes % 1440 === 0) {
    return {
      durationValue: minutes / 1440,
      durationUnit: "days"
    };
  }

  if (minutes % 60 === 0) {
    return {
      durationValue: minutes / 60,
      durationUnit: "hours"
    };
  }

  return {
    durationValue: minutes,
    durationUnit: "minutes"
  };
};


const getDurationMinutes = (value, unit) => {
  const duration = Number(value);

  const multipliers = {
    minutes: 1,
    hours: 60,
    days: 1440
  };

  return duration * (multipliers[unit] || 1);
};


const buildInitialForm = (serviceType) => {
  if (!serviceType) {
    return {
      ...EMPTY_FORM,
      staffPayment: {
        ...EMPTY_FORM.staffPayment
      }
    };
  }

  const duration = getDurationFields(
    serviceType.durationMinutes
  );

  const generatedCode = normalizeCode(
    serviceType.name || ""
  );

  return {
    ...EMPTY_FORM,
    ...serviceType,

    code:
      serviceType.code ||
      generatedCode,

    name:
      serviceType.name || "",

    category:
      SERVICE_CATEGORY,

    pricingMode:
      serviceType.pricingMode ||
      "fixed",

    pricingType:
      serviceType.pricingType ||
      "per_booking",

    basePrice:
      serviceType.basePrice ?? "",

    currency:
      serviceType.currency || "",

    symbol:
      serviceType.symbol || "",

    ...duration,

    durationMinutes:
      serviceType.durationMinutes ?? null,

    color:
      serviceType.color ||
      DEFAULT_COLOR,

    staffPayment: {
      ...EMPTY_FORM.staffPayment,
      ...(serviceType.staffPayment || {}),
      value:
        serviceType.staffPayment?.value != null
          ? String(serviceType.staffPayment.value)
          : ""
    },

    isActive:
      serviceType.isActive ?? true
  };
};


const validateForm = (formData) => {
  const errors = {};

  if (!formData.code?.trim()) {
    errors.code = "El código es obligatorio.";
  }

  if (!formData.name?.trim()) {
    errors.name = "El nombre es obligatorio.";
  }

  if (!formData.pricingMode) {
    errors.pricingMode =
      "Seleccione un modo de precio.";
  }

  if (formData.pricingMode === "fixed") {
    if (
      formData.basePrice === "" ||
      formData.basePrice === null ||
      Number(formData.basePrice) <= 0
    ) {
      errors.basePrice =
        "El precio base debe ser mayor que cero.";
    }
  }

  if (!formData.currency) {
    errors.currency =
      "Debe seleccionar una moneda.";
  }

  if (
    formData.durationValue === "" ||
    formData.durationValue === null ||
    Number(formData.durationValue) <= 0
  ) {
    errors.durationValue =
      "La duración debe ser mayor que cero.";
  }

  if (formData.staffPayment?.enabled) {
    const value = formData.staffPayment.value;

    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      errors.staffPayment =
        "Debe ingresar el pago al chofer.";
    } else if (Number(value) < 0) {
      errors.staffPayment =
        "El pago al chofer no puede ser negativo.";
    } else if (
      formData.staffPayment.type === "percentage" &&
      Number(value) > 100
    ) {
      errors.staffPayment =
        "La comisión no puede ser mayor a 100%.";
    }
  }

  return errors;
};


const ServiceTypesForm = ({
  serviceType = null,
  currencies = [],
  onClose,
  onSave
}) => {
  const isEditing = Boolean(serviceType);

  const [formData, setFormData] = useState(
    () => buildInitialForm(serviceType)
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setFormData(buildInitialForm(serviceType));
    setErrors({});
  }, [serviceType]);


  const currencyOptions = useMemo(
    () =>
      currencies.map(currency => ({
        value: currency.code,
        label: `${currency.name} (${currency.symbol})`,
        symbol: currency.symbol
      })),
    [currencies]
  );


  const updateField = (field, value) => {
    setFormData(previous => ({
      ...previous,
      [field]: value
    }));

    setErrors(previous => {
      if (!previous[field]) {
        return previous;
      }

      const next = {
        ...previous
      };

      delete next[field];

      return next;
    });
  };


  const updateStaffPayment = (changes) => {
    setFormData(previous => ({
      ...previous,
      staffPayment: {
        ...previous.staffPayment,
        ...changes
      }
    }));

    setErrors(previous => {
      if (!previous.staffPayment) {
        return previous;
      }

      const next = {
        ...previous
      };

      delete next.staffPayment;

      return next;
    });
  };


  const handlePricingModeChange = (option) => {
    const pricingMode =
      option?.value || "fixed";

    setFormData(previous => ({
      ...previous,
      pricingMode,
      basePrice:
        pricingMode === "fixed"
          ? previous.basePrice
          : ""
    }));

    setErrors(previous => {
      const next = {
        ...previous
      };

      delete next.pricingMode;

      if (pricingMode !== "fixed") {
        delete next.basePrice;
      }

      return next;
    });
  };


  const handleCurrencyChange = (option) => {
    setFormData(previous => ({
      ...previous,
      currency: option?.value || "",
      symbol: option?.symbol || ""
    }));

    setErrors(previous => {
      const next = {
        ...previous
      };

      delete next.currency;

      return next;
    });
  };


  const handleDurationChange = (value) => {
    updateField(
      "durationValue",
      value === "" ? "" : Number(value)
    );
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors =
      validateForm(formData);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const finalData = {
    ...formData,

    code: normalizeCode(formData.code),

    name: formData.name.trim(),

    category: SERVICE_CATEGORY,

    durationMinutes: getDurationMinutes(
        formData.durationValue,
        formData.durationUnit
    ),

    pricingType:
        formData.pricingType ||
        "per_booking"
    };

    try {
      setLoading(true);
      await onSave(finalData);
    } finally {
      setLoading(false);
    }
  };


  const pricingValue =
    PRICING_OPTIONS.find(
      option =>
        option.value === formData.pricingMode
    ) || null;


  const currencyValue =
    currencyOptions.find(
      option =>
        option.value === formData.currency
    ) || null;


  const durationValue =
    DURATION_OPTIONS.find(
      option =>
        option.value === formData.durationUnit
    ) || null;


  return (
    <Modal
      size="lg"
      onClose={onClose}
    >
      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

        <div className="catalog-form-header">
          <div className="catalog-form-header-left">
            <h2>
              {isEditing
                ? "Editar servicio"
                : "Nuevo servicio"}
            </h2>

            <p>
              Configura la información, precio,
              duración y condiciones del servicio
              de transporte.
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


        <div className="catalog-form-body">

          <section className="catalog-form-section">
            <h3>
              Información del servicio
            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              <div className="catalog-form-group">
                <label htmlFor="service-type-code">
                    Código <span>*</span>
                </label>

                <input
                    id="service-type-code"
                    type="text"
                    value={formData.code}
                    onChange={event =>
                    updateField(
                        "code",
                        normalizeCodeInput(
                        event.target.value
                        )
                    )
                    }
                    placeholder="Ej: viaje-aeropuerto"
                    maxLength={50}
                    required
                />

                <small className="catalog-form-help">
                    Identificador público del servicio.
                    Usa letras, números y guiones.
                </small>

                {errors.code && (
                    <small className="catalog-form-error">
                    {errors.code}
                    </small>
                )}
                </div>


              <div className="catalog-form-group">
                <label htmlFor="service-type-name">
                  Nombre <span>*</span>
                </label>

                <input
                  id="service-type-name"
                  type="text"
                  value={formData.name}
                  onChange={event =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ej: Aeropuerto Liberia"
                  required
                />

                {errors.name && (
                  <small className="catalog-form-error">
                    {errors.name}
                  </small>
                )}
              </div>

            </div>
          </section>


          <section className="catalog-form-section">
            <h3>
              Configuración de precio
            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              <div className="catalog-form-group">
                <label>
                  Modo de precio <span>*</span>
                </label>

                <Select
                  classNamePrefix="react-select"
                  options={PRICING_OPTIONS}
                  value={pricingValue}
                  onChange={handlePricingModeChange}
                  isClearable={false}
                  isSearchable={false}
                />

                {errors.pricingMode && (
                  <small className="catalog-form-error">
                    {errors.pricingMode}
                  </small>
                )}
              </div>


              {formData.pricingMode === "fixed" && (
                <div className="catalog-form-group">
                  <label htmlFor="service-type-base-price">
                    Precio base
                    {formData.symbol &&
                      ` (${formData.symbol})`}
                    <span> *</span>
                  </label>

                  <input
                    id="service-type-base-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={event =>
                      updateField(
                        "basePrice",
                        event.target.value === ""
                          ? ""
                          : Number(
                              event.target.value
                            )
                      )
                    }
                    placeholder="0.00"
                    required
                  />

                  {errors.basePrice && (
                    <small className="catalog-form-error">
                      {errors.basePrice}
                    </small>
                  )}
                </div>
              )}

            </div>
          </section>


          <section className="catalog-form-section">
            <h3>
              Tipo de precio
            </h3>

            <div className="catalog-form-checkbox-group">

              <label>
                <input
                  type="radio"
                  name="pricingType"
                  value="per_booking"
                  checked={
                    formData.pricingType ===
                    "per_booking"
                  }
                  onChange={event =>
                    updateField(
                      "pricingType",
                      event.target.value
                    )
                  }
                />

                <span>
                  Por evento
                </span>
              </label>


              <label>
                <input
                  type="radio"
                  name="pricingType"
                  value="per_person"
                  checked={
                    formData.pricingType ===
                    "per_person"
                  }
                  onChange={event =>
                    updateField(
                      "pricingType",
                      event.target.value
                    )
                  }
                />

                <span>
                  Por persona
                </span>
              </label>

            </div>
          </section>


          <section className="catalog-form-section">

            <div className="catalog-form-section-header">
              <h3>
                Pago al chofer
              </h3>

              <div className="catalog-form-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        formData.staffPayment?.enabled
                      )
                    }
                    onChange={event =>
                      updateStaffPayment({
                        enabled:
                          event.target.checked,
                        value:
                          event.target.checked
                            ? formData.staffPayment?.value || ""
                            : ""
                      })
                    }
                  />

                  <span>
                    Habilitar pago
                  </span>
                </label>
              </div>
            </div>


            {formData.staffPayment?.enabled && (
              <div className="catalog-form-grid catalog-form-grid-2">

                <div className="catalog-form-group">
                  <label>
                    Tipo de pago
                  </label>

                  <div className="catalog-form-checkbox-group">

                    <label>
                      <input
                        type="radio"
                        name="staffPaymentType"
                        value="fixed"
                        checked={
                          formData.staffPayment.type ===
                          "fixed"
                        }
                        onChange={event =>
                          updateStaffPayment({
                            type: event.target.value,
                            value: ""
                          })
                        }
                      />

                      <span>
                        Monto fijo
                      </span>
                    </label>


                    <label>
                      <input
                        type="radio"
                        name="staffPaymentType"
                        value="percentage"
                        checked={
                          formData.staffPayment.type ===
                          "percentage"
                        }
                        onChange={event =>
                          updateStaffPayment({
                            type: event.target.value,
                            value: ""
                          })
                        }
                      />

                      <span>
                        Porcentaje (%)
                      </span>
                    </label>

                  </div>
                </div>


                <div className="catalog-form-group">
                  <label htmlFor="staff-payment-value">
                    {formData.staffPayment.type ===
                    "fixed"
                      ? "Monto"
                      : "Porcentaje"}

                    <span> *</span>
                  </label>

                  <input
                    id="staff-payment-value"
                    type="number"
                    min="0"
                    max={
                      formData.staffPayment.type ===
                      "percentage"
                        ? "100"
                        : undefined
                    }
                    step="0.01"
                    value={
                      formData.staffPayment.value ||
                      ""
                    }
                    placeholder={
                      formData.staffPayment.type ===
                      "fixed"
                        ? `Ej: ${
                            formData.symbol || ""
                          } 25`
                        : "Ej: 20 %"
                    }
                    onChange={event =>
                      updateStaffPayment({
                        value: event.target.value
                      })
                    }
                    required
                  />

                  {errors.staffPayment && (
                    <small className="catalog-form-error">
                      {errors.staffPayment}
                    </small>
                  )}
                </div>

              </div>
            )}

          </section>


          <section className="catalog-form-section">
            <h3>
              Configuración adicional
            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              <div className="catalog-form-group">
                <label>
                  Moneda <span>*</span>
                </label>

                <Select
                  classNamePrefix="react-select"
                  options={currencyOptions}
                  value={currencyValue}
                  onChange={handleCurrencyChange}
                  isClearable={false}
                  isSearchable={false}
                  placeholder="Selecciona una moneda"
                />

                {errors.currency && (
                  <small className="catalog-form-error">
                    {errors.currency}
                  </small>
                )}
              </div>


              <div className="catalog-form-group">
                <label htmlFor="service-type-color">
                  Color
                </label>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <input
                    id="service-type-color"
                    type="color"
                    value={formData.color}
                    onChange={event =>
                      updateField(
                        "color",
                        event.target.value
                      )
                    }
                    style={{
                      width: "52px",
                      height: "50px",
                      padding: "4px",
                      cursor: "pointer"
                    }}
                  />

                  <input
                    type="text"
                    value={formData.color}
                    onChange={event =>
                      updateField(
                        "color",
                        event.target.value
                      )
                    }
                    placeholder="#0a2a63"
                    style={{
                      flex: 1
                    }}
                  />
                </div>
              </div>

            </div>
          </section>


          <section className="catalog-form-section">
            <h3>
              Duración
            </h3>

            <div className="catalog-form-grid catalog-form-grid-2">

              <div className="catalog-form-group">
                <label htmlFor="service-type-duration">
                  Duración <span>*</span>
                </label>

                <input
                  id="service-type-duration"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.durationValue}
                  onChange={event =>
                    handleDurationChange(
                      event.target.value
                    )
                  }
                  placeholder="Ej: 2"
                  required
                />

                {errors.durationValue && (
                  <small className="catalog-form-error">
                    {errors.durationValue}
                  </small>
                )}
              </div>


              <div className="catalog-form-group">
                <label>
                  Unidad
                </label>

                <Select
                  classNamePrefix="react-select"
                  options={DURATION_OPTIONS}
                  value={durationValue}
                  onChange={option =>
                    updateField(
                      "durationUnit",
                      option?.value ||
                        "minutes"
                    )
                  }
                  isSearchable={false}
                  isClearable={false}
                />
              </div>

            </div>
          </section>


          <section className="catalog-form-section">
            <div className="catalog-form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={event =>
                    updateField(
                      "isActive",
                      event.target.checked
                    )
                  }
                />

                <span>
                  Servicio activo
                </span>
              </label>
            </div>
          </section>

        </div>


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
              {loading
                ? "Guardando..."
                : isEditing
                  ? "Actualizar"
                  : "Crear"}
            </button>

          </div>
        </div>

      </form>
    </Modal>
  );
};


export default ServiceTypesForm;