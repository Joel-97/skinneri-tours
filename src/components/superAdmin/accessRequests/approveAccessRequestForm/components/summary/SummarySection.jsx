/* ==========================================================
   COMPONENT
========================================================== */

export default function SummarySection({
  t,
  form,
  request = {},
  companies = [],
  roles = [],
  modules = []
}) {

  /*
  ==========================================================
  DATA
  ==========================================================
  */

  const applicantName =
    request.name ||
    request.fullName ||
    request.displayName ||
    [
      request.firstName,
      request.lastName
    ]
      .filter(Boolean)
      .join(" ") ||
    "-";

  const applicantEmail =
    request.email || "-";

  const selectedCompany =
    companies.find(
      company => company.id === form.companyId
    );

  const selectedRole =
    roles.find(
      role => role.id === form.role
    );

  const selectedModules =
    modules.filter(module =>
      form.enabledModules.includes(module.id)
    );

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <section className="approve-access-request-form__section">

      <h3 className="approve-access-request-form__section-title">
        {t("superAdmin.accessRequests.details.summary")}
      </h3>

      <div className="approve-access-request-form__summary">

        {/* ==================================================
            APPLICANT
        =================================================== */}

        <div className="approve-access-request-form__summary-item">

          <span className="approve-access-request-form__summary-label">
            {t("superAdmin.accessRequests.details.applicant")}
          </span>

          <strong>
            {applicantName}
          </strong>

          <small>
            {applicantEmail}
          </small>

        </div>

        {/* ==================================================
            COMPANY
        =================================================== */}

        <div className="approve-access-request-form__summary-item">

          <span className="approve-access-request-form__summary-label">
            {t("superAdmin.accessRequests.details.company")}
          </span>

          <strong>
            {
              form.companyMode === "new"
                ? (
                    form.companyName ||
                    "-"
                  )
                : (
                    selectedCompany?.name ||
                    "-"
                  )
            }
          </strong>

          <small>
            {
              form.companyMode === "new"
                ? t(
                    "superAdmin.accessRequests.details.createCompany"
                  )
                : t(
                    "superAdmin.accessRequests.details.existingCompany"
                  )
            }
          </small>

        </div>

        {/* ==================================================
            ROLE
        =================================================== */}

        <div className="approve-access-request-form__summary-item">

          <span className="approve-access-request-form__summary-label">
            {t("superAdmin.accessRequests.details.role")}
          </span>

          <strong>
            {selectedRole?.name || "-"}
          </strong>

          {
            selectedRole?.description && (
              <small>
                {selectedRole.description}
              </small>
            )
          }

        </div>

        {/* ==================================================
            MODULES
        =================================================== */}

        <div className="approve-access-request-form__summary-item">

          <span className="approve-access-request-form__summary-label">
            {t("superAdmin.accessRequests.details.enabledModules")}
          </span>

          {
            selectedModules.length > 0
              ? (
                <ul className="approve-access-request-form__summary-list">

                  {
                    selectedModules.map(module => (

                      <li key={module.id}>
                        {module.name}
                      </li>

                    ))
                  }

                </ul>
              )
              : (
                <small>-</small>
              )
          }

        </div>

      </div>

    </section>

  );

}