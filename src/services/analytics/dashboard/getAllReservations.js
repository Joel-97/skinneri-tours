import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  db
} from "../../../firebase";

// ======================================================
// GET ALL RESERVATIONS
// ======================================================

export const getAllReservations =
  async (companyId) => {

    // ==================================================
    // ADVENTURES
    // ==================================================

    const adventuresRef =
      collection(
        db,
        "companies",
        companyId,
        "adventure"
      );

    const adventuresSnap =
      await getDocs(
        adventuresRef
      );

    const adventures =
      adventuresSnap.docs.map(
        (doc) => ({

          id: doc.id,

          module:
            "adventure",

          ...doc.data()

        })
      );

    // ==================================================
    // TRANSPORTATION
    // ==================================================

    const transportationRef =
      collection(
        db,
        "companies",
        companyId,
        "transportation"
      );

    const transportationSnap =
      await getDocs(
        transportationRef
      );

    const transportation =
      transportationSnap.docs.map(
        (doc) => ({

          id: doc.id,

          module:
            "transportation",

          ...doc.data()

        })
      );

    // ==================================================
    // CONSOLIDATED
    // ==================================================

    return [

      ...adventures,

      ...transportation

    ];

  };