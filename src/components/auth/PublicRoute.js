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

export default function PublicRoute({

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
  AUTHENTICATED
  ==========================================================
  */

  if (

    authenticated &&

    session

  ) {

    return (

      <Navigate

        to="/home"

        replace

      />

    );

  }

  /*
  ==========================================================
  PUBLIC
  ==========================================================
  */

  return children;

}