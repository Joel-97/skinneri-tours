/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    useTranslation

} from "../../../../hooks/useTranslation";

import resolveErrorMessage

    from "../../../../utils/resolveErrorMessage";

import ACTION_HANDLER_ERROR_MESSAGES

    from "../../../../constants/errors/actionHandlerErrorMessages";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function ErrorMessage({

    error

}) {

    const {

        t

    } = useTranslation();

    const errorMessage = resolveErrorMessage(

        error,

        t,

        ACTION_HANDLER_ERROR_MESSAGES

    );

    return (

        <section className="action-handler-container">

            <header className="action-handler-header">

                <h2 className="action-handler-title">

                    {

                        t(

                            "auth.messages.unknownError"

                        )

                    }

                </h2>

            </header>

            <div className="action-handler-error">

                {

                    errorMessage

                }

            </div>

        </section>

    );

}