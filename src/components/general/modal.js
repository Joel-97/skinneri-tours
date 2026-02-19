import { createPortal } from "react-dom";
import "../../style/general/modal.css";

const Modal = ({ children, onClose }) => {

  return createPortal(
    <div className="app-modal-overlay" onClick={onClose}>
      <div
        className="app-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );

};

export default Modal;
