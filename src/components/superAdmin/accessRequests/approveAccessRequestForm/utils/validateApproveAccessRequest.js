/* ==========================================================
   VALIDATE APPROVE ACCESS REQUEST
========================================================== */

export default function validateApproveAccessRequest(form = {}) {
  const errors = {};

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  if (form.companyMode === "new") {
    if (!form.companyName?.trim()) {
      errors.companyName = "Company name is required.";
    }
  }

  if (form.companyMode === "existing") {
    if (!form.companyId) {
      errors.companyId = "Please select an existing company.";
    }
  }

  /*
  ==========================================================
  ROLE
  ==========================================================
  */

  if (!form.role) {
    errors.role = "Please select a role.";
  }

  /*
  ==========================================================
  MODULES
  ==========================================================
  */

  if (
    !Array.isArray(form.enabledModules) ||
    form.enabledModules.length === 0
  ) {
    errors.enabledModules =
      "Please select at least one module.";
  }

  /*
  ==========================================================
  RESULT
  ==========================================================
  */

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}