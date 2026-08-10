/* ==========================================================
   IMPORTS
========================================================== */

import { Circle, CircleDot } from "lucide-react";

/* ==========================================================
   COMPONENT
========================================================== */

export default function CompanySection({
  t,
  form,
  errors,
  companies = [],
  updateForm,
  setCompanyMode
}) {
  return (
    <section className="approve-access-request-form__section">

      <h3 className="approve-access-request-form__section-title">
        {t("superAdmin.accessRequests.details.company")}
      </h3>

      {/* ======================================================
          COMPANY TYPE
      ======================================================= */}

      <div className="approve-access-request-form__company-options">

        <button
          type="button"
          className="approve-access-request-form__radio-option"
          onClick={() => setCompanyMode("new")}
        >
          {form.companyMode === "new"
            ? <CircleDot size={18} />
            : <Circle size={18} />
          }

          <span>
            {t(
              "superAdmin.accessRequests.details.createCompany"
            )}
          </span>

        </button>

        <button
          type="button"
          className="approve-access-request-form__radio-option"
          onClick={() => setCompanyMode("existing")}
        >
          {form.companyMode === "existing"
            ? <CircleDot size={18} />
            : <Circle size={18} />
          }

          <span>
            {t(
              "superAdmin.accessRequests.details.existingCompany"
            )}
          </span>

        </button>

      </div>

      {/* ======================================================
          CREATE COMPANY
      ======================================================= */}

      {
        form.companyMode === "new" && (

          <div className="approve-access-request-form__group">

            <label>
              {t(
                "superAdmin.accessRequests.details.companyName"
              )}
            </label>

            <input
              type="text"
              value={form.companyName}
              onChange={(event) =>
                updateForm(
                  "companyName",
                  event.target.value
                )
              }
            />

            {
              errors.companyName && (
                <small className="approve-access-request-form__error">
                  {t(errors.companyName)}
                </small>
              )
            }

          </div>

        )
      }

      {/* ======================================================
          EXISTING COMPANY
      ======================================================= */}

      {
        form.companyMode === "existing" && (

          <div className="approve-access-request-form__group">

            <label>
              {t(
                "superAdmin.accessRequests.details.company"
              )}
            </label>

            <select
              value={form.companyId}
              onChange={(event) =>
                updateForm(
                  "companyId",
                  event.target.value
                )
              }
            >

              <option value="">
                --
              </option>

              {
                companies.map(company => (

                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </option>

                ))
              }

            </select>

            {
              errors.companyId && (
                <small className="approve-access-request-form__error">
                  {t(errors.companyId)}
                </small>
              )
            }

          </div>

        )
      }

    </section>
  );
}