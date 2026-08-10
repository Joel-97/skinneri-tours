/*
==========================================================
IMPORTS
==========================================================
*/

import {

  useMemo,
  useState

} from "react";

import {

  notifySuccess,
  notifyError,
  notifyWarning,
  notifyConfirm

} from "../../services/notificationService";

/*
==========================================================
CONTROLLER
==========================================================
*/

export default function useUsersController({

  users,

  load,

  update,

  remove

}) {

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    search,

    setSearch

  ] = useState("");

  const [

    selectedUser,

    setSelectedUser

  ] = useState(null);

  const [

    modalOpen,

    setModalOpen

  ] = useState(false);

  const [

    mode,

    setMode

  ] = useState("view");

  /*
  ==========================================================
  FILTERED USERS
  ==========================================================
  */

  const filteredUsers = useMemo(() => {

    const value =

      search

        .trim()

        .toLowerCase();

    if (!value) {

      return users;

    }

    return users.filter(user => (

      user.displayName?.toLowerCase().includes(value) ||

      user.email?.toLowerCase().includes(value) ||

      user.role?.toLowerCase().includes(value)

    ));

  }, [

    users,

    search

  ]);

  /*
  ==========================================================
  VALIDATIONS
  ==========================================================
  */

  const validateUser = (user) => {

    if (!user.displayName?.trim()) {

      notifyWarning(

        "Información incompleta",

        "Debe ingresar el nombre del usuario."

      );

      return false;

    }

    if (!user.email?.trim()) {

      notifyWarning(

        "Información incompleta",

        "Debe ingresar el correo electrónico."

      );

      return false;

    }

    if (

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

        user.email

      )

    ) {

      notifyWarning(

        "Correo inválido",

        "Ingrese un correo electrónico válido."

      );

      return false;

    }

    if (!user.companyId) {

      notifyWarning(

        "Información incompleta",

        "Debe seleccionar una empresa."

      );

      return false;

    }

    if (!user.role) {

      notifyWarning(

        "Información incompleta",

        "Debe seleccionar un rol."

      );

      return false;

    }

    if (!user.status) {

      notifyWarning(

        "Información incompleta",

        "Debe seleccionar un estado."

      );

      return false;

    }

    return true;

  };

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleNewUser = () => {

    setSelectedUser(null);

    setMode("create");

    setModalOpen(true);

  };

  const handleViewUser = (user) => {

    setSelectedUser(user);

    setMode("view");

    setModalOpen(true);

  };

  const handleEditUser = () => {

    setMode("edit");

  };

  const handleCloseModal = () => {

    setModalOpen(false);

    setSelectedUser(null);

    setMode("view");

  };

  /*
  ==========================================================
  SAVE
  ==========================================================
  */

  const handleSaveUser = async (user) => {

    if (

      !validateUser(user)

    ) {

      return;

    }

    if (

      mode === "create"

    ) {

      notifyWarning(

        "No disponible",

        "La creación de usuarios será implementada en la siguiente version del sistema."

      );

      return;

    }

    const result = await update(

      selectedUser.id,

      user

    );

    if (!result.success) {

      notifyError(

        "No fue posible guardar el usuario.",

        "Intente nuevamente."

      );

      return;

    }

    notifySuccess(

      "Usuario actualizado",

      "La información se guardó correctamente."

    );

    await load();

    handleCloseModal();

  };

  /*
  ==========================================================
  DELETE
  ==========================================================
  */

  const handleDeleteUser = async () => {

    if (!selectedUser) {

      return;

    }

    const confirmed = await notifyConfirm(

      "Eliminar usuario",

      `¿Desea eliminar a "${selectedUser.displayName}"?`

    );

    if (!confirmed) {

      return;

    }

    const result = await remove(

      selectedUser.id

    );

    if (!result.success) {

      notifyError(

        "No fue posible eliminar el usuario.",

        "Intente nuevamente."

      );

      return;

    }

    notifySuccess(

      "Usuario eliminado",

      "El usuario fue eliminado correctamente."

    );

    await load();

    handleCloseModal();

  };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    /*
    ==========================================
    STATE
    ==========================================
    */

    search,

    setSearch,

    selectedUser,

    modalOpen,

    mode,

    filteredUsers,

    /*
    ==========================================
    ACTIONS
    ==========================================
    */

    handleNewUser,

    handleViewUser,

    handleEditUser,

    handleCloseModal,

    handleSaveUser,

    handleDeleteUser

  };

}