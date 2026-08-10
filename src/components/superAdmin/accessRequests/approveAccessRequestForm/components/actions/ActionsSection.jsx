/* ==========================================================
   COMPONENT
========================================================== */

export default function ActionsSection({
  t,
  loading = false,
  onCancel,
  onReject,
  onSubmit
}) {
  return (
    <section className="approve-access-request-form__actions">

      <button
        type="button"
        className="approve-access-request-form__button approve-access-request-form__button--secondary"
        disabled={loading}
        onClick={onCancel}
      >
        {t("superAdmin.accessRequests.actions.cancel")}
      </button>

      <button
        type="button"
        className="approve-access-request-form__button approve-access-request-form__button--danger"
        disabled={loading}
        onClick={onReject}
      >
        {t("superAdmin.accessRequests.actions.reject")}
      </button>

      <button
        type="submit"
        className="approve-access-request-form__button approve-access-request-form__button--primary"
        disabled={loading}
        onClick={onSubmit}
      >
        {
          loading
            ? t("auth.messages.loading")
            : t("superAdmin.accessRequests.actions.approve")
        }
      </button>

    </section>
  );
}