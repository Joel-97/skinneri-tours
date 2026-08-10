/*
==========================================================
CLIENT PREVIEW HEADER
==========================================================
*/

import {

  Building2,
  Calendar,
  User,
  X

} from "lucide-react";

import {
  formatDate
} from "../../../utils/formatDate";

const ClientPreviewHeader = ({

  client,

  onClose

}) => {

  const isCompany =

    client.type === "company";

  return (

    <section className="client-preview-header">

      {/* ======================================================
          CLOSE
      ====================================================== */}

      <button

        className="client-preview-close"

        onClick={onClose}

      >

        <X size={18} />

      </button>

      {/* ======================================================
          AVATAR
      ====================================================== */}

      <div className="client-preview-avatar">

        {

          isCompany

            ? <Building2 size={38} />

            : <User size={38} />

        }

      </div>

      {/* ======================================================
          NAME
      ====================================================== */}

      <h2 className="client-preview-name">

        {client.name}

      </h2>

      <p className="client-preview-type">

        {

          isCompany

            ? "Empresa"

            : "Persona"

        }

      </p>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <span

        className={`client-preview-status ${client.status}`}

      >

        {

          client.status === "active"

            ? "Activo"

            : "Inactivo"

        }

      </span>

      {/* ======================================================
          CREATED
      ====================================================== */}

      <div className="client-preview-created">

        <Calendar size={16} />

        <span>

          Cliente desde

        </span>

      </div>

      <p className="client-preview-created-date">

        {
          formatDate(client.createdAt) || "Sin información"
        }

      </p>

    </section>

  );

};

export default ClientPreviewHeader;