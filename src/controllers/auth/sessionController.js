/*
==========================================================
IMPORTS
==========================================================
*/

import {
  buildSession
} from "../../services/auth/sessionService";

/*
==========================================================
BUILD SESSION
==========================================================
*/

export async function createSession(auth) {

  return await buildSession(

    auth

  );

}