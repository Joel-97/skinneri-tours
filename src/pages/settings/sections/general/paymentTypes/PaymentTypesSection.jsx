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
  getPaymentTypes,
  createPaymentType,
  updatePaymentType,
  togglePaymentTypeStatus
} from "../../../../../services/settings/general/paymentTypeService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import DataTable from "../../../../../components/general/dataTable";
import Loading from "../../../../../components/general/loading";

import PaymentTypeForm from "./PaymentTypesForm";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


/* ======================================================
   COMPONENT
====================================================== */

const PaymentTypesSection = () => {

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
    paymentTypes,
    setPaymentTypes
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
    selectedPaymentType,
    setSelectedPaymentType
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

  const fetchPaymentTypes = useCallback(
    async () => {

      if (!companyId) {

        setPaymentTypes([]);
        setLoading(false);

        return;

      }

      try {

        setLoading(true);

        const data =
          await getPaymentTypes(
            companyId
          );

        setPaymentTypes(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Error loading payment types:",
          error
        );

        notifyError(
          error?.message ||
          "No fue posible cargar los tipos de pago."
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

    fetchPaymentTypes();

  }, [fetchPaymentTypes]);


  /* ======================================================
     FILTERED / SORTED DATA
  ====================================================== */

  const processedPaymentTypes = useMemo(() => {

    let result = [
      ...paymentTypes
    ];


    const search =
      searchTerm
        .trim()
        .toLowerCase();


    /* ----------------------------------------
       SEARCH
    ---------------------------------------- */

    if (search) {

      result =
        result.filter(
          (paymentType) => {

            const name =
              paymentType?.name
                ?.toLowerCase() || "";

            const description =
              paymentType?.description
                ?.toLowerCase() || "";


            return (
              name.includes(search) ||
              description.includes(search)
            );

          }
        );

    }


    /* ----------------------------------------
       SORT
    ---------------------------------------- */

    const {
      key,
      direction
    } = sortConfig;


    result.sort(
      (a, b) => {

        let valueA =
          a?.[key];

        let valueB =
          b?.[key];


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
    paymentTypes,
    searchTerm,
    sortConfig
  ]);


  /* ======================================================
     MODAL
  ====================================================== */

  const openCreateModal = () => {

    setSelectedPaymentType(null);
    setShowModal(true);

  };


  const openEditModal = (
    paymentType
  ) => {

    setSelectedPaymentType(
      paymentType
    );

    setShowModal(true);

  };


  const closeModal = () => {

    setShowModal(false);
    setSelectedPaymentType(null);

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


      if (selectedPaymentType) {

        await updatePaymentType(
          companyId,
          selectedPaymentType.id,
          formData,
          user
        );


        notifySuccess(
          "Tipo de pago actualizado",
          "Los cambios fueron guardados correctamente."
        );

      } else {

        await createPaymentType(
          companyId,
          formData,
          user
        );


        notifySuccess(
          "Tipo de pago creado",
          "El tipo de pago fue creado correctamente."
        );

      }


      closeModal();

      await fetchPaymentTypes();

    } catch (error) {

      console.error(
        "Error saving payment type:",
        error
      );


      notifyError(
        error?.message ||
        "Ocurrió un error inesperado."
      );


      /*
       * El formulario necesita recibir
       * el error para finalizar su loading.
       */

      throw error;

    }

  };


  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (
    paymentType
  ) => {

    if (
      !companyId ||
      !paymentType?.id
    ) {
      return;
    }


    const action =
      paymentType.isActive
        ? "desactivar"
        : "activar";


    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este tipo de pago?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await togglePaymentTypeStatus(
        companyId,
        paymentType.id,
        paymentType.isActive
      );


      notifySuccess(
        "Estado actualizado",
        `El tipo de pago fue ${
          action === "activar"
            ? "activado"
            : "desactivado"
        } correctamente.`
      );


      await fetchPaymentTypes();

    } catch (error) {

      console.error(
        "Error updating payment type status:",
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
      key: "description",
      label: "Descripción",
      sortable: true,
      minWidth: "320px"
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
        title="Tipos de pago"
        description="Administra los métodos de pago disponibles."
      >

        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar tipo de pago..."
          />


          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Agregar tipo de pago

          </button>

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {
          processedPaymentTypes.length === 0 && (

            <CatalogEmpty
              message={
                searchTerm
                  ? "No se encontraron tipos de pago que coincidan con la búsqueda."
                  : "Todavía no hay tipos de pago registrados."
              }
            />

          )
        }


        {
          processedPaymentTypes.length > 0 && (

            <DataTable
              columns={columns}
              data={processedPaymentTypes}
              sortConfig={sortConfig}
              onSort={handleSort}
              renderRow={(paymentType) => (

                <>

                  {/* ======================================
                      NAME
                  ====================================== */}

                  <td>

                    <strong>
                      {paymentType.name}
                    </strong>

                  </td>


                  {/* ======================================
                      DESCRIPTION
                  ====================================== */}

                  <td>

                    {
                      paymentType.description ||
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
                        paymentType.isActive
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
                          openEditModal(
                            paymentType
                          )
                        }
                      >
                        Editar
                      </button>


                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggleStatus(
                            paymentType
                          )
                        }
                      >

                        {
                          paymentType.isActive
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

          <PaymentTypeForm
            paymentType={
              selectedPaymentType
            }
            onClose={closeModal}
            onSave={handleSave}
          />

        )
      }

    </div>

  );

};


export default PaymentTypesSection;