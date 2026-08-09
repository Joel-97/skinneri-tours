/**
 * ==========================================================
 * MIGRATION
 * Admins -> Users
 * ==========================================================
 */

import admin from "firebase-admin";

/*
==========================================================
FIREBASE
==========================================================
*/

admin.initializeApp({

  credential:

    admin.credential.applicationDefault()

});

/*
==========================================================
DATABASE
==========================================================
*/

const db = admin.firestore();

/*
==========================================================
COLLECTIONS
==========================================================
*/

const SOURCE_COLLECTION = "admins";

const TARGET_COLLECTION = "users";

/*
==========================================================
COUNTERS
==========================================================
*/

let migrated = 0;

let skipped = 0;

let errors = 0;

/*
==========================================================
MIGRATION
==========================================================
*/

async function migrateAdminsToUsers() {

  /*
  ========================================================
  LIST COLLECTIONS
  ========================================================
  */

  const collections = await db.listCollections();

  collections.forEach((collection) => {

    console.log(

      `- ${collection.id}`

    );

  });

  /*
  ========================================================
  GET ADMINS
  ========================================================
  */

  const adminsSnapshot = await db

    .collection(

      SOURCE_COLLECTION

    )

    .get();

  /*
  ========================================================
  EMPTY COLLECTION
  ========================================================
  */

  if (adminsSnapshot.empty) {

    console.log(

      "No hay documentos para migrar."

    );

    return;

  }

  /*
  ========================================================
  MIGRATE
  ========================================================
  */

  for (const adminDoc of adminsSnapshot.docs) {

    const userId = adminDoc.id;

    const adminData = adminDoc.data();

    try {

      /*
      ====================================================
      USER REFERENCE
      ====================================================
      */

      const userRef = db

        .collection(

          TARGET_COLLECTION

        )

        .doc(

          userId

        );

      /*
      ====================================================
      CHECK EXISTING USER
      ====================================================
      */

      const existingUser =

        await userRef.get();

      if (

        existingUser.exists

      ) {

        skipped++;

        console.log(

          `⚠ Omitido (ya existe): ${adminData.email}`

        );

        continue;

      }

      /*
      ====================================================
      CREATE USER
      ====================================================
      */

      await userRef.set(

        adminData

      );

      migrated++;

      console.log(

        `✔ Migrado: ${adminData.email}`

      );

    }

    catch (error) {

      errors++;

      console.error(

        `✖ Error migrando: ${adminData.email}`

      );

      console.error(

        error

      );

    }

  }

  /*
  ========================================================
  SUMMARY
  ========================================================
  */

  console.log("");

  console.log(

    "=================================================="

  );

  console.log(

    "MIGRACIÓN FINALIZADA"

  );

  console.log(

    "=================================================="

  );

  console.log(

    `Migrados: ${migrated}`

  );

  console.log(

    `Omitidos: ${skipped}`

  );

  console.log(

    `Errores: ${errors}`

  );

  console.log(

    "=================================================="

  );

}

/*
==========================================================
RUN
==========================================================
*/

migrateAdminsToUsers()

  .then(() => {

    process.exit(0);

  })

  .catch((error) => {

    console.error(

      error

    );

    process.exit(1);

  });