import React from "react";

import Modal from "../general/modal";
import Avatar from "../general/Avatar";
import Button from "../general/button";

import useCompanyModalController from "./controllers/useCompanyModalController";

import CompanyGeneralSection from "./sections/companies/CompanyGeneralSection";
import CompanyAddressSection from "./sections/companies/CompanyAddressSection";
import CompanyConfigurationSection from "./sections/companies/CompanyConfigurationSection";
import CompanyPlatformSection from "./sections/companies/CompanyPlatformSection";

import "../../style/superAdmin/companyModal.css";

export default function CompanyModal({

  open,

  mode = "view",

  company,

  onClose,

  onEdit,

  onSave,

  onDelete

}) {

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller = useCompanyModalController({

    company,

    open,

    mode

  });

  const {

    form

  } = controller;

  const {

    data

  } = form;

  /*
  ==========================================================
  SETTINGS
  ==========================================================
  */

  if (!open) {

    return null;

  }

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleSave = () => {

    onSave(data);

  };

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <Modal

      onClose={onClose}

      size="xl"

    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="company-modal-header">

        <div className="company-modal-title">

          <h2>

            {

              mode === "create"

                ? "Nueva empresa"

                : mode === "edit"

                  ? "Editar empresa"

                  : "Empresa"

            }

          </h2>

        </div>

        <button

          className="company-modal-close"

          onClick={onClose}

        >

          ✕

        </button>

      </div>

      {/* ======================================================
          LOGO
      ====================================================== */}

      <div className="company-modal-logo">

        <Avatar

          src={data.logoURL}

          name={data.name}

          size={90}

        />

      </div>

      {/* ======================================================
          GENERAL
      ====================================================== */}

      <CompanyGeneralSection

        controller={controller}

      />

      {/* ======================================================
          ADDRESS
      ====================================================== */}

      <CompanyAddressSection

        controller={controller}

      />

      {/* ======================================================
          CONFIGURATION
      ====================================================== */}

      <CompanyConfigurationSection

        controller={controller}

      />

      {/* ======================================================
          PLATFORM
      ====================================================== */}

      <CompanyPlatformSection

        controller={controller}

      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="company-modal-footer">

        <Button

          onClick={onClose}

        >

          Cerrar

        </Button>

        {

          mode === "view" && (

            <Button

              onClick={onEdit}

            >

              Editar

            </Button>

          )

        }

        {

          mode === "edit" && (

            <Button

              onClick={onDelete}

              backgroundColor="#dc2626"

              textColor="#FFFFFF"

            >

              Eliminar

            </Button>

          )

        }

        {

          (

            mode === "create" ||

            mode === "edit"

          ) && (

            <Button

              onClick={handleSave}

            >

              Guardar

            </Button>

          )

        }

      </div>

    </Modal>

  );

}