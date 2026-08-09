/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    success,
    failure

} from "../utils/serviceResult.js";

import {

    getAccessRequestService,
    updateAccessRequestStatusService

} from "./accessRequestService.js";

import {

    createCompanyService,
    deleteCompanyService

} from "./companyService.js";

import {

    createUserService,
    deleteUserService

} from "./userService.js";

import { getCompanyService } from "./companyService.js";
import { deletePlatformUserService } from "./authService.js";
import { sendInvitationEmailService } from "../communication/services/sendInvitationEmailService.js";

import ACCESS_REQUEST_STATUS

    from "../constants/accessRequestStatus.js";

import ACCESS_REQUEST_ERRORS

    from "../constants/errors/accessRequestErrors.js";

import PLATFORM_ERRORS

    from "../constants/errors/platformErrors.js";

/*
==========================================================
ROLLBACK APPROVAL
==========================================================
*/

async function rollbackApproval({

    userId,

    companyId,

    companyCreated

}) {

    /*
    ======================================================
    DELETE USER
    ======================================================
    */

    if (

        userId

    ) {

        await deletePlatformUserService(

            userId,

            deleteUserService

        );

    }

    /*
    ======================================================
    DELETE COMPANY
    ======================================================
    */

    if (

        companyCreated &&

        companyId

    ) {

        await deleteCompanyService(

            companyId

        );

    }

}

/*
==========================================================
APPROVE ACCESS REQUEST
==========================================================
*/

export async function approveAccessRequestService(

    contract,

    approvedBy

) {

    try {

        /*
        ======================================================
        GET ACCESS REQUEST
        ======================================================
        */

        const requestResult =

            await getAccessRequestService(

                contract.requestId

            );

        if (

            !requestResult.success

        ) {

            return requestResult;

        }

        const request =

            requestResult.data;

        /*
        ======================================================
        VALIDATE STATUS
        ======================================================
        */

        if (

            request.status ===

            ACCESS_REQUEST_STATUS.APPROVED

        ) {

            return failure(

                ACCESS_REQUEST_ERRORS
                    .ACCESS_REQUEST_ALREADY_APPROVED

            );

        }

        if (

            request.status ===

            ACCESS_REQUEST_STATUS.REJECTED

        ) {

            return failure(

                ACCESS_REQUEST_ERRORS
                    .ACCESS_REQUEST_ALREADY_REJECTED

            );

        }

        /*
        ======================================================
        COMPANY
        ======================================================
        */

        let companyId =

            contract.companyId;

        let companyCreated =

            false;

        let companyName =

            contract.companyName;

        if (

            contract.createCompany

        ) {

            const companyResult =

                await createCompanyService({

                    name:

                        contract.companyName,

                    enabledModules:

                        contract.enabledModules

                });

            if (

                !companyResult.success

            ) {

                return companyResult;

            }

            companyId =

                companyResult.data;

            companyCreated =

                true;

        }

        else {

            const companyResult =

                await getCompanyService(

                    companyId

                );

            if (

                !companyResult.success

            ) {

                return companyResult;

            }

            companyName =

                companyResult.data.name;

        }

        /*
        ======================================================
        CREATE USER
        ======================================================
        */

        const userResult =

            await createUserService({

                displayName:

                    request.displayName,

                email:

                    request.email,

                companyId,

                role:

                    contract.role

            });

        if (

            !userResult.success

        ) {

            return userResult;

        }

        /*
        ======================================================
        SEND INVITATION EMAIL
        ======================================================
        */

        const emailResult =

            await sendInvitationEmailService({

                userId:

                    userResult.data.id,

                email:

                    request.email,

                companyName

            });

        if (

            !emailResult.success

        ) {

            await rollbackApproval({

                userId:

                    userResult.data.id,

                companyId,

                companyCreated

            });

            return emailResult;

        }

        /*
        ======================================================
        UPDATE ACCESS REQUEST
        ======================================================
        */

        const updateResult =

            await updateAccessRequestStatusService(

                contract.requestId,

                ACCESS_REQUEST_STATUS.APPROVED,

                approvedBy,

                companyId

            );

        if (

            !updateResult.success

        ) {

            await rollbackApproval({

                userId:

                    userResult.data.id,

                companyId,

                companyCreated

            });

            return updateResult;

        }

        /*
        ======================================================
        RESULT
        ======================================================
        */

        return success({

            companyId,

            userId:

                userResult.data.id

        });

    }

    catch (error) {

        console.error(error);

        return failure(

            PLATFORM_ERRORS.UNKNOWN_ERROR

        );

    }

}