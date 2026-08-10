/*
==========================================================
IMPORTS
==========================================================
*/

import {

  useState,
  useEffect,
  useCallback

} from "react";

import useAsync from "../useAsync";

import {

  submitUser,
  loadUsers,
  loadCompanyUsers,
  loadUser,
  updateUserInformation,
  changeUserRole,
  changeUserStatus,
  registerLastLogin,
  removeUser

} from "../../controllers/platform/userController";

/*
==========================================================
HOOK
==========================================================
*/

export default function useUsers() {

  /*
  ==========================================================
  ASYNC
  ==========================================================
  */

  const {

    loading,

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

    users,

    setUsers

  ] = useState([]);

  /*
  ==========================================================
  LOAD USERS
  ==========================================================
  */

  const load = useCallback(

    async () => {

      const result = await execute(

        () => loadUsers()

      );

      if (

        result.success

      ) {

        setUsers(

          result.data || []

        );

      }

      else {

        setUsers([]);

      }

      return result;

    },

    [

      execute

    ]

  );

  /*
  ==========================================================
  INITIAL LOAD
  ==========================================================
  */

  useEffect(() => {

    load();

  }, [

    load

  ]);

  /*
  ==========================================================
  RELOAD COMPANY USERS
  ==========================================================
  */

  async function loadCompany(

    companyId

  ) {

    const result = await execute(

      () => loadCompanyUsers(

        companyId

      )

    );

    if (

      result.success

    ) {

      setUsers(

        result.data || []

      );

    }

    else {

      setUsers([]);

    }

    return result;

  }

  /*
  ==========================================================
  LOAD ONE
  ==========================================================
  */

  async function loadOne(

    userId

  ) {

    return await execute(

      () => loadUser(

        userId

      )

    );

  }

  /*
  ==========================================================
  CREATE
  ==========================================================
  */

  async function create(

    contract

  ) {

    return await execute(

      () => submitUser(

        contract

      )

    );

  }

  /*
  ==========================================================
  UPDATE
  ==========================================================
  */

  async function update(

    userId,

    data

  ) {

    return await execute(

      () => updateUserInformation(

        userId,

        data

      )

    );

  }

  /*
  ==========================================================
  UPDATE ROLE
  ==========================================================
  */

  async function updateRole(

    userId,

    role

  ) {

    return await execute(

      () => changeUserRole(

        userId,

        role

      )

    );

  }

  /*
  ==========================================================
  UPDATE STATUS
  ==========================================================
  */

  async function updateStatus(

    userId,

    status

  ) {

    return await execute(

      () => changeUserStatus(

        userId,

        status

      )

    );

  }

  /*
  ==========================================================
  REGISTER LOGIN
  ==========================================================
  */

  async function registerLogin(

    userId

  ) {

    return await execute(

      () => registerLastLogin(

        userId

      )

    );

  }

  /*
  ==========================================================
  REMOVE
  ==========================================================
  */

  async function remove(

    userId

  ) {

    const result = await execute(

      () => removeUser(

        userId

      )

    );

    if (

      result.success

    ) {

      await load();

    }

    return result;

  }

  /*
  ==========================================================
  RETURN
  ==========================================================
  */

  return {

    loading,

    error,

    users,

    load,

    loadCompany,

    loadOne,

    create,

    update,

    updateRole,

    updateStatus,

    registerLogin,

    remove,

    clearError

  };

}