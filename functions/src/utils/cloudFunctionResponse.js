/**
 * ==========================================================
 * CLOUD FUNCTION RESPONSE
 * ==========================================================
 */

import { HttpsError } from "firebase-functions/v2/https";

export function withCloudFunction(handler) {

    return async (request) => {

        try {

            return await handler(request);

        }

        catch (error) {

            console.error(error);

            if (error instanceof HttpsError) {

                throw error;

            }

            throw new HttpsError(

                "internal",

                "Internal server error."

            );

        }

    };

}