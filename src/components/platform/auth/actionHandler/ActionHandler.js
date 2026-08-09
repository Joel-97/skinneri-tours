/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    useTranslation

} from "../../../../hooks/useTranslation";

import useActionHandler

    from "../../../../hooks/platform/auth/useActionHandler";

import ResetPasswordForm

    from "./ResetPasswordForm";

import SuccessMessage

    from "../shared/SuccessMessage";

import ErrorMessage

    from "../shared/ErrorMessage";

import "./actionHandler.css";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function ActionHandler() {

    /*
    ==========================================================
    TRANSLATION
    ==========================================================
    */

    const {

        t

    } = useTranslation();

    /*
    ==========================================================
    HOOK
    ==========================================================
    */

    const {

        email,

        form,

        loading,

        success,

        error,

        handleChange,

        submit

    } = useActionHandler();

    /*
    ==========================================================
    LOADING
    ==========================================================
    */

    if (

        loading

    ) {

        return (

            <div className="action-handler-loading">

                {

                    t(

                        "auth.actionHandler.loading"

                    )

                }

            </div>

        );

    }

    /*
    ==========================================================
    ERROR
    ==========================================================
    */

    if (

        error

    ) {

        return (

            <ErrorMessage

                error={

                    error

                }

            />

        );

    }

    /*
    ==========================================================
    SUCCESS
    ==========================================================
    */

    if (

        success

    ) {

        return (

            <SuccessMessage />

        );

    }

    /*
    ==========================================================
    RESULT
    ==========================================================
    */

    return (

        <ResetPasswordForm

            email={

                email

            }

            form={

                form

            }

            loading={

                loading

            }

            error={

                error

            }

            handleChange={

                handleChange

            }

            submit={

                submit

            }

        />

    );

}