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

  FIRESTORE_COLLECTIONS

} from "../../constants/shared/firestoreCollections";

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

      FIRESTORE_COLLECTIONS.COMPANIES,

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