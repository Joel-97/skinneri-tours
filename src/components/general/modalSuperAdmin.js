import { createPortal } from "react-dom";
import "../../style/general/modal.css";

const Modal = ({ show, onHide, title, children }) => {

  if (!show) return null;

  return createPortal(

    <div
      className="app-modal-overlay"
      onClick={onHide}
    >

      <div
        className="app-modal-content"
        onClick={(e) => e.stopPropagation()}
      >

        {title && (
          <div className="app-modal-header">

            <h3>{title}</h3>

            <button
              className="modal-close-btn"
              onClick={onHide}
            >
              ✕
            </button>

          </div>
        )}

        <div className="app-modal-body">
          {children}
        </div>

      </div>

    </div>,

    document.getElementById("modal-root")

  );

};

export default Modal;