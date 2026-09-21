import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Plus } from "lucide-react";

import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  toggleDiscountStatus
} from "../../../../../services/settings/transportation/discountService";

import {
  getCurrencies
} from "../../../../../services/settings/general/currencyService";

import {
  useAuth
} from "../../../../../context/AuthContext";

import DataTable from "../../../../../components/general/dataTable";
import Loading from "../../../../../components/general/loading";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import DiscountsForm from "./DiscountsForm";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


const DiscountsSection = () => {

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
    discounts,
    setDiscounts
  ] = useState([]);

  const [
    currencies,
    setCurrencies
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
    selectedDiscount,
    setSelectedDiscount
  ] = useState(null);

  const [
    showModal,
    setShowModal
  ] = useState(false);


  /* ======================================================
     LOAD DATA
  ====================================================== */

  const fetchData = useCallback(
    async () => {

      if (!companyId) {

        setDiscounts([]);
        setCurrencies([]);
        setLoading(false);

        return;
      }

      try {

        setLoading(true);

        const [
          discountsData,
          currenciesData
        ] = await Promise.all([
          getDiscounts(companyId),
          getCurrencies(companyId)
        ]);

        setDiscounts(
          Array.isArray(discountsData)
            ? discountsData
            : []
        );

        setCurrencies(
          Array.isArray(currenciesData)
            ? currenciesData.filter(
                (currency) =>
                  currency.isActive
              )
            : []
        );

      } catch (error) {

        console.error(
          "Error loading discounts:",
          error
        );

        notifyError(
          "Error",
          "No se pudieron cargar los descuentos."
        );

      } finally {

        setLoading(false);

      }

    },
    [companyId]
  );


  useEffect(() => {

    fetchData();

  }, [fetchData]);


  /* ======================================================
     SEARCH
  ====================================================== */

  const processedDiscounts = useMemo(() => {

    const term =
      searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return discounts;
    }

    return discounts.filter(
      (discount) => {

        const name =
          discount?.name
            ?.toLowerCase() || "";

        const type =
          discount?.type
            ?.toLowerCase() || "";

        const value =
          discount?.value
            ?.toString() || "";

        const currency =
          discount?.currency
            ?.toLowerCase() || "";

        return (
          name.includes(term) ||
          type.includes(term) ||
          value.includes(term) ||
          currency.includes(term)
        );

      }
    );

  }, [
    discounts,
    searchTerm
  ]);


  /* ======================================================
     CREATE
  ====================================================== */

  const handleCreate = () => {

    setSelectedDiscount(null);
    setShowModal(true);

  };


  /* ======================================================
     EDIT
  ====================================================== */

  const handleEdit = (discount) => {

    setSelectedDiscount(discount);
    setShowModal(true);

  };


  /* ======================================================
     CLOSE FORM
  ====================================================== */

  const handleCloseForm = () => {

    setSelectedDiscount(null);
    setShowModal(false);

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

      if (selectedDiscount) {

        await updateDiscount(
          companyId,
          selectedDiscount.id,
          formData,
          user
        );

        notifySuccess(
          "Descuento actualizado",
          "Descuento actualizado correctamente."
        );

      } else {

        await createDiscount(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Descuento creado",
          "Descuento creado correctamente."
        );

      }

      handleCloseForm();

      await fetchData();

    } catch (error) {

      console.error(
        "Error saving discount:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
          "Hubo un error al guardar el descuento."
      );

      throw error;

    }

  };


  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (
    discount
  ) => {

    const confirmed =
      await notifyConfirm(
        `¿Deseas ${
          discount.isActive
            ? "desactivar"
            : "activar"
        } este descuento?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await toggleDiscountStatus(
        companyId,
        discount.id,
        discount.isActive,
        user
      );

      notifySuccess(
        "Estado actualizado",
        "El estado se actualizó correctamente."
      );

      await fetchData();

    } catch (error) {

      console.error(
        "Error toggling discount status:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
          "Hubo un error al actualizar el estado."
      );

    }

  };


  /* ======================================================
     TABLE COLUMNS
  ====================================================== */

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Nombre",
        sortable: true
      },
      {
        key: "type",
        label: "Tipo",
        sortable: true
      },
      {
        key: "value",
        label: "Valor",
        sortable: true
      },
      {
        key: "expirationDate",
        label: "Expira",
        sortable: true
      },
      {
        key: "isActive",
        label: "Estado",
        sortable: true
      },
      {
        key: "actions",
        label: "Acciones",
        sortable: false
      }
    ],
    []
  );


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
        title="Descuentos"
        description="Gestiona descuentos globales del sistema."
      >

        <CatalogSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar descuento..."
        />

        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
        >
          <Plus size={16} />
          Agregar descuento
        </button>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {processedDiscounts.length === 0 ? (

          <CatalogEmpty
            title={
              searchTerm
                ? "No se encontraron descuentos"
                : "No hay descuentos"
            }
            description={
              searchTerm
                ? "No hay descuentos que coincidan con la búsqueda."
                : "Aún no hay descuentos registrados."
            }
            actionLabel="Agregar descuento"
            onAction={handleCreate}
          />

        ) : (

          <DataTable
            data={processedDiscounts}
            columns={columns}
            renderRow={(discount) => {

              const expired =
                discount.expirationDate &&
                discount.expirationDate
                  .toDate() < new Date();

              return (

                <>

                  {/* ========================================
                      NAME
                  ========================================= */}

                  <td>
                    {discount.name}
                  </td>


                  {/* ========================================
                      TYPE
                  ========================================= */}

                  <td>
                    {discount.type ===
                    "percentage"
                      ? "Porcentaje"
                      : "Fijo"}
                  </td>


                  {/* ========================================
                      VALUE
                  ========================================= */}

                  <td>
                    {discount.type ===
                    "percentage"
                      ? `${discount.value}%`
                      : `${discount.currency} ${discount.value}`}
                  </td>


                  {/* ========================================
                      EXPIRATION
                  ========================================= */}

                  <td>
                    {discount.expirationDate
                      ? discount.expirationDate
                          .toDate()
                          .toLocaleDateString()
                      : "-"}
                  </td>


                  {/* ========================================
                      STATUS
                  ========================================= */}

                  <td>

                    <CatalogStatusBadge
                      value={
                        expired
                          ? "warning"
                          : discount.isActive
                            ? "active"
                            : "unavailable"
                      }
                      options={[
                        {
                          value: "active",
                          label: "Activo"
                        },
                        {
                          value: "unavailable",
                          label: "Inactivo"
                        },
                        {
                          value: "warning",
                          label: "Expirado"
                        }
                      ]}
                    />

                  </td>


                  {/* ========================================
                      ACTIONS
                  ========================================= */}

                  <td>

                    <CatalogActions>

                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleEdit(discount)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggleStatus(
                            discount
                          )
                        }
                      >
                        {discount.isActive
                          ? "Desactivar"
                          : "Activar"}
                      </button>

                    </CatalogActions>

                  </td>

                </>

              );

            }}
          />

        )}

      </div>


      {/* ==================================================
          FORM
      ================================================== */}

      {showModal && (

        <DiscountsForm
          discount={selectedDiscount}
          currencies={currencies}
          onClose={handleCloseForm}
          onSave={handleSave}
        />

      )}

    </div>

  );

};


export default DiscountsSection;