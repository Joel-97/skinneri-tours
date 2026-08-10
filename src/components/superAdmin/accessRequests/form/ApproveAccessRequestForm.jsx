/* ==========================================================
   IMPORTS
========================================================== */

import { useTranslation } from "../../../../hooks/useTranslation";

import "../approveAccessRequestForm/approveAccessRequestForm.css";

import useApproveAccessRequestForm from "../approveAccessRequestForm/hooks/useApproveAccessRequestForm";

import CompanySection from "../approveAccessRequestForm/components/company/CompanySection";
import RoleSection from "../approveAccessRequestForm/components/role/RoleSection";
import ModulesSection from "../approveAccessRequestForm/components/modules/ModulesSection";
import SummarySection from "../approveAccessRequestForm/components/summary/SummarySection";
import ActionsSection from "../approveAccessRequestForm/components/actions/ActionsSection";

/* ==========================================================
   COMPONENT
========================================================== */

export default function ApproveAccessRequestForm({
  request,
  companies = [],
  roles = [],
  modules = [],
  loading = false,
  onApprove,
  onReject,
  onCancel
}) {

  const { t } = useTranslation();

  const {

    form,
    errors,

    updateForm,
    setCompanyMode,
    toggleModule,

    handleSubmit

  } = useApproveAccessRequestForm({
    request
  });

  /* ==========================================================
     SUBMIT
  ========================================================== */

  function handleApprove(event) {

    const approvalData =
      handleSubmit(event);

    if (!approvalData) {
      return;
    }

    onApprove?.(approvalData);

  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <form
      className="approve-access-request-form"
      onSubmit={handleApprove}
    >

      <CompanySection
        t={t}
        form={form}
        errors={errors}
        companies={companies}
        updateForm={updateForm}
        setCompanyMode={setCompanyMode}
      />

      <RoleSection
        t={t}
        form={form}
        roles={roles}
        errors={errors}
        updateForm={updateForm}
      />

      <ModulesSection
        t={t}
        form={form}
        modules={modules}
        errors={errors}
        toggleModule={toggleModule}
      />

      <SummarySection
        t={t}
        form={form}
        request={request}
        companies={companies}
        roles={roles}
        modules={modules}
      />

      <ActionsSection
        t={t}
        loading={loading}
        onCancel={onCancel}
        onReject={onReject}
        onSubmit={handleApprove}
      />

    </form>

  );

}