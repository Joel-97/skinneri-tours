/*
==========================================================
IMPORTS
==========================================================
*/

import {
  getUser
} from "../platform/userService";

import {
  getAdminById
} from "../platform/adminService";

import {
  getCompanyById
} from "../platform/companyService";

import {
  success,
  failure
} from "../../utils/serviceResult";

import PLATFORM_ERRORS from "../../constants/errors/platformErrors";

import {
  ROLES
} from "../../constants/platform/roles";

/*
==========================================================
PRIVATE HELPERS
==========================================================
*/

async function loadUser(auth) {

  /*
  ========================================================
  USERS
  ========================================================
  */

  const userResult = await getUser(

    auth.uid

  );

  if (

    userResult.success

  ) {

    return userResult;

  }

  /*
  ========================================================
  LEGACY ADMINS
  ========================================================
  */

  /*
  ==========================================================
  LEGACY SUPPORT

  Temporary compatibility with the old
  admins collection.

  This block can be removed once every
  administrator has been migrated to
  the users collection.

  ==========================================================
  */

  const adminResult = await getAdminById(

    auth.uid

  );

  if (

    adminResult.success

  ) {

    return success({

      id:

        adminResult.data.id,

      uid:

        adminResult.data.uid,

      displayName:

        adminResult.data.displayName,

      email:

        adminResult.data.email,

      role:

        adminResult.data.role,

      status:

        adminResult.data.status,

      companyId:

        adminResult.data.companyId

    });

  }

  /*
  ========================================================
  USER NOT FOUND
  ========================================================
  */

  return failure(

    PLATFORM_ERRORS.USER_NOT_FOUND

  );

}

async function loadCompany(companyId) {

  if (!companyId) {

    return success(

      null

    );

  }

  return await getCompanyById(

    companyId

  );

}

/*
==========================================================
BUILD SESSION
==========================================================
*/

export async function buildSession(auth) {

  try {

    /*
    ======================================================
    AUTH
    ======================================================
    */

    if (!auth) {

      return success(

        null

      );

    }

    /*
    ======================================================
    USER
    ======================================================
    */

    const userResult = await loadUser(

      auth

    );

    if (

      !userResult.success

    ) {

      return userResult;

    }

    const user =

      userResult.data;

    /*
    ======================================================
    SUPER ADMIN

    Platform users do not belong to a company.

    ======================================================
    */

    if (

      user.role === ROLES.SUPER_ADMIN.id

    ) {

      const session = {

        auth: {

          uid:

            auth.uid,

          email:

            auth.email,

          emailVerified:

            auth.emailVerified

        },

        user,

        company:

          null

      };

      return success(

        session

      );

    }

    /*
    ======================================================
    COMPANY
    ======================================================
    */

    const companyResult = await loadCompany(

      user.companyId

    );

    if (

      !companyResult.success

    ) {

      return companyResult;

    }

    /*
    ======================================================
    SESSION
    ======================================================
    */

    const session = {

      auth: {

        uid:

          auth.uid,

        email:

          auth.email,

        emailVerified:

          auth.emailVerified

      },

      user,

      company:

        companyResult.data

    };

    /*
    ======================================================
    RESULT
    ======================================================
    */

    return success(

      session

    );

  }

  catch (error) {

    console.error(

      error

    );

    return failure(

      PLATFORM_ERRORS.UNKNOWN_ERROR

    );

  }

}