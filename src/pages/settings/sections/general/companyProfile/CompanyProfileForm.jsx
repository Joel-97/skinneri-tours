import {
  useEffect,
  useState
} from "react";

import Select from "react-select";

import {
  locationData,
  identificationOptions,
  timezoneOptions
} from "../../../../../constants/shared/locationData";

const countryOptions =
  Object.keys(locationData).map(
    (country) => ({
      value: country,
      label: country
    })
  );

const CompanyProfileForm = ({
  company,
  loading = false,
  uploadingLogo = false,
  onSave,
  onUploadLogo,
  onRemoveLogo
}) => {
  const [formData, setFormData] =
    useState({
      // ==================================================
      // GENERAL
      // ==================================================

      name: "",
      legalName: "",
      identificationType: "",
      identificationNumber: "",
      email: "",
      phone: "",
      website: "",

      // ==================================================
      // ADDRESS
      // ==================================================

      address: "",
      country: "",
      province: "",
      city: "",
      postalCode: "",

      // ==================================================
      // SYSTEM
      // ==================================================

      timezone: "",
      primaryColor: "#0A1E5E",

      // ==================================================
      // LOGO
      // ==================================================

      logoURL: ""
    });

  /* ======================================================
     PROVINCES
  ====================================================== */

  const provinceOptions =
    formData.country
      ? Object.keys(
          locationData[
            formData.country
          ]?.provinces || {}
        ).map((province) => ({
          value: province,
          label: province
        }))
      : [];

  /* ======================================================
     CITIES
  ====================================================== */

  const cityOptions =
    formData.country &&
    formData.province
      ? (
          locationData[
            formData.country
          ]?.provinces[
            formData.province
          ] || []
        ).map((city) => ({
          value: city,
          label: city
        }))
      : [];

  /* ======================================================
     LOAD COMPANY DATA
  ====================================================== */

  useEffect(() => {
    if (!company) {
      return;
    }

    setFormData({
      name:
        company.name || "",

      legalName:
        company.legalName || "",

      identificationType:
        company.identificationType || "",

      identificationNumber:
        company.identificationNumber || "",

      email:
        company.email || "",

      phone:
        company.phone || "",

      website:
        company.website || "",

      address:
        company.address || "",

      country:
        company.country || "",

      province:
        company.province || "",

      city:
        company.city || "",

      postalCode:
        company.postalCode || "",

      timezone:
        company.timezone || "",

      primaryColor:
        company.primaryColor ||
        "#0A1E5E",

      logoURL:
        company.logoURL || ""
    });
  }, [company]);

  /* ======================================================
     HANDLE CHANGE
  ====================================================== */

  const handleChange = (event) => {
    const {
      name,
      value
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  /* ======================================================
     HANDLE SAVE
  ====================================================== */

  const handleSave = async (event) => {
    event.preventDefault();

    await onSave(formData);
  };

  /* ======================================================
     HANDLE LOGO UPLOAD
  ====================================================== */

  const handleLogoUpload = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const updatedCompany =
        await onUploadLogo(file);

      if (updatedCompany) {
        setFormData((previous) => ({
          ...previous,
          logoURL:
            updatedCompany.logoURL || ""
        }));
      }
    } catch (error) {
      console.error(
        "Error procesando logo:",
        error
      );
    } finally {
      /*
       * Allows selecting the same file again
       * after an upload attempt.
       */
      event.target.value = "";
    }
  };

  /* ======================================================
     HANDLE REMOVE LOGO
  ====================================================== */

  const handleRemoveLogo = async () => {
    try {
      await onRemoveLogo(
        formData.logoURL
      );

      setFormData((previous) => ({
        ...previous,
        logoURL: ""
      }));
    } catch (error) {
      console.error(
        "Error removing logo:",
        error
      );
    }
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <form
      className="company-profile-container"
      onSubmit={handleSave}
    >

      {/* ======================================================
          PAGE INTRO
      ====================================================== */}

      <div className="company-page-intro">

        <div className="company-page-intro-content">

          <h3>
            Perfil de empresa
          </h3>

          <p>
            Configuración general y branding
            de la empresa.
          </p>

        </div>

      </div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="company-profile-header">

        <div className="company-top-info">

          {/* ==================================================
              LOGO
          ================================================== */}

          <div
            className="company-avatar"
            style={{
              background:
                formData.logoURL
                  ? "transparent"
                  : formData.primaryColor
            }}
          >

            {formData.logoURL ? (

              <img
                src={formData.logoURL}
                alt="Company Logo"
                className="company-logo-preview"
                draggable={false}
              />

            ) : (

              formData.name?.charAt(0) ||
              "C"

            )}

          </div>

          <div>

            <h3>
              {formData.name ||
                "Company Name"}
            </h3>

            <span>
              Empresa activa
            </span>

          </div>

        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading
            ? "Guardando..."
            : "Guardar cambios"}
        </button>

      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="company-main-grid">

        {/* ======================================================
            GENERAL
        ====================================================== */}

        <div className="company-card company-card-large">

          <div className="company-card-header">

            <h4>
              Información general
            </h4>

            <p>
              Datos principales de la empresa.
            </p>

          </div>

          <div className="company-form-grid">

            {/* ROW 1 */}

            <div className="company-form-group">

              <label>
                Nombre empresa
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

            <div className="company-form-group">

              <label>
                Razón social
              </label>

              <input
                type="text"
                name="legalName"
                value={
                  formData.legalName
                }
                onChange={handleChange}
                disabled={loading}
              />

            </div>

            {/* ROW 2 */}

            <div className="company-form-group">

              <label>
                Tipo identificación
              </label>

              <Select
                options={
                  identificationOptions
                }
                isSearchable={false}
                isDisabled={loading}
                value={
                  identificationOptions.find(
                    (option) =>
                      option.value ===
                      formData.identificationType
                  ) || null
                }
                onChange={(
                  selectedOption
                ) =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      identificationType:
                        selectedOption?.value ||
                        ""
                    })
                  )
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
              />

            </div>

            <div className="company-form-group">

              <label>
                Número identificación
              </label>

              <input
                type="text"
                name="identificationNumber"
                value={
                  formData.identificationNumber
                }
                onChange={handleChange}
                disabled={loading}
              />

            </div>

            {/* ROW 3 */}

            <div className="company-form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

            <div className="company-form-group">

              <label>
                Teléfono
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

          </div>

        </div>

        {/* ======================================================
            BRANDING
        ====================================================== */}

        <div className="company-card">

          <div className="company-card-header">

            <h4>
              Apariencia
            </h4>

            <p>
              Configuración visual.
            </p>

          </div>

          <div className="company-form-grid">

            {/* ==================================================
                LOGO
            ================================================== */}

            <div className="company-form-group company-full-width">

              <label>
                Logo empresa
              </label>

              <div className="company-logo-upload">

                {formData.logoURL && (

                  <img
                    src={formData.logoURL}
                    alt="Company Logo"
                    className="company-logo-large-preview"
                  />

                )}

                <div className="company-logo-actions">

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() =>
                      document
                        .getElementById(
                          "companyLogoInput"
                        )
                        ?.click()
                    }
                    disabled={
                      loading ||
                      uploadingLogo
                    }
                  >
                    {uploadingLogo
                      ? "Subiendo..."
                      : "Subir logo"}
                  </button>

                  <input
                    id="companyLogoInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={
                      handleLogoUpload
                    }
                    disabled={
                      loading ||
                      uploadingLogo
                    }
                  />

                  {formData.logoURL && (
                    <button
                      type="button"
                      className="company-remove-btn"
                      onClick={
                        handleRemoveLogo
                      }
                      disabled={
                        loading ||
                        uploadingLogo
                      }
                    >
                      Eliminar
                    </button>
                  )}

                </div>

              </div>

            </div>

            {/* ==================================================
                TIMEZONE
            ================================================== */}

            <div className="company-form-group">

              <label>
                Timezone
              </label>

              <Select
                options={
                  timezoneOptions
                }
                isSearchable={false}
                isDisabled={loading}
                value={
                  timezoneOptions.find(
                    (option) =>
                      option.value ===
                      formData.timezone
                  ) || null
                }
                onChange={(
                  selectedOption
                ) =>
                  setFormData(
                    (previous) => ({
                      ...previous,
                      timezone:
                        selectedOption?.value ||
                        ""
                    })
                  )
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
              />

            </div>

            {/* ==================================================
                WEBSITE
            ================================================== */}

            <div className="company-form-group">

              <label>
                Website
              </label>

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={loading}
              />

            </div>

            {/* ==================================================
                PRIMARY COLOR
            ================================================== */}

            <div className="company-form-group">

              <label>
                Color principal
              </label>

              <div className="company-color-wrapper">

                <input
                  type="color"
                  name="primaryColor"
                  value={
                    formData.primaryColor
                  }
                  onChange={handleChange}
                  className="company-color-input"
                  disabled={loading}
                />

                <span>
                  {formData.primaryColor}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          ADDRESS
      ====================================================== */}

      <div className="company-card company-address-card">

        <div className="company-card-header">

          <h4>
            Dirección
          </h4>

          <p>
            Ubicación principal de la empresa.
          </p>

        </div>

        <div className="company-form-grid address-grid">

          {/* COUNTRY */}

          <div className="company-form-group">

            <label>
              País
            </label>

            <Select
              options={countryOptions}
              isSearchable={false}
              isDisabled={loading}
              value={
                countryOptions.find(
                  (option) =>
                    option.value ===
                    formData.country
                ) || null
              }
              onChange={(
                selectedOption
              ) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    country:
                      selectedOption?.value ||
                      "",
                    province: "",
                    city: ""
                  })
                )
              }
              placeholder="Seleccionar..."
              className="react-select-container"
              classNamePrefix="react-select"
            />

          </div>

          {/* PROVINCE */}

          <div className="company-form-group">

            <label>
              Provincia
            </label>

            <Select
              options={provinceOptions}
              isSearchable={false}
              isDisabled={
                !formData.country ||
                loading
              }
              value={
                provinceOptions.find(
                  (option) =>
                    option.value ===
                    formData.province
                ) || null
              }
              onChange={(
                selectedOption
              ) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    province:
                      selectedOption?.value ||
                      "",
                    city: ""
                  })
                )
              }
              placeholder="Seleccionar..."
              className="react-select-container"
              classNamePrefix="react-select"
            />

          </div>

          {/* CITY */}

          <div className="company-form-group">

            <label>
              Ciudad
            </label>

            <Select
              options={cityOptions}
              isSearchable={false}
              isDisabled={
                !formData.province ||
                loading
              }
              value={
                cityOptions.find(
                  (option) =>
                    option.value ===
                    formData.city
                ) || null
              }
              onChange={(
                selectedOption
              ) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    city:
                      selectedOption?.value ||
                      ""
                  })
                )
              }
              placeholder="Seleccionar..."
              className="react-select-container"
              classNamePrefix="react-select"
            />

          </div>

          {/* POSTAL CODE */}

          <div className="company-form-group">

            <label>
              Código postal
            </label>

            <input
              type="text"
              name="postalCode"
              value={
                formData.postalCode
              }
              onChange={handleChange}
              disabled={loading}
            />

          </div>

          {/* ADDRESS */}

          <div className="company-form-group company-full-width">

            <label>
              Dirección exacta
            </label>

            <input
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={handleChange}
              disabled={loading}
            />

          </div>

        </div>

      </div>

    </form>
  );
};

export default CompanyProfileForm;