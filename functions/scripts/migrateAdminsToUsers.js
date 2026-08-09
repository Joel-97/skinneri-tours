/**
 * ==========================================================
 * MIGRATION
 * Admins -> Users
 * ==========================================================
 */

import admin from "firebase-admin";

import serviceAccount from "../credentials/serviceAccount.json" with { type: "json" };

/*
==========================================================
FIREBASE
==========================================================
*/

admin.initializeApp({

    credential: admin.credential.cert(serviceAccount)

});

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

    console.log("");
    console.log("==================================================");
    console.log("ADMINS → USERS MIGRATION");
    console.log("==================================================");
    console.log("");

    console.log(`Project ID: ${serviceAccount.project_id}`);
    console.log("");

    const collections = await db.listCollections();

    console.log("Colecciones encontradas:");

    collections.forEach((collection) => {

        console.log(`- ${collection.id}`);

    });

    console.log("");

    const adminsSnapshot = await db
        .collection(SOURCE_COLLECTION)
        .get();

    console.log(`Admins encontrados: ${adminsSnapshot.size}`);
    console.log("");

    if (adminsSnapshot.empty) {

        console.log("No hay documentos para migrar.");
        return;

    }

    for (const adminDoc of adminsSnapshot.docs) {

        const userId = adminDoc.id;

        const adminData = adminDoc.data();

        try {

            const userRef = db
                .collection(TARGET_COLLECTION)
                .doc(userId);

            const existingUser = await userRef.get();

            if (existingUser.exists) {

                skipped++;

                console.log(
                    `⚠ Omitido (ya existe): ${adminData.email}`
                );

                continue;

            }

            await userRef.set(adminData);

            migrated++;

            console.log(
                `✔ Migrado: ${adminData.email}`
            );

        }

        catch (error) {

            errors++;

            console.error("");
            console.error(
                `✖ Error migrando ${adminData.email}`
            );

            console.error(error);

        }

    }

    console.log("");
    console.log("==================================================");
    console.log("RESUMEN");
    console.log("==================================================");
    console.log(`Migrados : ${migrated}`);
    console.log(`Omitidos : ${skipped}`);
    console.log(`Errores  : ${errors}`);
    console.log("");

}

/*
==========================================================
RUN
==========================================================
*/

migrateAdminsToUsers()
    .then(() => {

        console.log("✅ Migración finalizada.");
        process.exit(0);

    })
    .catch((error) => {

        console.error("");
        console.error("❌ Error ejecutando la migración.");
        console.error(error);

        process.exit(1);

    });