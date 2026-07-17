import { useState, useEffect } from "react";

import { emptyClient } from "../constants/clientConstants";

import {
  buildCreateClient,
  buildEditClient
} from "../utils/clientUtils";

import {
  buildClient
} from "../builders/clientBuilder";

import {
  notifyError
} from "../../../services/notificationService";

/*
==========================================================
CLIENT CONTROLLER
==========================================================
*/

export default function useClientController({

  companyId,

  client,

  mode,

  user,

  onSave

}) {

  /*
  ==========================================================
  FORM
  ==========================================================
  */

  const [data, setData] = useState(emptyClient);

  /*
  ==========================================================
  MODALS
  ==========================================================
  */

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /*
  ==========================================================
  LOAD FORM
  ==========================================================
  */

  useEffect(() => {

    if (mode === "create") {

      setData(
        buildCreateClient()
      );

      return;

    }

    if (!client) return;

    setData(
      buildEditClient(client)
    );

  }, [

    client,

    mode

  ]);

  /*
  ==========================================================
  ACTIONS
  ==========================================================
  */

  const handleChange = (event) => {

    const {

      name,

      value

    } = event.target;

    setData(prev => ({

      ...prev,

      [name]: value

    }));

  };

    /*
  ==========================================================
  PRIVATE HELPERS
  ==========================================================
  */

  const validateClient = () => {

    if (!data.name?.trim()) {

      notifyError(
        "Nombre requerido",
        "Debe ingresar el nombre del cliente."
      );

      return false;

    }

    return true;

  };

  const handleSubmit = async () => {

    if (!validateClient()) return;

    try {

      const clientData = buildClient({

        companyId,

        data,

        mode,

        user

      });

      await onSave(clientData);

    }

    catch (error) {

      console.error("Error saving client:", error);

      notifyError(
        "Error",
        "No fue posible guardar el cliente."
      );

    }

  };

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  const controller = {

    form: {

      data,

      setData

    },

    modals: {

      showDeleteModal,

      setShowDeleteModal

    },

    actions: {

      handleChange,

      handleSubmit

    }

  };

  return controller;

}