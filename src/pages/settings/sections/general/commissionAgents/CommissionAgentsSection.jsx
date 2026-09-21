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
  getCommissionAgents,
  createCommissionAgent,
  updateCommissionAgent,
  toggleCommissionAgentStatus
} from "../../../../../services/settings/general/agentsService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import DataTable from "../../../../../components/general/dataTable";
import Loading from "../../../../../components/general/loading";

import CommissionAgentsForm from "./CommissionAgentsForm";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


/* ======================================================
   COMPONENT
====================================================== */

const CommissionAgentsSection = () => {

  /* ======================================================
     CONTEXT
  ====================================================== */

  const {
    session
  } = useAuth();

  const user =
    session?.user;

  const companyId =
    session?.company?.id;


  /* ======================================================
     STATE
  ====================================================== */

  const [
    agents,
    setAgents
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm
  ] = useState("");

  const [
    selectedAgent,
    setSelectedAgent
  ] = useState(null);

  const [
    showModal,
    setShowModal
  ] = useState(false);


  /* ======================================================
     SORT
  ====================================================== */

  const [
    sortConfig,
    setSortConfig
  ] = useState({
    key: "name",
    direction: "asc"
  });


  const handleSort = (key) => {

    setSortConfig(
      (previous) => {

        if (previous.key !== key) {

          return {
            key,
            direction: "asc"
          };

        }

        return {
          key,
          direction:
            previous.direction === "asc"
              ? "desc"
              : "asc"
        };

      }
    );

  };


  /* ======================================================
     FETCH
  ====================================================== */

  const fetchAgents = useCallback(
    async () => {

      if (!companyId) {

        setAgents([]);
        setLoading(false);

        return;

      }

      try {

        setLoading(true);

        const data =
          await getCommissionAgents(
            companyId
          );

        setAgents(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Error loading commission agents:",
          error
        );

        notifyError(
          error?.message ||
          "No fue posible cargar los comisionistas."
        );

      } finally {

        setLoading(false);

      }

    },
    [companyId]
  );


  /* ======================================================
     EFFECTS
  ====================================================== */

  useEffect(() => {

    fetchAgents();

  }, [fetchAgents]);


  /* ======================================================
     FILTERED / SORTED DATA
  ====================================================== */

  const processedAgents = useMemo(() => {

    let result = [
      ...agents
    ];


    const search =
      searchTerm
        .trim()
        .toLowerCase();


    if (search) {

      result =
        result.filter(
          (agent) => {

            const name =
              agent?.name
                ?.toLowerCase() || "";

            const phone =
              agent?.phone
                ?.toLowerCase() || "";

            const email =
              agent?.email
                ?.toLowerCase() || "";

            const type =
              agent?.type
                ?.toLowerCase() || "";

            const typeLabel =
              agent?.type === "agency"
                ? "agencia"
                : "persona";


            const commissionType =
              agent?.commissionType
                ?.toLowerCase() || "";


            return (
              name.includes(search) ||
              phone.includes(search) ||
              email.includes(search) ||
              type.includes(search) ||
              typeLabel.includes(search) ||
              commissionType.includes(search)
            );

          }
        );

    }


    const {
      key,
      direction
    } = sortConfig;


    result.sort(
      (a, b) => {

        let valueA;
        let valueB;


        if (key === "commission") {

          valueA =
            Number(
              a?.commissionValue || 0
            );

          valueB =
            Number(
              b?.commissionValue || 0
            );

        } else {

          valueA =
            a?.[key];

          valueB =
            b?.[key];

        }


        if (
          typeof valueA === "boolean"
        ) {

          valueA =
            valueA ? 1 : 0;

          valueB =
            valueB ? 1 : 0;

        }


        if (
          typeof valueA === "string"
        ) {

          valueA =
            valueA.toLowerCase();

        }


        if (
          typeof valueB === "string"
        ) {

          valueB =
            valueB.toLowerCase();

        }


        if (valueA == null) {
          valueA = "";
        }

        if (valueB == null) {
          valueB = "";
        }


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


    return result;

  }, [
    agents,
    searchTerm,
    sortConfig
  ]);


  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedAgent(null);
    setShowModal(true);

  };


  const openEditModal = (agent) => {

    setSelectedAgent(agent);
    setShowModal(true);

  };


  const closeModal = () => {

    setShowModal(false);
    setSelectedAgent(null);

  };


  /* ======================================================
     SAVE
  ====================================================== */

  const handleSave = async (
    formData
  ) => {

    try {

      if (!companyId) {

        throw new Error(
          "No se encontró la empresa actual."
        );

      }


      if (selectedAgent) {

        await updateCommissionAgent(
          companyId,
          selectedAgent.id,
          formData,
          user
        );


        notifySuccess(
          "Comisionista actualizado",
          "Los cambios fueron guardados correctamente."
        );

      } else {

        await createCommissionAgent(
          companyId,
          formData,
          user
        );


        notifySuccess(
          "Comisionista creado",
          "El comisionista fue creado correctamente."
        );

      }


      closeModal();

      await fetchAgents();

    } catch (error) {

      console.error(
        "Error saving commission agent:",
        error
      );


      notifyError(
        error?.message ||
        "Ocurrió un error inesperado."
      );


      /*
       * Permite que el formulario termine
       * correctamente su estado de loading.
       */

      throw error;

    }

  };


  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (
    agent
  ) => {

    if (
      !companyId ||
      !agent?.id
    ) {
      return;
    }


    const action =
      agent.isActive
        ? "desactivar"
        : "activar";


    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este comisionista?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await toggleCommissionAgentStatus(
        companyId,
        agent.id,
        agent.isActive
      );


      notifySuccess(
        "Estado actualizado",
        `El comisionista fue ${
          action === "activar"
            ? "activado"
            : "desactivado"
        } correctamente.`
      );


      await fetchAgents();

    } catch (error) {

      console.error(
        "Error updating commission agent status:",
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
      minWidth: "240px"
    },

    {
      key: "phone",
      label: "Teléfono",
      sortable: true,
      minWidth: "170px"
    },

    {
      key: "email",
      label: "Email",
      sortable: true,
      minWidth: "250px"
    },

    {
      key: "type",
      label: "Tipo",
      sortable: true,
      minWidth: "150px"
    },

    {
      key: "commission",
      label: "Comisión",
      sortable: true,
      minWidth: "150px"
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
     LOADING
  ====================================================== */

  if (loading) {
    return <Loading />;
  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="catalog-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <CatalogHeader
        title="Comisionistas"
        description="Administra las personas o empresas que reciben comisión."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar comisionista..."
          />


          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar comisionista

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {
          processedAgents.length === 0 && (

            <CatalogEmpty
              message={
                searchTerm
                  ? "No se encontraron comisionistas que coincidan con la búsqueda."
                  : "Todavía no hay comisionistas registrados."
              }
            />

          )
        }


        {
          processedAgents.length > 0 && (

            <DataTable
              columns={columns}
              data={processedAgents}
              rowsPerPage={10}
              sortConfig={sortConfig}
              onSort={handleSort}
              renderRow={(agent) => (

                <>

                  {/* ======================================
                      NAME
                  ====================================== */}

                  <td>

                    <strong>
                      {agent.name}
                    </strong>

                  </td>


                  {/* ======================================
                      PHONE
                  ====================================== */}

                  <td>
                    {agent.phone || "-"}
                  </td>


                  {/* ======================================
                      EMAIL
                  ====================================== */}

                  <td>
                    {agent.email || "-"}
                  </td>


                  {/* ======================================
                      TYPE
                  ====================================== */}

                  <td>

                    {
                      agent.type === "agency"
                        ? "Agencia"
                        : "Persona"
                    }

                  </td>


                  {/* ======================================
                      COMMISSION
                  ====================================== */}

                  <td>

                    {
                      agent.commissionType ===
                      "percentage"

                        ? `${agent.commissionValue || 0}%`

                        : `$${agent.commissionValue || 0}`
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
                        agent.isActive
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
                          openEditModal(agent)
                        }
                      >
                        Editar
                      </button>


                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggleStatus(
                            agent
                          )
                        }
                      >

                        {
                          agent.isActive
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
          FORM
      ================================================== */}

      {
        showModal && (

          <CommissionAgentsForm
            agent={selectedAgent}
            onClose={closeModal}
            onSave={handleSave}
          />

        )
      }

    </div>

  );

};


export default CommissionAgentsSection;