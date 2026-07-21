/*
==========================================================
LOAD COLLECTION
==========================================================
*/

import {

  collection,
  getDocs

} from "firebase/firestore";

import {

  db

} from "../../firebase";

import {

  firestoreCollections

} from "../../constants/firestoreCollections";

/*
==========================================================
LOAD COLLECTION
==========================================================
*/

export async function loadCollection(

  companyId,

  collectionName

) {

  if (

    !companyId ||

    !collectionName

  ) {

    return [];

  }

  const snapshot = await getDocs(

    collection(

      db,

      firestoreCollections.companies,

      companyId,

      collectionName

    )

  );

  return snapshot.docs.map(

    (doc) => ({

      id: doc.id,

      ...doc.data()

    })

  );

}