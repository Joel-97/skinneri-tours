import React from "react";

import {
  Navigate,
  useLocation
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { isModuleEnabled } from "../../utils/platform/moduleUtils";

export default function ModuleRoute({

  module,

  children

}) {

  const {

    session,

    loading

  } = useAuth();

  const location = useLocation();

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {

    return null;

  }

  /*
  ==========================================================
  NO SESSION
  ==========================================================
  */

  if (!session) {

    return (

      <Navigate

        to="/login"

        replace

        state={{

          from: location

        }}

      />

    );

  }

  /*
  ==========================================================
  COMPANY
  ==========================================================
  */

  const company = session.company;

  /*
  ==========================================================
  MODULE ACCESS
  ==========================================================
  */

  const enabled =

    isModuleEnabled(

      company,

      module

    );

  /*
  ==========================================================
  MODULE DISABLED
  ==========================================================
  */

  if (!enabled) {

    return (

      <Navigate

        to="/home"

        replace

      />

    );

  }

  /*
  ==========================================================
  ACCESS GRANTED
  ==========================================================
  */

  return children;

}