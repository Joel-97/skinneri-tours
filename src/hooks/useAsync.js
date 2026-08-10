/*
==========================================================
IMPORTS
==========================================================
*/

import { useState } from "react";

import { failure } from "../utils/serviceResult";

/*
==========================================================
HOOK
==========================================================
*/

export default function useAsync() {

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState(null);

  /*
  ==========================================================
  EXECUTE
  ==========================================================
  */

  async function execute(operation) {

    setLoading(true);

    setSuccess(false);

    setError(null);

    try {

      const result = await operation();

      if (result.success) {

        setSuccess(true);

      }

      else {

        setSuccess(false);

        setError(

          result.error

        );

      }

      return result;

    }

    catch (error) {

      console.error(error);

      setSuccess(false);

      setError(

        error.message

      );

      return failure(

        error.message

      );

    }

    finally {

      setLoading(false);

    }

  }

  /*
  ==========================================================
  CLEAR ERROR
  ==========================================================
  */

  function clearError() {

    setError(null);

    setSuccess(false);

  }

  /*
  ==========================================================
  START LOADING
  ==========================================================
  */

  function startLoading() {

    setLoading(true);

    setSuccess(false);

    setError(null);

  }

  /*
  ==========================================================
  STOP LOADING
  ==========================================================
  */

  function stopLoading() {

    setLoading(false);

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    loading,

    success,

    error,

    execute,

    clearError,

    startLoading,

    stopLoading

  };

}