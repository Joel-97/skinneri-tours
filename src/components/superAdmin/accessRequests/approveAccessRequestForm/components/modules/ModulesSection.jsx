/* ==========================================================
   IMPORTS
========================================================== */

import { Check } from "lucide-react";

/* ==========================================================
   COMPONENT
========================================================== */

export default function ModulesSection({
  t,
  form,
  modules = [],
  errors,
  toggleModule
}) {
  return (
    <section className="approve-access-request-form__section">

      <h3 className="approve-access-request-form__section-title">
        {t(
          "superAdmin.accessRequests.details.enabledModules"
        )}
      </h3>

      <div className="approve-access-request-form__cards">

        {modules.map(module => {

          const selected =
            form.enabledModules.includes(module.id);

          return (

            <button
              key={module.id}
              type="button"
              className={[
                "approve-access-request-form__card",
                selected
                  ? "approve-access-request-form__card--selected"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => toggleModule(module.id)}
            >

              <div className="approve-access-request-form__card-content">

                <div className="approve-access-request-form__card-header">

                  <h4>
                    {module.name}
                  </h4>

                  {
                    selected && (
                      <Check
                        size={18}
                        className="approve-access-request-form__card-check"
                      />
                    )
                  }

                </div>

                {
                  module.description && (
                    <p>
                      {module.description}
                    </p>
                  )
                }

              </div>

            </button>

          );

        })}
      </div>

      {
        errors.enabledModules && (
          <small className="approve-access-request-form__error">
            {t(errors.enabledModules)}
          </small>
        )
      }

    </section>
  );
}