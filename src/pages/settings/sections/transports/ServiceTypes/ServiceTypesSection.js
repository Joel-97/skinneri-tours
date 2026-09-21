import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getServiceTypes,
  createServiceType,
  updateServiceType,
  toggleServiceTypeStatus
} from "../../../../../services/settings/general/serviceTypeService";

import {
  getCurrencies
} from "../../../../../services/settings/general/currencyService";

import {
  useAuth
} from "../../../../../context/AuthContext";

import DataTable
  from "../../../../../components/general/dataTable";

import Loading
  from "../../../../../components/general/loading";

import ServiceTypesForm
  from "./ServiceTypesForm";

import CatalogHeader
  from "../../../components/CatalogHeader";

import CatalogSearch
  from "../../../components/CatalogSearch";

import CatalogToolbar
  from "../../../components/CatalogToolbar";

import CatalogEmpty
  from "../../../components/CatalogEmpty";

import CatalogStatusBadge
  from "../../../components/CatalogStatusBadge";

import CatalogActions
  from "../../../components/CatalogActions";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


const SERVICE_STATUS_OPTIONS = [
  {
    value: "active",
    label: "Activo"
  },
  {
    value: "inactive",
    label: "Inactivo"
  }
];


const TABLE_COLUMNS = [
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
    key: "pricingMode",
    label: "Modo",
    sortable: true
  },
  {
    key: "basePrice",
    label: "Precio",
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
];


const compareValues = (a, b) => {
  if (typeof a === "boolean") {
    return Number(a) - Number(b);
  }

  if (typeof a === "number") {
    return (
      (Number(a) || 0) -
      (Number(b) || 0)
    );
  }

  return String(a ?? "")
    .toLowerCase()
    .localeCompare(
      String(b ?? "").toLowerCase()
    );
};


const ServiceTypesSection = () => {
  const { session } = useAuth();

  const user = session?.user;
  const companyId = session?.company?.id;


  const [serviceTypes, setServiceTypes] =
    useState([]);

  const [currencies, setCurrencies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedServiceType, setSelectedServiceType] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [sortConfig, setSortConfig] =
    useState({
      key: "name",
      direction: "asc"
    });


  /*
   * LOAD DATA
   */

  const fetchServiceTypes = useCallback(
    async () => {
      if (!companyId) {
        setServiceTypes([]);
        setCurrencies([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [
          serviceTypesData,
          currenciesData
        ] = await Promise.all([
          getServiceTypes(companyId),
          getCurrencies(companyId)
        ]);

        setServiceTypes(
          [...serviceTypesData].sort(
            (a, b) =>
              String(a.name || "")
                .localeCompare(
                  String(b.name || "")
                )
          )
        );

        setCurrencies(
          currenciesData.filter(
            currency => currency.isActive
          )
        );
      } catch (error) {
        console.error(
          "Error loading service types:",
          error
        );

        notifyError(
          error?.message ||
          "No fue posible cargar los servicios de transporte."
        );
      } finally {
        setLoading(false);
      }
    },
    [companyId]
  );


  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);


  /*
   * RESET PAGINATION
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    rowsPerPage
  ]);


  /*
   * SORT
   */

  const handleSort = useCallback(
    (key) => {
      setSortConfig(previous => ({
        key,
        direction:
          previous.key === key &&
          previous.direction === "asc"
            ? "desc"
            : "asc"
      }));
    },
    []
  );


  /*
   * FILTER + SORT
   */

  const processedServiceTypes =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      const filtered = term
        ? serviceTypes.filter(
            serviceType =>
              [
                serviceType.code,
                serviceType.name,
                serviceType.pricingMode,
                serviceType.pricingType,
                serviceType.currency
              ].some(value =>
                String(value || "")
                  .toLowerCase()
                  .includes(term)
              )
          )
        : [...serviceTypes];

      const {
        key,
        direction
      } = sortConfig;

      return filtered.sort(
        (a, b) => {
          const result =
            compareValues(
              a?.[key],
              b?.[key]
            );

          return direction === "asc"
            ? result
            : -result;
        }
      );
    }, [
      serviceTypes,
      searchTerm,
      sortConfig
    ]);


  /*
   * MODAL
   */

  const openCreateModal = () => {
    setSelectedServiceType(null);
    setShowModal(true);
  };


  const openEditModal = (
    serviceType
  ) => {
    setSelectedServiceType(
      serviceType
    );

    setShowModal(true);
  };


  const closeModal = () => {
    setSelectedServiceType(null);
    setShowModal(false);
  };


  /*
   * SAVE
   */

  const handleSave = async (
    formData
  ) => {
    if (!companyId) {
      throw new Error(
        "No se encontró la empresa."
      );
    }

    if (!user) {
      throw new Error(
        "No se encontró el usuario autenticado."
      );
    }

    try {
      if (selectedServiceType?.id) {
        await updateServiceType(
          companyId,
          selectedServiceType.id,
          formData,
          user
        );

        notifySuccess(
          "Servicio actualizado",
          "Los cambios fueron guardados correctamente."
        );
      } else {
        await createServiceType(
          companyId,
          formData,
          user
        );

        notifySuccess(
          "Servicio creado",
          "El servicio fue creado correctamente."
        );
      }

      closeModal();
      await fetchServiceTypes();
    } catch (error) {
      console.error(
        "Error saving service type:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible guardar el servicio."
      );

      throw error;
    }
  };


  /*
   * TOGGLE STATUS
   */

  const handleToggle = async (
    serviceType
  ) => {
    if (!companyId) {
      notifyError(
        "No se encontró la empresa."
      );
      return;
    }

    const isActive =
      Boolean(
        serviceType.isActive
      );

    const action =
      isActive
        ? "desactivar"
        : "activar";

    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} este servicio?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await toggleServiceTypeStatus(
        companyId,
        serviceType.id,
        isActive
      );

      notifySuccess(
        "Estado actualizado",
        `El servicio fue ${
          isActive
            ? "desactivado"
            : "activado"
        } correctamente.`
      );

      await fetchServiceTypes();
    } catch (error) {
      console.error(
        "Error updating service type status:",
        error
      );

      notifyError(
        error?.message ||
        "No fue posible actualizar el estado."
      );
    }
  };


  /*
   * LOADING
   */

  if (loading) {
    return <Loading />;
  }


  /*
   * RENDER
   */

  return (
    <div className="catalog-container">

      <CatalogHeader
        title="Servicios de transporte"
        description="Define cómo se calcula el precio de cada servicio de transporte."
      >
        <CatalogToolbar>

          <CatalogSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar servicio..."
          />

          <button
            type="button"
            className="btn-primary"
            onClick={openCreateModal}
          >
            + Agregar servicio
          </button>

        </CatalogToolbar>
      </CatalogHeader>


      {showModal && (
        <ServiceTypesForm
          serviceType={
            selectedServiceType
          }
          currencies={currencies}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}


      <div className="catalog-content">

        {processedServiceTypes.length === 0 ? (
          <CatalogEmpty
            message="No hay servicios de transporte registrados."
          />
        ) : (
          <DataTable
            data={
              processedServiceTypes
            }
            currentPage={
              currentPage
            }
            rowsPerPage={
              rowsPerPage
            }
            sortConfig={
              sortConfig
            }
            onSort={
              handleSort
            }
            columns={
              TABLE_COLUMNS
            }
            renderRow={
              serviceType => (
                <React.Fragment
                  key={
                    serviceType.id
                  }
                >

                  <td>
                    {serviceType.code ||
                      "—"}
                  </td>


                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: "20px",
                          height: "20px",
                          minWidth: "20px",
                          borderRadius: "50%",
                          backgroundColor:
                            serviceType.color ||
                            "#3B82F6",
                          border:
                            "2px solid #ffffff",
                          boxShadow:
                            "0 0 0 1px #d1d5db"
                        }}
                      />

                      <strong>
                        {
                          serviceType.name ||
                          "—"
                        }
                      </strong>
                    </div>
                  </td>


                  <td>
                    {
                      serviceType.pricingMode ===
                      "fixed"
                        ? "Precio fijo"
                        : "Precio manual"
                    }
                  </td>


                  <td>
                    {
                      serviceType.pricingMode ===
                      "fixed"
                        ? `${serviceType.symbol || ""} ${
                            serviceType.basePrice ?? 0
                          }`
                        : "—"
                    }
                  </td>


                  <td>
                    <CatalogStatusBadge
                      value={
                        serviceType.isActive
                          ? "active"
                          : "inactive"
                      }
                      options={
                        SERVICE_STATUS_OPTIONS
                      }
                    />
                  </td>


                  <td>
                    <CatalogActions>

                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          openEditModal(
                            serviceType
                          )
                        }
                      >
                        Editar
                      </button>


                      <button
                        type="button"
                        className="catalog-action"
                        onClick={() =>
                          handleToggle(
                            serviceType
                          )
                        }
                      >
                        {
                          serviceType.isActive
                            ? "Desactivar"
                            : "Activar"
                        }
                      </button>

                    </CatalogActions>
                  </td>

                </React.Fragment>
              )
            }
          />
        )}

      </div>
    </div>
  );
};


export default ServiceTypesSection;