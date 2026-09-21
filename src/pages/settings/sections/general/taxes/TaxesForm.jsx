import {
  useEffect,
  useMemo,
  useState
} from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

const EMPTY_FORM = {
  name: "",
  rate: "",
  type: "percentage",
  currency: "",
  isDefault: false,
  isActive: true
};

const TYPE_OPTIONS = [
  {
    value: "percentage",
    label: "Porcentaje (%)"
  },
  {
    value: "fixed",
    label: "Monto fijo"
  }
];

/* ===============================
   BUILD INITIAL FORM
================================ */

const buildInitialForm = (tax) => {
  if (!tax) {
    return EMPTY_FORM;
  }

  return {
    name: tax.name || "",
    rate: tax.rate ?? "",
    type: tax.type || "percentage",
    currency: tax.currency || "",
    isDefault: !!tax.isDefault,
    isActive: tax.isActive !== false
  };
};

/* ===============================
   NORMALIZATION
================================ */

const normalizeText = (value = "") => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

/* ===============================
   VALIDATION
================================ */

const validateForm = (formData) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name =
      "El nombre es obligatorio.";
  }

  if (
    formData.rate === "" ||
    formData.rate === null ||
    Number.isNaN(Number(formData.rate))
  ) {
    errors.rate =
      "La tasa es obligatoria.";
  } else if (
    Number(formData.rate) <= 0
  ) {
    errors.rate =
      "La tasa debe ser mayor que cero.";
  }

  if (!formData.type) {
    errors.type =
      "Debe seleccionar un tipo.";
  }

  if (
    formData.type === "fixed" &&
    !formData.currency
  ) {
    errors.currency =
      "Debe seleccionar una moneda.";
  }

  if (
    formData.type === "percentage" &&
    Number(formData.rate) > 100
  ) {
    errors.rate =
      "El porcentaje no puede ser mayor que 100.";
  }

  return errors;
};

/* ===============================
   COMPONENT
================================ */

const TaxesForm = ({
  tax = null,
  currencies = [],
  onClose,
  onSave
}) => {
  const isEditing = !!tax;

  const [formData, setFormData] =
    useState(
      buildInitialForm(tax)
    );

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  /* ===============================
     CURRENCY OPTIONS
  ================================ */

  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        value: currency.code,
        label: `${currency.name} (${currency.symbol})`
      })),
    [currencies]
  );

  /* ===============================
     SYNC FORM
  ================================ */

  useEffect(() => {
    setFormData(
      buildInitialForm(tax)
    );

    setErrors({});
  }, [tax]);

  /* ===============================
     FIELD CHANGE
  ================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined
    }));
  };

  /* ===============================
     TYPE CHANGE
  ================================ */

  const handleTypeChange = (
    selectedOption
  ) => {
    const type =
      selectedOption?.value || "";

    setFormData((previous) => ({
      ...previous,
      type,

      /*
       * Currency is only relevant
       * for fixed taxes.
       */
      currency:
        type === "fixed"
          ? previous.currency
          : ""
    }));

    setErrors((previous) => ({
      ...previous,
      type: undefined,
      currency: undefined
    }));
  };

  /* ===============================
     CURRENCY CHANGE
  ================================ */

  const handleCurrencyChange = (
    selectedOption
  ) => {
    setFormData((previous) => ({
      ...previous,
      currency:
        selectedOption?.value || ""
    }));

    setErrors((previous) => ({
      ...previous,
      currency: undefined
    }));
  };

  /* ===============================
     SUBMIT
  ================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors =
      validateForm(formData);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    const normalizedData = {
      name: normalizeText(
        formData.name
      ),

      rate: Number(
        formData.rate
      ),

      type: formData.type,

      currency:
        formData.type === "fixed"
          ? formData.currency
          : "",

      isDefault:
        !!formData.isDefault,

      isActive:
        !!formData.isActive
    };

    try {
      setLoading(true);

      await onSave(
        normalizedData
      );
    } catch (error) {
      console.error(
        "Error saving tax:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  ================================ */

  return (
    <Modal 
      size="lg"
      onClose={onClose}>

      <form
        className="catalog-form"
        onSubmit={handleSubmit}
      >

        {/* =========================
            HEADER
        ========================== */}

        <div className="catalog-form-header">

          <div className="catalog-form-header-left">

            <h4>
              {isEditing
                ? "Editar impuesto"
                : "Nuevo impuesto"}
            </h4>

            <p>
              {isEditing
                ? "Actualiza la información del impuesto."
                : "Agrega un nuevo impuesto a la empresa."}
            </p>

          </div>

          <button
            type="button"
            className="catalog-form-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>

        </div>

        {/* =========================
            BODY
        ========================== */}

        <div className="catalog-form-body">

          <div className="catalog-form-section">

            <div className="catalog-form-grid catalog-form-grid-2">

              {/* NAME */}

              <div className="catalog-form-group">

                <label htmlFor="tax-name">
                  Nombre del impuesto
                </label>

                <input
                  id="tax-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej. IVA"
                  disabled={loading}
                  aria-invalid={
                    !!errors.name
                  }
                />

                {errors.name && (
                  <small>
                    {errors.name}
                  </small>
                )}

              </div>

              {/* RATE */}

              <div className="catalog-form-group">

                <label htmlFor="tax-rate">
                  Tasa
                </label>

                <input
                  id="tax-rate"
                  name="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder={
                    formData.type ===
                    "percentage"
                      ? "Ej. 13"
                      : "Ej. 5000"
                  }
                  disabled={loading}
                  aria-invalid={
                    !!errors.rate
                  }
                />

                {errors.rate && (
                  <small>
                    {errors.rate}
                  </small>
                )}

              </div>

              {/* TYPE */}

              <div className="catalog-form-group">

                <label htmlFor="tax-type">
                  Tipo
                </label>

                <Select
                  inputId="tax-type"
                  options={TYPE_OPTIONS}
                  value={
                    TYPE_OPTIONS.find(
                      (option) =>
                        option.value ===
                        formData.type
                    ) || null
                  }
                  onChange={
                    handleTypeChange
                  }
                  placeholder="Seleccionar tipo"
                  isSearchable={false}
                  isClearable={false}
                  isDisabled={loading}
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                />

                {errors.type && (
                  <small>
                    {errors.type}
                  </small>
                )}

              </div>

              {/* CURRENCY */}

              {formData.type === "fixed" && (
                <div className="catalog-form-group">

                  <label htmlFor="tax-currency">
                    Moneda
                  </label>

                  {currencyOptions.length ===
                  0 ? (

                    <small>
                      No hay monedas activas.
                      Configura una en Settings
                      → Monedas.
                    </small>

                  ) : (

                    <Select
                      inputId="tax-currency"
                      options={currencyOptions}
                      value={
                        currencyOptions.find(
                          (option) =>
                            option.value ===
                            formData.currency
                        ) || null
                      }
                      onChange={
                        handleCurrencyChange
                      }
                      placeholder="Seleccionar moneda"
                      isClearable
                      isDisabled={loading}
                      className="catalog-select"
                      classNamePrefix="catalog-select"
                    />

                  )}

                  {errors.currency && (
                    <small>
                      {errors.currency}
                    </small>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* =========================
              OPTIONS
          ========================== */}

          <div className="catalog-form-section">

            {/* DEFAULT */}

            <div className="catalog-form-checkbox">

              <label>

                <input
                  type="checkbox"
                  name="isDefault"
                  checked={
                    formData.isDefault
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                />

                <span>
                  Establecer como predeterminado
                </span>

              </label>

            </div>

            {/* STATUS */}

            <div className="catalog-form-checkbox">

              <label>

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={
                    handleChange
                  }
                  disabled={loading}
                />

                <span>
                  Activo
                </span>

              </label>

            </div>

          </div>

        </div>

        {/* =========================
            FOOTER
        ========================== */}

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

export default TaxesForm;