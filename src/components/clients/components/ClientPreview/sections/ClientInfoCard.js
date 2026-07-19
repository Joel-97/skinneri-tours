/*
==========================================================
CLIENT INFO CARD
==========================================================
*/

import {

  Mail,
  Phone,
  MessageCircle,
  Globe,
  Languages,
  Building2,
  MapPin

} from "lucide-react";

import { formatLanguage } from "../../../utils/formatLanguage";

const ClientInfoCard = ({

  client

}) => {

  return (

    <section className="client-preview-card">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h3>

        Información del cliente

      </h3>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="client-info-list">

        {/* Email */}

        <div className="client-info-item">

          <Mail size={16} />

          <div>

            <label>

              Correo electrónico

            </label>

            <span>

              {client.email || "Sin información"}

            </span>

          </div>

        </div>

        {/* Teléfono */}

        <div className="client-info-item">

          <Phone size={16} />

          <div>

            <label>

              Teléfono

            </label>

            <span>

              {client.phone || "Sin información"}

            </span>

          </div>

        </div>

        {/* WhatsApp */}

        <div className="client-info-item">

          <MessageCircle size={16} />

          <div>

            <label>

              WhatsApp

            </label>

            <span>

              {client.whatsapp || "Sin información"}

            </span>

          </div>

        </div>

        {/* País */}

        <div className="client-info-item">

          <Globe size={16} />

          <div>

            <label>

              País

            </label>

            <span>

              {client.country || "Sin información"}

            </span>

          </div>

        </div>

        {/* Idioma */}

        <div className="client-info-item">

          <Languages size={16} />

          <div>

            <label>

              Idioma

            </label>

            <span>

              {
                formatLanguage(client.preferredLanguage) || "Sin información"
              }

            </span>

          </div>

        </div>

        {/* Empresa */}

        {

          client.type === "company" && (

            <div className="client-info-item">

              <Building2 size={16} />

              <div>

                <label>

                  Identificación

                </label>

                <span>

                  {client.identification || "Sin información"}

                </span>

              </div>

            </div>

          )

        }

        {/* Dirección */}

        {

          client.address && (

            <div className="client-info-item">

              <MapPin size={16} />

              <div>

                <label>

                  Dirección

                </label>

                <span>

                  {client.address}

                </span>

              </div>

            </div>

          )

        }

      </div>

    </section>

  );

};

export default ClientInfoCard;