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

export default function ResetPasswordForm({

    email,

    form,

    loading,

    error,

    handleChange,

    submit

}) {

    const {

        t

    } = useTranslation();

    /*
    ==========================================================
    ERROR MESSAGE
    ==========================================================
    */

    const errorMessage =

        resolveErrorMessage(

            error,

            t,

            ACTION_HANDLER_ERROR_MESSAGES

        );

    /*
    ==========================================================
    SUBMIT
    ==========================================================
    */

    async function handleSubmit(event) {

        event.preventDefault();

        await submit();

    }

    /*
    ==========================================================
    EMAIL
    ==========================================================
    */

    const accountEmail =

        email ||

        t(

            "auth.messages.loading"

        );

    /*
    ==========================================================
    RENDER
    ==========================================================
    */

    return (

        <section className="action-handler-container">

            {/* ==================================================
                HEADER
            =================================================== */}

            <header className="action-handler-header">

                <h2 className="action-handler-title">

                    {

                        t(

                            "auth.actionHandler.title"

                        )

                    }

                </h2>

                <p className="action-handler-subtitle">

                    {

                        t(

                            "auth.actionHandler.subtitle"

                        )

                    }

                </p>

            </header>

            {/* ==================================================
                ACCOUNT
            =================================================== */}

            <div className="action-handler-account">

                <span className="action-handler-account-label">

                    {

                        t(

                            "auth.register.email"

                        )

                    }

                </span>

                <strong

                    className="action-handler-account-email"

                    title={

                        email

                    }

                >

                    {

                        accountEmail

                    }

                </strong>

            </div>

            {/* ==================================================
                ERROR
            =================================================== */}

            {

                error && (

                    <div

                        className="action-handler-error"

                        role="alert"

                        aria-live="polite"

                    >

                        {

                            errorMessage

                        }

                    </div>

                )

            }

            {/* ==================================================
                FORM
            =================================================== */}

            <form

                className="action-handler-fields"

                onSubmit={

                    handleSubmit

                }

                noValidate

            >

                {/* ==============================================
                    PASSWORD
                =============================================== */}

                <div className="action-handler-group">

                    <label

                        htmlFor="password"

                        className="action-handler-label"

                    >

                        {

                            t(

                                "auth.actionHandler.password"

                            )

                        }

                    </label>

                    <input

                        id="password"

                        name="password"

                        type="password"

                        autoComplete="new-password"

                        required

                        value={

                            form.password

                        }

                        onChange={

                            handleChange

                        }

                        className="action-handler-input"

                    />

                </div>

                {/* ==============================================
                    CONFIRM PASSWORD
                =============================================== */}

                <div className="action-handler-group">

                    <label

                        htmlFor="confirmPassword"

                        className="action-handler-label"

                    >

                        {

                            t(

                                "auth.actionHandler.confirmPassword"

                            )

                        }

                    </label>

                    <input

                        id="confirmPassword"

                        name="confirmPassword"

                        type="password"

                        autoComplete="new-password"

                        required

                        value={

                            form.confirmPassword

                        }

                        onChange={

                            handleChange

                        }

                        className="action-handler-input"

                    />

                </div>

                {/* ==============================================
                    ACTIONS
                =============================================== */}

                <div className="action-handler-actions">

                    <button

                        type="submit"

                        disabled={

                            loading

                        }

                        className="action-handler-submit-button"

                    >

                        {

                            loading

                                ? t(

                                    "auth.messages.loading"

                                )

                                : t(

                                    "auth.actionHandler.createPassword"

                                )

                        }

                    </button>

                </div>

            </form>

        </section>

    );

}