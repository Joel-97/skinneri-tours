import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Plus } from "lucide-react";

import {
  getTaxes,
  createTax,
  updateTax,
  toggleTaxStatus
} from "../../../../../services/settings/general/taxService";

import {
  getCurrencies
} from "../../../../../services/settings/general/currencyService";

import { useAuth } from "../../../../../context/AuthContext";

import DataTable from "../../../../../components/general/dataTable";
import Loading from "../../../../../components/general/loading";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogSearch from "../../../components/CatalogSearch";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import TaxesForm from "./TaxesForm";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";

const TaxesSection = () => {
  const { session } = useAuth();

  const user = session?.user;
  const companyId = session?.company?.id;

  const [taxes, setTaxes] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTax, setSelectedTax] = useState(null);

  const [showModal, setShowModal] = useState(false);

  /* ===============================
     LOAD DATA
  ================================ */

  const fetchData = useCallback(async () => {
    if (!companyId) {
      return;
    }

    try {
      setLoading(true);

      const [
        taxesData,
        currenciesData
      ] = await Promise.all([
        getTaxes(companyId),
        getCurrencies(companyId)
      ]);

      const sortedTaxes = [
        ...taxesData
      ].sort(
        (a, b) =>
          Number(b.isDefault) -
          Number(a.isDefault)
      );

      setTaxes(sortedTaxes);

      setCurrencies(
        currenciesData.filter(
          (currency) => currency.isActive
        )
      );
    } catch (error) {
      console.error(
        "Error loading taxes:",
        error
      );

      notifyError(
        "Error",
        "No se pudieron cargar los impuestos."
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ===============================
     SEARCH
  ================================ */

  const processedTaxes = useMemo(() => {
    const term = searchTerm
      .trim()
      .toLowerCase();

    if (!term) {
      return taxes;
    }

    return taxes.filter((tax) => {
      return (
        tax.name
          ?.toLowerCase()
          .includes(term) ||
        tax.type
          ?.toLowerCase()
          .includes(term) ||
        tax.rate
          ?.toString()
          .includes(term) ||
        tax.currency
          ?.toLowerCase()
          .includes(term)
      );
    });
  }, [taxes, searchTerm]);

  /* ===============================
     CREATE
  ================================ */

  const handleCreate = () => {
    setSelectedTax(null);
    setShowModal(true);
  };

  /* ===============================
     EDIT
  ================================ */

  const handleEdit = (tax) => {
    setSelectedTax(tax);
    setShowModal(true);
  };

  /* ===============================
     CLOSE FORM
  ================================ */

  const handleCloseForm = () => {
    setSelectedTax(null);
    setShowModal(false);
  };

  /* ===============================
     SAVE
  ================================ */

  const handleSave = async (formData) => {
    try {
      if (selectedTax) {
        await updateTax(
          companyId,
          selectedTax.id,
          formData,
          user
        );

        notifySuccess(
          "Impuesto actualizado",
          "Los cambios fueron guardados correctamente."
        );
      } else {
        await createTax(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Impuesto creado",
          "El impuesto fue creado correctamente."
        );
      }

      handleCloseForm();

      await fetchData();
    } catch (error) {
      console.error(
        "Error saving tax:",
        error
      );

      notifyError(
        "Error al guardar",
        error?.message ||
          "Ocurrió un error inesperado."
      );

      throw error;
    }
  };

  /* ===============================
     TOGGLE STATUS
  ================================ */

  const handleToggleStatus = async (tax) => {
    const confirmed =
      await notifyConfirm(
        `¿Deseas ${
          tax.isActive
            ? "desactivar"
            : "activar"
        } este impuesto?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await toggleTaxStatus(
        companyId,
        tax.id,
        tax.isActive,
        user
      );

      notifySuccess(
        "Estado actualizado",
        `El impuesto fue ${
          tax.isActive
            ? "desactivado"
            : "activado"
        } correctamente.`
      );

      await fetchData();
    } catch (error) {
      console.error(
        "Error toggling tax status:",
        error
      );

      notifyError(
        "No se pudo actualizar",
        error?.message ||
          "Ocurrió un error inesperado."
      );
    }
  };

  /* ===============================
     CURRENCY SYMBOL
  ================================ */

  const getCurrencySymbol = (code) => {
    const currency =
      currencies.find(
        (item) => item.code === code
      );

    return currency?.symbol || "";
  };

  /* ===============================
     TABLE COLUMNS
  ================================ */

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Nombre",
        sortable: true
      },
      {
        key: "rate",
        label: "Tasa",
        sortable: true
      },
      {
        key: "isDefault",
        label: "Predeterminado",
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

  /* ===============================
     LOADING
  ================================ */

  if (loading) {
    return <Loading />;
  }

  /* ===============================
     RENDER
  ================================ */

  return (
    <div className="catalog-container">

      <CatalogHeader
        title="Impuestos"
        description="Administra los impuestos de tu empresa."
      >
        <CatalogSearch
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar impuesto..."
        />

        <button
          type="button"
          className="btn-primary"
          onClick={handleCreate}
        >
          <Plus size={16} />
          Agregar impuesto
        </button>
      </CatalogHeader>

      <div className="catalog-content">

        {processedTaxes.length === 0 ? (

          <CatalogEmpty
            title={
              searchTerm.trim()
                ? "No se encontraron impuestos"
                : "No hay impuestos"
            }
            description={
              searchTerm.trim()
                ? "No hay impuestos que coincidan con tu búsqueda."
                : "Aún no hay impuestos creados."
            }
            actionLabel={
              searchTerm.trim()
                ? undefined
                : "Agregar impuesto"
            }
            onAction={
              searchTerm.trim()
                ? undefined
                : handleCreate
            }
          />

        ) : (

          <DataTable
            data={processedTaxes}
            columns={columns}
            renderRow={(tax) => (
              <>
                {/* =========================
                    NAME
                ========================== */}

                <td>
                  {tax.name}
                </td>

                {/* =========================
                    RATE
                ========================== */}

                <td>
                  {tax.type === "percentage"
                    ? `${tax.rate}%`
                    : `${getCurrencySymbol(
                        tax.currency
                      )}${tax.rate}`}
                </td>

                {/* =========================
                    DEFAULT
                ========================== */}

                <td>
                  {tax.isDefault
                    ? "Sí"
                    : "-"}
                </td>

                {/* =========================
                    STATUS
                ========================== */}

                <td>
                  <CatalogStatusBadge
                    value={
                      tax.isActive
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
                      }
                    ]}
                  />
                </td>

                {/* =========================
                    ACTIONS
                ========================== */}

                <td>
                  <CatalogActions>

                    <button
                      type="button"
                      className="catalog-action"
                      onClick={() =>
                        handleEdit(tax)
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="catalog-action"
                      onClick={() =>
                        handleToggleStatus(
                          tax
                        )
                      }
                    >
                      {tax.isActive
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

      {showModal && (
        <TaxesForm
          tax={selectedTax}
          currencies={currencies}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

    </div>
  );
};

export default TaxesSection;