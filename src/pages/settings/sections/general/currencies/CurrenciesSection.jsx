import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Plus } from "lucide-react";

import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  toggleCurrencyStatus
} from "../../../../../services/settings/general/currencyService";

import { useAuth } from "../../../../../context/AuthContext";

import DataTable from "../../../../../components/general/dataTable";
import Loading from "../../../../../components/general/loading";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import CurrencyForm from "./CurrenciesForm";

import {
  notifySuccess,
  notifyError
} from "../../../../../services/notificationService";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


const CurrenciesSection = () => {

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
    selectedCurrency,
    setSelectedCurrency
  ] = useState(null);

  const [
    showModal,
    setShowModal
  ] = useState(false);


  /* ======================================================
     LOAD CURRENCIES
  ====================================================== */

  const fetchCurrencies = useCallback(
    async () => {

      if (!companyId) {
        setCurrencies([]);
        setLoading(false);
        return;
      }

      try {

        setLoading(true);

        const data =
          await getCurrencies(companyId);

        setCurrencies(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Error loading currencies:",
          error
        );

        notifyError(
          "Error",
          "No se pudieron cargar las monedas."
        );

      } finally {

        setLoading(false);

      }

    },
    [companyId]
  );


  useEffect(() => {

    fetchCurrencies();

  }, [fetchCurrencies]);


  /* ======================================================
     SEARCH
  ====================================================== */

  const processedCurrencies = useMemo(() => {

    const term =
      searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return currencies;
    }

    return currencies.filter(
      (currency) => {

        const code =
          currency?.code
            ?.toLowerCase() || "";

        const name =
          currency?.name
            ?.toLowerCase() || "";

        const symbol =
          currency?.symbol
            ?.toLowerCase() || "";

        return (
          code.includes(term) ||
          name.includes(term) ||
          symbol.includes(term)
        );

      }
    );

  }, [
    currencies,
    searchTerm
  ]);


  /* ======================================================
     CREATE
  ====================================================== */

  const handleCreate = () => {

    setSelectedCurrency(null);
    setShowModal(true);

  };


  /* ======================================================
     EDIT
  ====================================================== */

  const handleEdit = (currency) => {

    setSelectedCurrency(currency);
    setShowModal(true);

  };


  /* ======================================================
     CLOSE FORM
  ====================================================== */

  const handleCloseForm = () => {

    setSelectedCurrency(null);
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

      if (selectedCurrency) {

        await updateCurrency(
          companyId,
          selectedCurrency.id,
          formData,
          user
        );

        notifySuccess(
          "Moneda actualizada",
          "Los cambios fueron guardados."
        );

      } else {

        await createCurrency(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Moneda creada",
          "La moneda fue creada correctamente."
        );

      }

      handleCloseForm();

      await fetchCurrencies();

    } catch (error) {

      console.error(
        "Error saving currency:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
          "No se pudo guardar la moneda."
      );

      throw error;

    }

  };


  /* ======================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = async (
    currency
  ) => {

    try {

      await toggleCurrencyStatus(
        companyId,
        currency.id,
        currency.isActive,
        user
      );

      notifySuccess(
        "Moneda actualizada",
        "Los cambios fueron guardados."
      );

      await fetchCurrencies();

    } catch (error) {

      console.error(
        "Error toggling currency status:",
        error
      );

      notifyError(
        "Error",
        error?.message ||
          "No se pudo cambiar el estado de la moneda."
      );

    }

  };


  /* ======================================================
     TABLE COLUMNS
  ====================================================== */

  const columns = useMemo(
    () => [
      {
        key: "code",
        label: "Código",
        sortable: true
      },
      {
        key: "name",
        label: "Nombre",
        sortable: true
      },
      {
        key: "symbol",
        label: "Símbolo",
        sortable: true
      },
      {
        key: "isDefault",
        label: "Predeterminada",
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
        title="Monedas"
        description="Administra los tipos de moneda de la empresa."
      >

        <CatalogSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar moneda..."
        />

        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
        >
          <Plus size={16} />
          Agregar moneda
        </button>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">

        {processedCurrencies.length === 0 ? (

          <CatalogEmpty
            title={
              searchTerm
                ? "No se encontraron monedas"
                : "No hay monedas"
            }
            description={
              searchTerm
                ? "No hay monedas que coincidan con la búsqueda."
                : "Aún no hay monedas configuradas para esta empresa."
            }
            actionLabel="Agregar moneda"
            onAction={handleCreate}
          />

        ) : (

          <DataTable
            data={processedCurrencies}
            columns={columns}
            renderRow={(currency) => (

              <>

                {/* =========================================
                    CODE
                ========================================== */}

                <td>
                  {currency.code}
                </td>


                {/* =========================================
                    NAME
                ========================================== */}

                <td>
                  {currency.name}
                </td>


                {/* =========================================
                    SYMBOL
                ========================================== */}

                <td>
                  {currency.symbol}
                </td>


                {/* =========================================
                    DEFAULT
                ========================================== */}

                <td>
                  {currency.isDefault
                    ? "Sí"
                    : "No"}
                </td>


                {/* =========================================
                    STATUS
                ========================================== */}

                <td>

                  <CatalogStatusBadge
                    value={
                      currency.isActive
                        ? "active"
                        : "unavailable"
                    }
                    options={[
                      {
                        value: "active",
                        label: "Activa"
                      },
                      {
                        value: "unavailable",
                        label: "Inactiva"
                      }
                    ]}
                  />

                </td>


                {/* =========================================
                    ACTIONS
                ========================================== */}

                <td>

                  <CatalogActions>

                    <button
                      type="button"
                      className="catalog-action"
                      onClick={() =>
                        handleEdit(currency)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="catalog-action"
                      onClick={() =>
                        handleToggleStatus(
                          currency
                        )
                      }
                    >
                      {currency.isActive
                        ? "Desactivar"
                        : "Activar"}
                    </button>

                  </CatalogActions>

                </td>

              </>

            )}
          />

        )}

      </div>


      {/* ==================================================
          FORM
      ================================================== */}

      {showModal && (

        <CurrencyForm
          currency={selectedCurrency}
          onClose={handleCloseForm}
          onSave={handleSave}
        />

      )}

    </div>

  );

};


export default CurrenciesSection;