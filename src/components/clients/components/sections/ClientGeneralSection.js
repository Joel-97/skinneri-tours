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

    <div className="modal-section section-card">

      <h4 className="section-title">

        Información general

      </h4>

      {/* =========================
          TIPO Y NOMBRE
      ========================= */}

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

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

        <div className="form-field">

          <label className="field-label">

            Nombre <span className="required">*</span>

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

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

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

        <div className="form-field">

          <label className="field-label">

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

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

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

        <div className="form-field">

          <label className="field-label">

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

      <div className="form-grid two-columns">

        <div className="form-field">

          <label className="field-label">

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

        <div className="form-field">

          <label className="field-label">

            Estado

          </label>

          <label className="checkbox-field">

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