/**
 * ==========================================================
 * IMPORTS
 * ==========================================================
 */

import {

    useEffect,
    useMemo,
    useState

} from "react";

import {

    useNavigate,
    useSearchParams

} from "react-router-dom";

import {

    getAuthActionService,
    completeAuthActionService

} from "../../../services/auth/authActionService";

/*
==========================================================
HOOK
==========================================================
*/

export default function useActionHandler() {

    /*
    ==========================================================
    NAVIGATION
    ==========================================================
    */

    const navigate =

        useNavigate();

    /*
    ==========================================================
    URL PARAMETERS
    ==========================================================
    */

    const [

        searchParams

    ] = useSearchParams();

    /*
    ==========================================================
    AUTH ACTION
    ==========================================================
    */

    const authAction = useMemo(

        () => ({

            token:

                searchParams.get(

                    "token"

                )

        }),

        [

            searchParams

        ]

    );

    /*
    ==========================================================
    USER
    ==========================================================
    */

    const [

        email,

        setEmail

    ] = useState("");

    /*
    ==========================================================
    FORM
    ==========================================================
    */

    const [

        form,

        setForm

    ] = useState({

        password:

            "",

        confirmPassword:

            ""

    });

    /*
    ==========================================================
    UI
    ==========================================================
    */

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        success,

        setSuccess

    ] = useState(false);

    const [

        error,

        setError

    ] = useState(null);

    /*
    ==========================================================
    INITIALIZE
    ==========================================================
    */

    useEffect(() => {

        async function initialize() {

            if (

                !authAction.token

            ) {

                setError(

                    "INVALID_LINK"

                );

                setLoading(false);

                return;

            }

            const result =

                await getAuthActionService({

                    token:

                        authAction.token

                });

                console.log("result", result);

            if (

                !result.success

            ) {

                setError(

                    result.error

                );

                setLoading(false);

                return;

            }

            setEmail(

                result.data.email

            );

            setLoading(false);

        }

        initialize();

    }, [

        authAction.token

    ]);

    /*
    ==========================================================
    CHANGE
    ==========================================================
    */

    function handleChange(event) {

        const {

            name,
            value

        } = event.target;

        setForm(previous => ({

            ...previous,

            [name]:

                value

        }));

    }

    /*
    ==========================================================
    SUBMIT
    ==========================================================
    */

    async function submit() {

        if (

            !form.password.trim()

        ) {

            setError(

                "VALIDATION_ERROR"

            );

            return;

        }

        if (

            form.password !==

            form.confirmPassword

        ) {

            setError(

                "PASSWORDS_DO_NOT_MATCH"

            );

            return;

        }

        setLoading(true);

        setError(null);

        const result =

            await completeAuthActionService({

                token:

                    authAction.token,

                password:

                    form.password

            });

        if (

            !result.success

        ) {

            setLoading(false);

            setError(

                result.error

            );

            return;

        }

        setSuccess(true);

        setLoading(false);

    }

    /*
    ==========================================================
    SUCCESS
    ==========================================================
    */

    useEffect(() => {

        if (

            !success

        ) {

            return;

        }

        const timeout =

            setTimeout(() => {

                navigate(

                    "/login"

                );

            }, 5000);

        return () =>

            clearTimeout(

                timeout

            );

    }, [

        success,

        navigate

    ]);

    /*
    ==========================================================
    RESULT
    ==========================================================
    */

    return {

        authAction,

        email,

        form,

        loading,

        success,

        error,

        handleChange,

        submit

    };

}