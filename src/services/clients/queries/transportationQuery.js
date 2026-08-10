/*
==========================================================
TRANSPORTATION QUERY
==========================================================
*/

import {

  collection,
  getDocs,
  query,
  where,
  orderBy

} from "firebase/firestore";

import { db } from "../../../firebase";

/*
==========================================================
GET CLIENT TRANSPORTATION
==========================================================
*/

export async function getClientTransportation(

  companyId,
  clientId

) {

  if (!companyId || !clientId) {

    return [];

  }

  const transportationRef = collection(

    db,

    "companies",
    companyId,
    "transportation"

  );

  const q = query(

    transportationRef,

    where(

      "clientId",

      "==",

      clientId

    ),

    orderBy(

      "date",

      "desc"

    )

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({

    id: doc.id,

    ...doc.data()

  }));

}