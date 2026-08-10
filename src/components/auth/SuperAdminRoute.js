/*
==========================================================
IMPORTS
==========================================================
*/

import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  isSuperAdmin
} from "../../utils/authorization";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function SuperAdminRoute({

  children

}) {

  const {

    session

  } = useAuth();

  /*
  ==========================================================
  USER
  ==========================================================
  */

  const user = session?.user;

  /*
  ==========================================================
  AUTHORIZATION
  ==========================================================
  */

  if (

    isSuperAdmin(user)

  ) {

    return children;

  }

  /*
  ==========================================================
  ACCESS DENIED
  ==========================================================
  */

  return (

    <Navigate

      to="/"

      replace

    />

  );

}