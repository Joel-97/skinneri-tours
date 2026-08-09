/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    useTranslation

} from "../../../../hooks/useTranslation";

/*
==========================================================
COMPONENT
==========================================================
*/

export default function SuccessMessage() {

    const {

        t

    } = useTranslation();

    return (

        <section className="action-handler-container">

            <header className="action-handler-header">

                <h2 className="action-handler-title">

                    {

                        t(

                            "auth.actionHandler.successTitle"

                        )

                    }

                </h2>

                <p className="action-handler-subtitle">

                    {

                        t(

                            "auth.actionHandler.successSubtitle"

                        )

                    }

                </p>

            </header>

            <div className="action-handler-success">

                {

                    t(

                        "auth.actionHandler.redirecting"

                    )

                }

            </div>

        </section>

    );

}