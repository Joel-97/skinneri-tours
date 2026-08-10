/*
==========================================================
IMPORTS
==========================================================
*/

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  logout,
  onAuthState
} from "../controllers/auth/authController";

import {
  createSession
} from "../controllers/auth/sessionController";

/*
==========================================================
CONTEXT
==========================================================
*/

const AuthContext = createContext(null);

/*
==========================================================
HOOK
==========================================================
*/

export function useAuth() {

  return useContext(AuthContext);

}

/*
==========================================================
INITIAL SESSION
==========================================================
*/

const INITIAL_SESSION = null;

/*
==========================================================
PROVIDER
==========================================================
*/

export function AuthProvider({ children }) {

  /*
  ==========================================================
  STATES
  ==========================================================
  */

  const [session, setSession] = useState(

    INITIAL_SESSION

  );

  const [loading, setLoading] = useState(

    true

  );

  /*
  ==========================================================
  DERIVED STATE
  ==========================================================
  */

  const authenticated = !!session;

  /*
  ========================================================
  REFRESH SESSION
  ========================================================
  */

  async function refreshSession(auth) {

    /*
    ========================================================
    INVALID AUTH
    ========================================================
    */

    if (!auth) {

      return;

    }

    /*
    ========================================================
    CREATE SESSION
    ========================================================
    */

    const result = await createSession(

      auth

    );

    /*
    ========================================================
    SESSION ERROR
    ========================================================
    */

    if (!result.success) {

      setSession(

        INITIAL_SESSION

      );

      return;

    }

    /*
    ========================================================
    UPDATE SESSION
    ========================================================
    */

    setSession(

      result.data

    );

  }

  /*
  ==========================================================
  AUTH STATE
  ==========================================================
  */

  useEffect(() => {

    const unsubscribe = onAuthState(

      async (auth) => {

        setLoading(

          true

        );

        try {

          await refreshSession(

            auth

          );

        }

        finally {

          setLoading(

            false

          );

        }

      }

    );

    return unsubscribe;

  }, []);

  /*
  ==========================================================
  LOGOUT
  ==========================================================
  */

  async function signOut() {

    await logout();

    setSession(

      INITIAL_SESSION

    );

  }

  /*
  ==========================================================
  CONTEXT VALUE
  ==========================================================
  */

  const value = useMemo(() => ({

    session,

    loading,

    authenticated,

    logout: signOut,

    refreshSession

  }),

    [

      session,

      loading,

      authenticated

    ]

  );

  /*
  ==========================================================
  PROVIDER
  ==========================================================
  */

  return (

    <AuthContext.Provider

      value={value}

    >

      {children}

    </AuthContext.Provider>

  );

}