/**
 * ==========================================================
 * FIREBASE FUNCTIONS
 * ==========================================================
 */

import { getFunctions }

    from "firebase/functions";

import { app }

    from "../firebase";

const functions = getFunctions(

    app,

    "us-central1"

);

export default functions;