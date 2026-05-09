import { useEffect, useState } from "react";
import Select from "react-select";

import { useAuth } from "../../../../context/AuthContext";
import { updateCompanyData } from "../../../../services/superAdmin/companyProfile";
import { locationData, identificationOptions, timezoneOptions } from "../../../../constants/locationData";
import { notifySuccess, notifyError } from "../../../../services/notificationService";

import "../../../../style/settings/general/companyProfile.css";

const countryOptions =
  Object.keys(locationData).map(
    (country) => ({
      value: country,
      label: country
    })
);

const CompanyProfileSection = () => {
    const {company, companyId, setCompany} = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

    name: "",
    legalName: "",

    identificationType: "",
    identificationNumber: "",

    email: "",
    phone: "",
    website: "",

    address: "",

    country: "",
    province: "",
    city: "",

    postalCode: "",

    timezone: "",

    primaryColor: "#0A1E5E"
    });

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

    // ======================================================
    // LOAD COMPANY DATA
    // ======================================================

    useEffect(() => {

    if (!company) return;

    setFormData({
        // ==================================================
        // GENERAL
        // ==================================================

        name: company.name || "",

        legalName: company.legalName || "",

        identificationType: company.identificationType || "",

        identificationNumber: company.identificationNumber || "",

        email: company.email || "",

        phone: company.phone || "",

        website: company.website || "",

        // ==================================================
        // ADDRESS
        // ==================================================

        address: company.address || "",

        country: company.country || "",

        province: company.province || "",

        city: company.city || "",

        postalCode: company.postalCode || "",

        // ==================================================
        // SYSTEM
        // ==================================================

        timezone: company.timezone || "",

        primaryColor: company.primaryColor || "#0A1E5E"
    });

    }, [company]);

  // ======================================================
  // HANDLE CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async () => {
    try {
      setLoading(true);

      await updateCompanyData(
        companyId,
        formData
      );

      setCompany((prev) => ({
        ...prev,
        ...formData
      }));

      notifySuccess(
        "Perfil actualizado",
        "La información de la empresa fue actualizada correctamente."
      );

    } catch (error) {
      console.error(
        "Error actualizando empresa:",
        error
      );

      notifyError(
        "Error",
        "No se pudo actualizar la información de la empresa."
      );

    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="company-profile-container">

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

            <div
            className="company-avatar"
            style={{
                background:
                formData.primaryColor
            }}
            >
            {formData.name?.charAt(0) || "C"}
            </div>

            <div>

            <h3>
                {formData.name || "Company Name"}
            </h3>

            <span>
                Empresa activa
            </span>

            </div>

        </div>

        <button
            className="btn-primary"
            onClick={handleSave}
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

                <label>Nombre empresa</label>

                <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                />

            </div>

            <div className="company-form-group">

                <label>Razón social</label>

                <input
                type="text"
                name="legalName"
                value={formData.legalName}
                onChange={handleChange}
                />

            </div>

            {/* ROW 2 */}

            <div className="company-form-group">

                <label>
                Tipo identificación
                </label>

                <Select
                options={identificationOptions}
                isSearchable={false}
                value={
                    identificationOptions.find(
                    (option) =>
                        option.value ===
                        formData.identificationType
                    ) || null
                }
                onChange={(selectedOption) =>
                    setFormData((prev) => ({
                    ...prev,
                    identificationType:
                        selectedOption?.value || ""
                    }))
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
                />

            </div>

            {/* ROW 3 */}

            <div className="company-form-group">

                <label>Email</label>

                <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                />

            </div>

            <div className="company-form-group">

                <label>Teléfono</label>

                <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                />

            </div>

            </div>

        </div>

        {/* ======================================================
            BRANDING
        ====================================================== */}

        <div className="company-card">

            <div className="company-card-header">

            <h4>Apariencia</h4>

            <p>
                Configuración visual.
            </p>

            </div>

            <div className="company-form-grid">

            <div className="company-form-group">

                <label>Timezone</label>

                <Select
                options={timezoneOptions}
                isSearchable={false}
                value={
                    timezoneOptions.find(
                    (option) =>
                        option.value ===
                        formData.timezone
                    ) || null
                }
                onChange={(selectedOption) =>
                    setFormData((prev) => ({
                    ...prev,
                    timezone:
                        selectedOption?.value || ""
                    }))
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
                />

            </div>

            <div className="company-form-group">

                <label>Website</label>

                <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                />

            </div>

            <div className="company-form-group">

                <label>Color principal</label>

                <div className="company-color-wrapper">

                <input
                    type="color"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    className="company-color-input"
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

            <h4>Dirección</h4>

            <p>
            Ubicación principal de la empresa.
            </p>

        </div>

        <div className="company-form-grid address-grid">

            <div className="company-form-group">

            <label>País</label>

            <Select
                options={countryOptions}
                isSearchable={false}
                value={
                countryOptions.find(
                    (option) =>
                    option.value ===
                    formData.country
                ) || null
                }
                onChange={(selectedOption) =>
                setFormData((prev) => ({
                    ...prev,
                    country:
                    selectedOption?.value || "",
                    province: "",
                    city: ""
                }))
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
            />

            </div>

            <div className="company-form-group">

            <label>Provincia</label>

            <Select
                options={provinceOptions}
                isSearchable={false}
                isDisabled={!formData.country}
                value={
                provinceOptions.find(
                    (option) =>
                    option.value ===
                    formData.province
                ) || null
                }
                onChange={(selectedOption) =>
                setFormData((prev) => ({
                    ...prev,
                    province:
                    selectedOption?.value || "",
                    city: ""
                }))
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
            />

            </div>

            <div className="company-form-group">

            <label>Ciudad</label>

            <Select
                options={cityOptions}
                isSearchable={false}
                isDisabled={!formData.province}
                value={
                cityOptions.find(
                    (option) =>
                    option.value ===
                    formData.city
                ) || null
                }
                onChange={(selectedOption) =>
                setFormData((prev) => ({
                    ...prev,
                    city:
                    selectedOption?.value || ""
                }))
                }
                placeholder="Seleccionar..."
                className="react-select-container"
                classNamePrefix="react-select"
            />

            </div>

            <div className="company-form-group">

            <label>Código postal</label>

            <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
            />

            </div>

            <div className="company-form-group company-full-width">

            <label>Dirección exacta</label>

            <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
            />

            </div>

        </div>

        </div>

    </div>
    );
};

export default CompanyProfileSection;