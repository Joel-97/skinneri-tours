/*
==========================================================
IMPORTS
==========================================================
*/

import { useState } from "react";

import useAsync from "../../useAsync";

import { login } from "../../../controllers/auth/authController";

/*
==========================================================
INITIAL STATE
==========================================================
*/

const INITIAL_FORM = {

  email: "",

  password: ""

};

/*
==========================================================
HOOK
==========================================================
*/

export default function useLoginForm() {

  const [form, setForm] = useState(INITIAL_FORM);

  const {

    loading,

    error,

    execute,

    clearError

  } = useAsync();

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

    setForm(previous => ({

      ...previous,

      [name]: value

    }));

    clearError();

  }

  /*
  ==========================================================
  RESET
  ==========================================================
  */

  function reset() {

    setForm(INITIAL_FORM);

    clearError();

  }

  /*
  ==========================================================
  SUBMIT
  ==========================================================
  */

  async function submit() {

    return await execute(() =>

      login(

        form.email.trim(),

        form.password

      )

    );

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    form,

    loading,

    error,

    handleChange,

    submit,

    reset

  };

}