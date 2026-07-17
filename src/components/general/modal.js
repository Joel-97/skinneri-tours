import { createPortal } from "react-dom";
import { useEffect } from "react";

import "../../style/general/modal.css";

const Modal = ({
  children,
  onClose,
  size = "md"
}) => {

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (event.key === "Escape") {
        onClose();
      }

    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [onClose]);

  return createPortal(

    <div
      className="app-modal-overlay"
      onClick={onClose}
    >

      <div
        className={`app-modal-content app-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >

        {children}

      </div>

    </div>,

    document.getElementById("modal-root")

  );

};

export default Modal;