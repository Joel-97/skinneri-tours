import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Plus
} from "lucide-react";

import {
  useAuth
} from "../../../../../context/AuthContext";

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


const PayersSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const {
    session
  } = useAuth();

  const user = session?.user;
  const company = session?.company;
  const companyId = company?.id;


  /* ======================================================
     STATE
  ====================================================== */

  const [payers, setPayers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedPayer, setSelectedPayer] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc"
  });

  const [currentPage, setCurrentPage] = useState(1);

  const [itemsPerPage] = useState(10);


  /* ======================================================
     FETCH
  ====================================================== */

  const fetchPayers = useCallback(async () => {

    if (!companyId) {
      setPayers([]);
      setLoading(false);
      return;
    }

    try {

      setLoading(true);

      const data = await getPayers(
        companyId
      );

      setPayers(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading payers:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible cargar los pagadores."
      );

    } finally {

      setLoading(false);

    }

  }, [companyId]);


  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    fetchPayers();

  }, [fetchPayers]);


  /* ======================================================
     SEARCH
  ====================================================== */

  const filteredPayers = useMemo(() => {

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return payers;
    }

    return payers.filter(
      (payer) => {

        const name =
          payer?.name
            ?.toLowerCase() || "";

        const payerType =
          payer?.payerType?.label
            ?.toLowerCase() || "";

        const phone =
          payer?.phone
            ?.toLowerCase() || "";

        const email =
          payer?.email
            ?.toLowerCase() || "";

        return (
          name.includes(search) ||
          payerType.includes(search) ||
          phone.includes(search) ||
          email.includes(search)
        );

      }
    );

  }, [
    payers,
    searchTerm
  ]);


  /* ======================================================
     SORT
  ====================================================== */

  const sortedPayers = useMemo(() => {

    const data = [
      ...filteredPayers
    ];

    const {
      key,
      direction
    } = sortConfig;

    data.sort(
      (a, b) => {

        let valueA = "";
        let valueB = "";

        if (key === "payerType") {

          valueA =
            a?.payerType?.label || "";

          valueB =
            b?.payerType?.label || "";

        } else {

          valueA =
            a?.[key] || "";

          valueB =
            b?.[key] || "";

        }

        valueA = String(valueA)
          .toLowerCase();

        valueB = String(valueB)
          .toLowerCase();

        if (valueA < valueB) {
          return direction === "asc"
            ? -1
            : 1;
        }

        if (valueA > valueB) {
          return direction === "asc"
            ? 1
            : -1;
        }

        return 0;

      }
    );

    return data;

  }, [
    filteredPayers,
    sortConfig
  ]);


  /* ======================================================
     PAGINATION
  ====================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedPayers.length /
      itemsPerPage
    )
  );

  const paginatedPayers = useMemo(() => {

    const startIndex =
      (currentPage - 1) *
      itemsPerPage;

    return sortedPayers.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  }, [
    sortedPayers,
    currentPage,
    itemsPerPage
  ]);


  /* ======================================================
     SEARCH / PAGINATION EFFECT
  ====================================================== */

  useEffect(() => {

    setCurrentPage(1);

  }, [searchTerm]);


  useEffect(() => {

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

  }, [
    currentPage,
    totalPages
  ]);


  /* ======================================================
     SORT HANDLER
  ====================================================== */

  const handleSort = (key) => {

    setSortConfig(
      (current) => {

        if (current.key !== key) {

          return {
            key,
            direction: "asc"
          };

        }

        return {
          key,
          direction:
            current.direction === "asc"
              ? "desc"
              : "asc"
        };

      }
    );

  };


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

      if (!companyId) {
        throw new Error(
          "No se encontró la empresa actual."
        );
      }

      if (selectedPayer) {

        await updatePayer(
          companyId,
          selectedPayer.id,
          formData,
          user
        );

        notifySuccess(
          "Pagador actualizado",
          "Los cambios fueron guardados correctamente."
        );

      } else {

        await createPayer(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Pagador creado",
          "El pagador fue creado correctamente."
        );

      }

      closeModal();

      await fetchPayers();

    } catch (error) {

      console.error(
        "Error saving payer:",
        error
      );

      notifyError(
        error?.message ||
        "Ocurrió un error inesperado."
      );

      /*
       * El error se maneja aquí para que el formulario
       * pueda finalizar correctamente su estado de loading.
       */
      throw error;

    }

  };


  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (payer) => {

    if (!companyId || !payer?.id) {
      return;
    }

    const action =
      payer.isActive
        ? "desactivar"
        : "activar";

    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este pagador?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await togglePayerStatus(
        companyId,
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

      await fetchPayers();

    } catch (error) {

      console.error(
        "Error updating payer status:",
        error
      );

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
      sortable: true,
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
            type="button"
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

        {!loading &&
          sortedPayers.length === 0 && (

            <CatalogEmpty
              message={
                searchTerm
                  ? "No se encontraron pagadores que coincidan con la búsqueda."
                  : "Todavía no hay pagadores registrados."
              }
            />

          )}


        {sortedPayers.length > 0 && (

          <>

            <DataTable
              columns={columns}
              data={paginatedPayers}
              sortConfig={sortConfig}
              onSort={handleSort}
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
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          openEditModal(payer)
                        }
                      >
                        Editar
                      </button>


                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggleStatus(payer)
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


            {/* ==========================================
                PAGINATION
            ========================================== */}

            {totalPages > 1 && (

              <div
                className="catalog-pagination"
              >

                <button
                  type="button"
                  className="catalog-pagination__button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >
                  Anterior
                </button>


                <span
                  className="catalog-pagination__info"
                >
                  Página {currentPage} de {totalPages}
                </span>


                <button
                  type="button"
                  className="catalog-pagination__button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >
                  Siguiente
                </button>

              </div>

            )}

          </>

        )}

      </div>


      {/* ==================================================
          FORM
      ================================================== */}

      {showModal && (

        <PayerForm
          payer={selectedPayer}
          onClose={closeModal}
          onSave={handleSave}
        />

      )}

    </div>

  );

};


export default PayersSection;