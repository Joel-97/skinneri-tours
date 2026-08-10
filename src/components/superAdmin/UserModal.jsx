import React from "react";

import Modal from "../general/modal";
import Avatar from "../general/Avatar";
import Button from "../general/button";

import useUserModalController from "./controllers/useUserModalController";
import useCompanies from "../../hooks/company/useCompanies";

import UserGeneralSection from "./sections/users/UserGeneralSection";
import UserCompanySection from "./sections/users/UserCompanySection";
import UserSecuritySection from "./sections/users/UserSecuritySection";

import "../../style/superAdmin/userModal.css";

export default function UserModal({

  open,

  mode = "view",

  user,

  onClose,

  onEdit,

  onSave

}) {

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller = useUserModalController({

    user,

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
    COMPANIES
    ==========================================================
    */

    const {

    companies

    } = useCompanies();

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

    onSave(

      data

    );

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

      <div className="user-modal-header">

        <div className="user-modal-title">

          <h2>

            {

              mode === "create"

                ? "Nuevo usuario"

                : mode === "edit"

                  ? "Editar usuario"

                  : "Usuario"

            }

          </h2>

        </div>

        <button

          className="user-modal-close"

          onClick={onClose}

        >

          ✕

        </button>

      </div>

      {/* ======================================================
          AVATAR
      ====================================================== */}

      <div className="user-modal-avatar">

        <Avatar

          src={data.photoURL}

          name={data.displayName}

          size={90}

        />

      </div>

      {/* ======================================================
          GENERAL
      ====================================================== */}

      <UserGeneralSection

        controller={controller}

      />

      {/* ======================================================
          COMPANY
      ====================================================== */}

      <UserCompanySection

        controller={controller}

        companies={companies}

        />

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <UserSecuritySection

        controller={controller}

      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="user-modal-footer">

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

          (

            mode === "create" ||

            mode === "edit"

          ) && (

            <Button

              onClick={handleSave}

            >

              {

                mode === "create"

                  ? "Crear usuario"

                  : "Guardar"

              }

            </Button>

          )

        }

      </div>

    </Modal>

  );

}