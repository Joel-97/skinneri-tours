/* ==========================================================
   IMPORTS
========================================================== */

import { useEffect, useState } from "react";

import createInitialForm from "../utils/createInitialForm";
import validateApproveAccessRequest from "../utils/validateApproveAccessRequest";

/* ==========================================================
   HOOK
========================================================== */

export default function useApproveAccessRequestForm({
  request
}) {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [form, setForm] = useState(
    createInitialForm(request)
  );

  const [errors, setErrors] = useState({});

  /*
  ==========================================================
  SYNC REQUEST
  ==========================================================
  */

  useEffect(() => {

    setForm(
      createInitialForm(request)
    );

    setErrors({});

  }, [request]);

  /*
  ==========================================================
  UPDATE FIELD
  ==========================================================
  */

  function updateForm(field, value) {

    setForm(previous => ({
      ...previous,
      [field]: value
    }));

    setErrors(previous => ({
      ...previous,
      [field]: undefined
    }));

  }

  /*
  ==========================================================
  COMPANY MODE
  ==========================================================
  */

  function setCompanyMode(mode) {

    setForm(previous => ({

      ...previous,

      companyMode: mode,

      companyId: "",

      companyName:
        mode === "new"
          ? request?.companyName || ""
          : ""

    }));

    setErrors(previous => ({
      ...previous,
      companyId: undefined,
      companyName: undefined
    }));

  }

  /*
  ==========================================================
  MODULES
  ==========================================================
  */

  function toggleModule(moduleId) {

    setForm(previous => {

      const exists =
        previous.enabledModules.includes(
          moduleId
        );

      return {

        ...previous,

        enabledModules: exists
          ? previous.enabledModules.filter(
              id => id !== moduleId
            )
          : [
              ...previous.enabledModules,
              moduleId
            ]

      };

    });

    setErrors(previous => ({
      ...previous,
      enabledModules: undefined
    }));

  }

  /*
  ==========================================================
  VALIDATE
  ==========================================================
  */

  function validate() {

    const result =
      validateApproveAccessRequest(form);

    setErrors(result.errors);

    return result.isValid;

  }

  /*
  ==========================================================
  BUILD APPROVAL DATA
  ==========================================================
  */

  function buildApprovalData() {

    return {

      requestId: request?.id,

      createCompany:
        form.companyMode === "new",

      companyId: form.companyId,

      companyName: form.companyName,

      role: form.role,

      enabledModules:
        form.enabledModules

    };

  }

  /*
  ==========================================================
  HANDLE SUBMIT
  ==========================================================
  */

  function handleSubmit(event) {

    event?.preventDefault();

    if (!validate()) {
      return null;
    }

    return buildApprovalData();

  }

  /*
  ==========================================================
  RESET
  ==========================================================
  */

  function resetForm() {

    setForm(
      createInitialForm(request)
    );

    setErrors({});

  }

  /*
  ==========================================================
  EXPORTS
  ==========================================================
  */

  return {

    form,

    errors,

    updateForm,

    setCompanyMode,

    toggleModule,

    validate,

    handleSubmit,

    buildApprovalData,

    resetForm

  };

}