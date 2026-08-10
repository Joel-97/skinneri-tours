/*
==========================================================
IMPORTS
==========================================================
*/

import {

  useMemo,
  useState

} from "react";

import {

  createCompany,
  updateCompany,
  deleteCompany

} from "../../services/platform/companyService";

import {

  notifySuccess,
  notifyError,
  notifyWarning,
  notifyConfirm

} from "../../services/notificationService";

/*
==========================================================
CONTROLLER
==========================================================
*/

export default function useCompaniesController({

  companies,

  reload

}) {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    search,

    setSearch

  ] = useState("");

  const [

    selectedCompany,

    setSelectedCompany

  ] = useState(null);

  const [

    modalOpen,

    setModalOpen

  ] = useState(false);

  const [

    mode,

    setMode

  ] = useState("view");

  /*
  ==========================================================
  FILTERED COMPANIES
  ==========================================================
  */

  const filteredCompanies = useMemo(() => {

    const value =

      search

        .trim()

        .toLowerCase();

    if (!value) {

      return companies;

    }

    return companies.filter(company => (

      company.name?.toLowerCase().includes(value) ||

      company.legalName?.toLowerCase().includes(value) ||

      company.email?.toLowerCase().includes(value) ||

      company.country?.toLowerCase().includes(value) ||

      company.province?.toLowerCase().includes(value)

    ));

  }, [

    companies,

    search

  ]);

  /*
  ==========================================================
  BUILD COMPANY PAYLOAD
  ==========================================================
  */

  const buildCompanyPayload = (company) => {

    return {

      name:

        company.name?.trim() || "",

      legalName:

        company.legalName?.trim() || "",

      identificationType:

        company.identificationType || "",

      identificationNumber:

        company.identificationNumber?.trim() || "",

      email:

        company.email?.trim() || "",

      phone:

        company.phone?.trim() || "",

      website:

        company.website?.trim() || "",

      timezone:

        company.timezone || "",

      primaryColor:

        company.primaryColor || "#08204B",

      country:

        company.country || "",

      province:

        company.province?.trim() || "",

      city:

        company.city?.trim() || "",

      address:

        company.address?.trim() || "",

      postalCode:

        company.postalCode?.trim() || "",

      logoURL:

        company.logoURL || "",

      status:

        company.status,

      enabledModules:

        company.enabledModules || []

    };

  };

  /*
  ==========================================================
  VALIDATIONS
  ==========================================================
  */

  const validateCompany = (company) => {

    if (!company.name?.trim()) {

      notifyWarning(

        "Información incompleta",

        "Debe ingresar el nombre de la empresa."

      );

      return false;

    }

    if (company.name.trim().length < 3) {

      notifyWarning(

        "Información incompleta",

        "El nombre debe tener al menos 3 caracteres."

      );

      return false;

    }

    if (!company.status) {

      notifyWarning(

        "Información incompleta",

        "Debe seleccionar un estado."

      );

      return false;

    }

    if (

      !company.enabledModules ||

      company.enabledModules.length === 0

    ) {

      notifyWarning(

        "Información incompleta",

        "Debe habilitar al menos un módulo."

      );

      return false;

    }

    if (

      company.email &&

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

        company.email

      )

    ) {

      notifyWarning(

        "Correo inválido",

        "Ingrese un correo electrónico válido."

      );

      return false;

    }

    return true;

  };

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleNewCompany = () => {

    setSelectedCompany(null);

    setMode("create");

    setModalOpen(true);

  };

  const handleViewCompany = (company) => {

    setSelectedCompany(company);

    setMode("view");

    setModalOpen(true);

  };

  const handleEditCompany = () => {

    setMode("edit");

  };

  const handleCloseModal = () => {

    setModalOpen(false);

    setSelectedCompany(null);

    setMode("view");

  };

  /*
  ==========================================================
  SAVE
  ==========================================================
  */

  const handleSaveCompany = async (company) => {

    if (

      !validateCompany(company)

    ) {

      return;

    }

    const payload =

      buildCompanyPayload(

        company

      );

    let result;

    switch (mode) {

      case "create":

        result =

          await createCompany(

            payload

          );

        break;

      case "edit":

        result =

          await updateCompany(

            selectedCompany.id,

            payload

          );

        break;

      default:

        return;

    }

    if (!result.success) {

      notifyError(

        "No fue posible guardar la empresa",

        "Intente nuevamente."

      );

      return;

    }

    notifySuccess(

      "Éxito",

      "La información se guardó correctamente."

    );

    await reload();

    handleCloseModal();

  };

  /*
  ==========================================================
  DELETE
  ==========================================================
  */

  const handleDeleteCompany = async () => {

    if (!selectedCompany) {

      return;

    }

    const confirmed = await notifyConfirm(

      "Eliminar empresa",

      `¿Desea eliminar "${selectedCompany.name}"? Esta acción no se puede deshacer.`

    );

    if (!confirmed) {

      return;

    }

    const result = await deleteCompany(

      selectedCompany.id

    );

    if (!result.success) {

      notifyError(

        "No fue posible eliminar la empresa",

        "Intente nuevamente."

      );

      return;

    }

    notifySuccess(

      "Empresa eliminada",

      "La empresa fue eliminada correctamente."

    );

    await reload();

    handleCloseModal();

  };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    search,

    setSearch,

    selectedCompany,

    modalOpen,

    mode,

    filteredCompanies,

    handleNewCompany,

    handleViewCompany,

    handleEditCompany,

    handleCloseModal,

    handleSaveCompany,

    handleDeleteCompany

  };

}