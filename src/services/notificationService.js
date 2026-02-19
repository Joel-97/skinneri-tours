import Swal from "sweetalert2";

/* =========================================================
   ALERTA DE ÉXITO
========================================================= */

export const notifySuccess = (title, text = "") => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#08204B",
    heightAuto: false,
    scrollbarPadding: false
  });
};


/* =========================================================
   ALERTA DE ERROR
========================================================= */

export const notifyError = (title, text = "") => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#08204B",
    heightAuto: false,
    scrollbarPadding: false
  });
};


/* =========================================================
   ALERTA DE ADVERTENCIA
========================================================= */

export const notifyWarning = (title, text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#08204B",
    heightAuto: false,
    scrollbarPadding: false
  });
};


/* =========================================================
   CONFIRMACIÓN (ELIMINAR, ETC)
========================================================= */

export const notifyConfirm = async (title, text = "") => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#08204B",
    cancelButtonColor: "#b91c1c", // 👈 rojo elegante
    heightAuto: false,
    scrollbarPadding: false
  });

  return result.isConfirmed;
};



/* =========================================================
   TOAST (pequeña notificación arriba)
========================================================= */

export const notifyToast = (icon, title) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
  });
};
