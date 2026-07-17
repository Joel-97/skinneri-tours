import { useEffect, useMemo, useState } from "react";

import Select from "react-select";

import Modal from "../../../../../components/general/modal";

import {
  getLocations
} from "../../../../../services/settings/transportation/locationsService";

import "../../../../../style/settings/transportation/catalog/catalogForm.css";

/* ======================================================
   EMPTY FORM
====================================================== */

const EMPTY_FORM = {

  code: "",

  origin: null,

  destination: null

};

/* ======================================================
   COMPONENT
====================================================== */

const RouteForm = ({

  companyId,

  route = null,

  onClose,

  onSave

}) => {

  /* ======================================================
     STATE
  ====================================================== */

  const isEditing = useMemo(
    () => !!route,
    [route]
  );

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [places, setPlaces] = useState([]);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  /* ======================================================
     LOAD PLACES
  ====================================================== */

  useEffect(() => {

    const loadPlaces = async () => {

      try {

        const data = await getLocations(companyId);

        setPlaces(

          data

            .filter(place => place.isActive)

            .sort((a, b) =>

              a.name.localeCompare(b.name)

            )

        );

      }

      catch (error) {

        console.error(error);

      }

    };

    if (companyId) {

      loadPlaces();

    }

  }, [companyId]);

  /* ======================================================
     PLACE OPTIONS
  ====================================================== */

  const placeOptions = useMemo(() => (

    places.map(place => ({

      ...place,

      value: place.id,

      label: place.name

    }))

  ), [places]);

  /* ======================================================
     LOAD DATA
  ====================================================== */

  useEffect(() => {

    if (route) {

      const origin = places.find(

        place =>

          place.id === route.origin?.id

      );

      const destination = places.find(

        place =>

          place.id === route.destination?.id

      );

      setFormData({

        code:

          route.code || "",

        origin:

          origin

            ? {

                ...origin,

                value: origin.id,

                label: origin.name

              }

            : null,

        destination:

          destination

            ? {

                ...destination,

                value: destination.id,

                label: destination.name

              }

            : null

      });

    }

    else {

      setFormData(

        EMPTY_FORM

      );

    }

    setErrors({});

  }, [

    route,

    places

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

    if (!formData.code.trim()) {

      newErrors.code =
        "El código es obligatorio.";

    }

    if (!formData.origin) {

      newErrors.origin =
        "Seleccione un origen.";

    }

    if (!formData.destination) {

      newErrors.destination =
        "Seleccione un destino.";

    }

    if (

      formData.origin &&

      formData.destination &&

      formData.origin.id ===

      formData.destination.id

    ) {

      newErrors.destination =
        "El origen y el destino no pueden ser iguales.";

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

        code:

          formData.code

            .trim()

            .toUpperCase(),

        origin: {

          id: formData.origin.id,

          name: formData.origin.name

        },

        destination: {

          id: formData.destination.id,

          name: formData.destination.name

        }

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
      size="md"
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

                  ? "Editar ruta"

                  : "Nueva ruta"

              }

            </h2>

            <p>

              {

                isEditing

                  ? "Actualiza la información de la ruta."

                  : "Completa la información para registrar una nueva ruta."

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

          <section className="catalog-form-section">

            <h3>

              Información general

            </h3>

            <div className="catalog-form-grid catalog-form-grid-1">

              {/* ==========================================
                  CODE
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Código <span>*</span>

                </label>

                <input
                  type="text"
                  value={formData.code}
                  placeholder="Ej. HDS-NOS"
                  onChange={(e)=>

                    handleChange(

                      "code",

                      e.target.value.toUpperCase()

                    )

                  }
                />

                {

                  errors.code && (

                    <small>

                      {errors.code}

                    </small>

                  )

                }

              </div>

              {/* ==========================================
                  ORIGIN
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Origen <span>*</span>

                </label>
                <Select
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                  options={placeOptions}
                  value={formData.origin}
                  onChange={(option)=> handleChange("origin",option)}
                  placeholder="Seleccione un origen"
                  isClearable
                  menuPosition="fixed"
                />

                {

                  errors.origin && (

                    <small>

                      {errors.origin}

                    </small>

                  )

                }

              </div>

              {/* ==========================================
                  DESTINATION
              ========================================== */}

              <div className="catalog-form-group">

                <label>

                  Destino <span>*</span>

                </label>

                <Select
                  className="catalog-select"
                  classNamePrefix="catalog-select"
                  options={placeOptions}
                  value={formData.destination}
                  onChange={(option)=> handleChange("destination",option)}
                  placeholder="Seleccione un destino"
                  isClearable
                  menuPosition="fixed"
                />

                {

                  errors.destination && (

                    <small>

                      {errors.destination}

                    </small>

                  )

                }

              </div>

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

export default RouteForm;