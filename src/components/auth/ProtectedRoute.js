/*
==========================================================
IMPORTS
==========================================================
*/

import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Loading from "../general/loading";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function ProtectedRoute({

  children

}) {

  const {

    session,

    loading,

    authenticated

  } = useAuth();

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {

    return <Loading />;

  }

  /*
  ==========================================================
  NOT AUTHENTICATED
  ==========================================================
  */

  if (!authenticated) {

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }

  /*
  ==========================================================
  INVALID SESSION
  ==========================================================
  */

  if (!session) {

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }

  /*
  ==========================================================
  INVALID USER
  ==========================================================
  */

  if (!session.user) {

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }

  /*
  ==========================================================
  VALID SESSION
  ==========================================================
  */

  return children;

}