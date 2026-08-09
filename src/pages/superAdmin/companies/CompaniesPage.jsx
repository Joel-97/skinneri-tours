import React from "react";

import Button from "../../../components/general/button";
import DataTable from "../../../components/general/dataTable";
import Avatar from "../../../components/general/Avatar";
import SearchInput from "../../../components/general/SearchInput";
import Toolbar from "../../../components/general/Toolbar";

import CompanyModal from "../../../components/superAdmin/CompanyModal";

import useCompanies from "../../../hooks/company/useCompanies";

import useCompaniesController from "../../../controllers/superAdmin/useCompaniesController";

export default function CompaniesPage() {

  /*
  ==========================================================
  COMPANIES
  ==========================================================
  */

  const {

    companies,

    loading,

    reload

  } = useCompanies();

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller = useCompaniesController({

    companies,

    reload

  });

  const {

    /*
    ==========================================
    STATE
    ==========================================
    */

    search,

    setSearch,

    selectedCompany,

    modalOpen,

    mode,

    filteredCompanies,

    /*
    ==========================================
    ACTIONS
    ==========================================
    */

    handleNewCompany,

    handleViewCompany,

    handleEditCompany,

    handleCloseModal,

    handleSaveCompany,

    handleDeleteCompany

  } = controller;

  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

  const columns = [

    {

      key: "logo",

      label: "",

      width: "70px"

    },

    {

      key: "name",

      label: "Empresa",

      sortable: true

    },

    {

      key: "legalName",

      label: "Razón social",

      sortable: true

    },

    {

      key: "province",

      label: "Provincia",

      sortable: true

    },

    {

      key: "country",

      label: "País",

      sortable: true

    },

    {

      key: "email",

      label: "Correo"

    },

    {

      key: "actions",

      label: "Acciones",

      width: "120px"

    }

  ];

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <>

      <Toolbar

        left={

          <SearchInput

            value={search}

            onChange={setSearch}

            placeholder="Buscar empresa..."

          />

        }

        right={

          <Button

            onClick={handleNewCompany}

          >

            Nueva empresa

          </Button>

        }

      />

      <DataTable

        data={filteredCompanies}

        loading={loading}

        columns={columns}

        emptyTitle="No hay empresas registradas."

        emptyDescription="Cuando se registre la primera empresa aparecerá aquí."

        renderRow={(company) => (

          <>

            <td>

              <Avatar

                src={company.logoURL}

                name={company.name}

                size={38}

              />

            </td>

            <td>

              {company.name}

            </td>

            <td>

              {company.legalName}

            </td>

            <td>

              {company.province}

            </td>

            <td>

              {company.country}

            </td>

            <td>

              {company.email}

            </td>

            <td>

              <Button

                onClick={() =>

                  handleViewCompany(company)

                }

              >

                Ver

              </Button>

            </td>

          </>

        )}

      />

      <CompanyModal

        open={modalOpen}

        mode={mode}

        company={selectedCompany}

        onClose={handleCloseModal}

        onEdit={handleEditCompany}

        onSave={handleSaveCompany}

        onDelete={handleDeleteCompany}

      />

    </>

  );

}