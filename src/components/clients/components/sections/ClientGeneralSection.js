import React from "react";
import Select from "react-select";

import {
  selectPortal
} from "../../constants/clientConstants";

import {
  CLIENT_TYPE_OPTIONS,
} from "../../constants/clientTypeOptions";

import {
  COUNTRY_OPTIONS
} from "../../constants/countryOptions";

import {
  LANGUAGE_OPTIONS
} from "../../constants/languageOptions";

export default function ClientGeneralSection({ controller }) {

  const {

    form,

    actions

  } = controller;

  const {

    data,

    setData

  } = form;

  const {

    handleChange

  } = actions;

  return (

    <div className="client-modal-section client-section-card">

      <h4 className="client-section-title">

        Información general

      </h4>

      {/* =========================
          TIPO Y NOMBRE
      ========================= */}

      <div className="client-form-grid client-two-columns">

        <div className="client-form-field">

          <label className="client-field-label">

            Tipo de cliente

          </label>

          <Select

            {...selectPortal}

            options={CLIENT_TYPE_OPTIONS}

            value={

              CLIENT_TYPE_OPTIONS.find(

                option => option.value === data.type

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                type: selectedOption?.value || ""

              }))

            }

            placeholder="Seleccione un tipo"

            isSearchable={false}

          />

        </div>

        <div className="client-form-field">

          <label className="client-field-label">

            Nombre <span className="client-required">*</span>

          </label>

          <input

            type="text"

            name="name"

            value={data.name || ""}

            onChange={handleChange}

            placeholder="Nombre del cliente"

          />

        </div>

      </div>

      {/* =========================
          TELÉFONO Y EMAIL
      ========================= */}

      <div className="client-form-grid client-two-columns">

        <div className="client-form-field">

          <label className="client-field-label">

            Teléfono

          </label>

          <input

            type="text"

            name="phone"

            value={data.phone || ""}

            onChange={handleChange}

            placeholder="Ej. +506 8888-8888"

          />

        </div>

        <div className="client-form-field">

          <label className="client-field-label">

            Email

          </label>

          <input

            type="email"

            name="email"

            value={data.email || ""}

            onChange={handleChange}

            placeholder="correo@empresa.com"

          />

        </div>

      </div>

      {/* =========================
          WHATSAPP Y PAÍS
      ========================= */}

      <div className="client-form-grid client-two-columns">

        <div className="client-form-field">

          <label className="client-field-label">

            WhatsApp

          </label>

          <input

            type="text"

            name="whatsapp"

            value={data.whatsapp || ""}

            onChange={handleChange}

            placeholder="Número de WhatsApp"

          />

        </div>

        <div className="client-form-field">

          <label className="client-field-label">

            País

          </label>

          <Select

            {...selectPortal}

            options={COUNTRY_OPTIONS}

            value={

              COUNTRY_OPTIONS.find(

                option => option.value === data.country

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                country: selectedOption?.value || ""

              }))

            }

            placeholder="Seleccionar país"

            isClearable

            isSearchable

          />

        </div>

      </div>

      {/* =========================
          IDIOMA Y ESTADO
      ========================= */}

      <div className="client-form-grid client-two-columns">

        <div className="client-form-field">

          <label className="client-field-label">

            Idioma preferido

          </label>

          <Select

            {...selectPortal}

            options={LANGUAGE_OPTIONS}

            value={

              LANGUAGE_OPTIONS.find(

                option => option.value === data.preferredLanguage

              ) || null

            }

            onChange={(selectedOption) =>

              setData(prev => ({

                ...prev,

                preferredLanguage: selectedOption?.value || ""

              }))

            }

            placeholder="Seleccionar idioma"

            isSearchable={false}

          />

        </div>

        <div className="client-form-field">

          <label className="client-field-label">

            Estado

          </label>

          <label className="client-checkbox-field">

            <input

              type="checkbox"

              checked={data.status === "active"}

              onChange={(e) =>

                setData(prev => ({

                  ...prev,

                  status: e.target.checked

                    ? "active"

                    : "inactive"

                }))

              }

            />

            <span>

              {data.status === "active"

                ? "Activo"

                : "Inactivo"}

            </span>

          </label>

        </div>

      </div>

    </div>

  );

}