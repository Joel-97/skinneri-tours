/* ==========================================================
   IMPORTS
========================================================== */

import { ShieldCheck } from "lucide-react";

/* ==========================================================
   COMPONENT
========================================================== */

export default function RoleSection({
  t,
  form,
  roles = [],
  errors = {},
  updateForm
}) {

  /*
  ==========================================================
  EMPTY STATE
  ==========================================================
  */

  if (!roles.length) {
    return (
      <section className="approve-access-request-form__section">

        <h3 className="approve-access-request-form__section-title">
          {t("superAdmin.accessRequests.details.role")}
        </h3>

        <p className="approve-access-request-form__empty">
          No hay roles disponibles.
        </p>

      </section>
    );
  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <section className="approve-access-request-form__section">

      <h3 className="approve-access-request-form__section-title">
        {t("superAdmin.accessRequests.details.role")}
      </h3>

      <div className="approve-access-request-form__cards">

        {

          roles.map(role => {

            const roleId =
              role.id ??
              role.roleId ??
              role.value;

            const roleName =
              role.name ??
              role.title ??
              role.label ??
              "Unnamed Role";

            const roleDescription =
              role.description ??
              role.details ??
              "";

            const selected =
              form.role === roleId;

            return (

              <button
                key={roleId}
                type="button"
                className={[
                  "approve-access-request-form__card",
                  selected
                    ? "approve-access-request-form__card--selected"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  updateForm("role", roleId)
                }
              >

                <div className="approve-access-request-form__card-icon">
                  <ShieldCheck size={20} />
                </div>

                <div className="approve-access-request-form__card-content">

                  <h4>
                    {roleName}
                  </h4>

                  {
                    roleDescription && (
                      <p>
                        {roleDescription}
                      </p>
                    )
                  }

                </div>

              </button>

            );

          })

        }

      </div>

      {

        errors.role && (

          <small className="approve-access-request-form__error">
            {t(errors.role)}
          </small>

        )

      }

    </section>

  );

}