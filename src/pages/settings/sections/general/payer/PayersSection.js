import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Plus
} from "lucide-react";

import {
  useAuth
} from "../../../../../context/AuthContext";

import {
  useCompany
} from "../../../../../context/CompanyContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  getPayers,
  createPayer,
  updatePayer,
  togglePayerStatus
} from "../../../../../services/settings/general/payersService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import PayerForm from "./PayerForm";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

/* ======================================================
   COMPONENT
====================================================== */

const PayersSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const { user } = useAuth();

  const { company } = useCompany();

  /* ======================================================
     STATE
  ====================================================== */

  const [payers, setPayers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayer, setSelectedPayer] =
    useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ======================================================
     FETCH
  ====================================================== */

  const fetchPayers = useCallback(async () => {

    if (!company?.id) return;

    try {

      setLoading(true);

      const data = await getPayers(

        company.id

      );

      setPayers(data);

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible cargar los pagadores."

      );

    }

    finally {

      setLoading(false);

    }

  }, [company]);

  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    fetchPayers();

  }, [fetchPayers]);

  /* ======================================================
     FILTERED DATA
  ====================================================== */

  const filteredPayers = useMemo(() => {

    const search =

      searchTerm.toLowerCase();

    return payers.filter(payer => (

      payer.name
        ?.toLowerCase()
        .includes(search)

      ||

      payer.payerType?.label
        ?.toLowerCase()
        .includes(search)

      ||

      payer.phone
        ?.toLowerCase()
        .includes(search)

      ||

      payer.email
        ?.toLowerCase()
        .includes(search)

    ));

  }, [

    payers,

    searchTerm

  ]);

    /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedPayer(null);

    setShowModal(true);

  };

  const openEditModal = (payer) => {

    setSelectedPayer(payer);

    setShowModal(true);

  };

  const closeModal = () => {

    setShowModal(false);

    setSelectedPayer(null);

  };

  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (formData) => {

    try {

      if (selectedPayer) {

        await updatePayer(

          company.id,

          selectedPayer.id,

          formData,

          user

        );

        notifySuccess(

          "Pagador actualizado",

          "Los cambios fueron guardados correctamente."

        );

      }

      else {

        await createPayer(

          company.id,

          formData,

          user

        );

        notifySuccess(

          "Pagador creado",

          "El pagador fue creado correctamente."

        );

      }

      closeModal();

      fetchPayers();

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "Ocurrió un error inesperado."

      );

    }

  };

  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (payer) => {

    const action =

      payer.isActive

        ? "desactivar"

        : "activar";

    const confirmed = await notifyConfirm(

      `¿Deseas ${action} este pagador?`

    );

    if (!confirmed) return;

    try {

      await togglePayerStatus(

        company.id,

        payer.id,

        payer.isActive

      );

      notifySuccess(

        "Estado actualizado",

        `El pagador fue ${

          action === "activar"

            ? "activado"

            : "desactivado"

        } correctamente.`

      );

      fetchPayers();

    }

    catch (error) {

      console.error(error);

      notifyError(

        error?.message ||

        "No fue posible actualizar el estado."

      );

    }

  };

  /* ======================================================
     COLUMNS
  ====================================================== */

  const columns = [

    {

      key: "name",

      label: "Nombre",

      sortable: true,

      minWidth: "260px"

    },

    {

      key: "payerType",

      label: "Tipo",

      minWidth: "220px"

    },

    {

      key: "phone",

      label: "Teléfono",

      minWidth: "180px"

    },

    {

      key: "email",

      label: "Email",

      minWidth: "260px"

    },

    {

      key: "status",

      label: "Estado",

      width: "140px",

      align: "center"

    },

    {

      key: "actions",

      label: "Acciones",

      width: "220px",

      align: "center"

    }

  ];

    /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="catalog-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <CatalogHeader
        title="Pagadores"
        description="Administra las personas y organizaciones responsables del pago de las reservas."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar pagador..."
          />

          <button
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar pagador

          </button>

        </CatalogToolbar>

      </CatalogHeader>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {

          !loading &&
          filteredPayers.length === 0 && (

            <CatalogEmpty
              message="Todavía no hay pagadores registrados."
            />

          )

        }

        {

          filteredPayers.length > 0 && (

            <DataTable
              columns={columns}
              data={filteredPayers}
              renderRow={(payer) => (

                <>

                  {/* ======================================
                      NAME
                  ====================================== */}

                  <td>

                    <strong>

                      {payer.name}

                    </strong>

                  </td>

                  {/* ======================================
                      TYPE
                  ====================================== */}

                  <td>

                    {

                      payer.payerType?.label ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      PHONE
                  ====================================== */}

                  <td>

                    {

                      payer.phone ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      EMAIL
                  ====================================== */}

                  <td>

                    {

                      payer.email ||

                      "-"

                    }

                  </td>

                  {/* ======================================
                      STATUS
                  ====================================== */}

                  <td
                    style={{
                      textAlign: "center"
                    }}
                  >

                    <CatalogStatusBadge
                      value={
                        payer.isActive
                          ? "active"
                          : "inactive"
                      }
                      options={[
                        {
                          value: "active",
                          label: "Activo"
                        },
                        {
                          value: "inactive",
                          label: "Inactivo"
                        }
                      ]}
                    />

                  </td>

                  {/* ======================================
                      ACTIONS
                  ====================================== */}

                  <td
                    style={{
                      textAlign: "center"
                    }}
                  >

                    <CatalogActions>

                      <button
                        className="catalog-action"
                        onClick={() =>
                          openEditModal(
                            payer
                          )
                        }
                      >

                        Editar

                      </button>

                      <button
                        className="catalog-action"
                        onClick={() =>
                          handleToggleStatus(
                            payer
                          )
                        }
                      >

                        {

                          payer.isActive

                            ? "Desactivar"

                            : "Activar"

                        }

                      </button>

                    </CatalogActions>

                  </td>

                </>

              )}
            />

          )

        }

      </div>

      {/* ==================================================
          MODAL
      ================================================== */}

      {

        showModal && (

          <PayerForm
            payer={selectedPayer}
            onClose={closeModal}
            onSave={handleSave}
          />

        )

      }

    </div>

  );

};

export default PayersSection;