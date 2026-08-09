/*
==========================================================
IMPORTS
==========================================================
*/

import { X } from "lucide-react";

import Modal from "../../../general/modal";

import AccessRequestApplicantCard from "../applicant/AccessRequestApplicantCard";

import { useTranslation } from "../../../../hooks/useTranslation";

import "./accessRequestApprovalModal.css";

/*
==========================================================
COMPONENT
==========================================================
*/

const AccessRequestApprovalModal = ({
  open = false,
  request = null,
  onClose,
  children
}) => {

  const { t } = useTranslation();

  /*
  ==========================================================
  HIDDEN
  ==========================================================
  */

  if (!open || !request) {
    return null;
  }

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <Modal
      size="xl"
      onClose={onClose}
    >

      <div className="access-request-approval-modal">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="access-request-approval-modal__header">

          <div>

            <h2 className="access-request-approval-modal__title">

              {
                t(
                  "superAdmin.accessRequests.details.title",
                  "Approve Access Request"
                )
              }

            </h2>

            <p className="access-request-approval-modal__subtitle">

              {
                t(
                  "superAdmin.accessRequests.details.subtitle",
                  "Review the applicant information and configure the account before approving access."
                )
              }

            </p>

          </div>

          <button
            type="button"
            className="access-request-approval-modal__close"
            onClick={onClose}
            aria-label={t("common.close", "Close")}
          >

            <X size={22} />

          </button>

        </header>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="access-request-approval-modal__body">

          <AccessRequestApplicantCard
            request={request}
          />

          <div
            className="access-request-approval-modal__content"
          >

            {children}

          </div>

        </div>

      </div>

    </Modal>

  );

};

export default AccessRequestApprovalModal;