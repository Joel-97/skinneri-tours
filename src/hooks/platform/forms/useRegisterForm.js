/*
==========================================================
IMPORTS
==========================================================
*/

import { useState } from "react";

import useAsync from "../../useAsync";

import createAccessRequestContract from "../../../contracts/platform/createAccessRequestContract";

import {

  submitAccessRequest

} from "../../../controllers/platform/accessRequestController";

/*
==========================================================
HOOK
==========================================================
*/

export default function useRegisterForm() {

  const {

    loading,

    success,

    error,

    execute,

    clearError

  } = useAsync();

  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [

    form,

    setForm

  ] = useState({

    ...createAccessRequestContract

  });

  /*
  ==========================================================
  HANDLE CHANGE
  ==========================================================
  */

  function handleChange(event) {

    const {

      name,

      value

    } = event.target;

    clearError();

    setForm(previous => ({

      ...previous,

      [name]: value

    }));

  }

  /*
  ==========================================================
  RESET
  ==========================================================
  */

  function reset() {

    setForm({

      ...createAccessRequestContract

    });

  }

  /*
  ==========================================================
  SUBMIT
  ==========================================================
  */

  async function submit() {

    const result = await execute(

      () => submitAccessRequest(

        form

      )

    );

    if (result.success) {

      reset();

    }

    return result;

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    form,

    loading,

    success,

    error,

    handleChange,

    submit,

    reset,

    clearError

  };

}