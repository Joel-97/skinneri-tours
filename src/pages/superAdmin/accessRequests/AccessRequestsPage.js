/*
==========================================================
IMPORTS
==========================================================
*/

import { useTranslation } from "../../../hooks/useTranslation";

import useAccessRequests from "../../../hooks/superAdmin/useAccessRequests";
import useCompanies from "../../../hooks/company/useCompanies";

import {
  COMPANY_ROLES
} from "../../../constants/platform/roles";

import {
  ACTIVE_MODULES
} from "../../../constants/platform/modules";

import AccessRequestsFilters from "../../../components/superAdmin/accessRequests/filters/AccessRequestsFilters";
import AccessRequestsTable from "../../../components/superAdmin/accessRequests/table/AccessRequestsTable";

import AccessRequestApprovalModal from "../../../components/superAdmin/accessRequests/modal/AccessRequestApprovalModal";

import ApproveAccessRequestForm from "../../../components/superAdmin/accessRequests/form/ApproveAccessRequestForm";

import RejectAccessRequestModal from "../../../components/superAdmin/accessRequests/modal/RejectAccessRequestModal";

import "./accessRequestsPage.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function AccessRequestsPage() {

  const { t } = useTranslation();

  const {

    /*
    ==========================================
    DATA
    ==========================================
    */

    filteredRequests,

    /*
    ==========================================
    FILTERS
    ==========================================
    */

    search,

    setSearch,

    status,

    setStatus,

    /*
    ==========================================
    DRAWER
    ==========================================
    */

    drawerOpen,

    openDrawer,

    closeDrawer,

    /*
    ==========================================
    REQUEST
    ==========================================
    */

    selectedRequest,

    /*
    ==========================================
    REJECT
    ==========================================
    */

    rejectModalOpen,

    closeRejectModal,

    /*
    ==========================================
    ACTIONS
    ==========================================
    */

    approveRequest,

    rejectRequest,

    /*
    ==========================================
    LOADING
    ==========================================
    */

    loading

  } = useAccessRequests();

  /*
  ==========================================================
  COMPANIES
  ==========================================================
  */

  const {

    companies,

    loading: companiesLoading

  } = useCompanies();

  /*
  ==========================================================
  PLATFORM ROLES
  ==========================================================
  */

  const roles = COMPANY_ROLES.map(role => ({

    id: role.id,

    name: t(role.translationKey),

    description: t(role.descriptionKey),

    level: role.level,

    companyScoped: role.companyScoped

  }));

  /*
  ==========================================================
  PLATFORM MODULES
  ==========================================================
  */

  const modules = ACTIVE_MODULES.map(module => ({

    id: module.id,

    name: t(module.translationKey),

    description: t(module.descriptionKey),

    icon: module.icon

  }));

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <main className="access-requests-page">

      {/* ==================================================
          HEADER
      =================================================== */}

      <header className="access-requests-page-header">

        <h1 className="access-requests-page-title">
          {t("superAdmin.accessRequests.title")}
        </h1>

        <p className="access-requests-page-subtitle">
          {t("superAdmin.accessRequests.subtitle")}
        </p>

      </header>

      {/* ==================================================
          FILTERS
      =================================================== */}

      <AccessRequestsFilters

        search={search}

        status={status}

        onSearchChange={setSearch}

        onStatusChange={setStatus}

      />

      {/* ==================================================
          TABLE
      =================================================== */}

      <AccessRequestsTable

        requests={filteredRequests}

        onView={openDrawer}

      />

      {/* ==================================================
          APPROVAL
      =================================================== */}

      <AccessRequestApprovalModal

        open={drawerOpen}

        request={selectedRequest}

        onClose={closeDrawer}

      >

        <ApproveAccessRequestForm

          request={selectedRequest}

          companies={companies}

          roles={roles}

          modules={modules}

          loading={
            loading ||
            companiesLoading
          }

          onApprove={approveRequest}

          onCancel={closeDrawer}

        />

      </AccessRequestApprovalModal>

      {/* ==================================================
          REJECT
      =================================================== */}

      <RejectAccessRequestModal

        open={rejectModalOpen}

        loading={loading}

        onCancel={closeRejectModal}

        onReject={rejectRequest}

      />

    </main>

  );

}