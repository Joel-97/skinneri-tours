import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    defaultSignTemplate
} from "../../../../components/signs/signTemplateDefault";

import {
    generateLayerId
} from "../../../../components/signs/utils/generateLayerId";

import SignLayerProperties
    from "../../../../components/signs/SignLayerProperties";

import SignToolbar
    from "../../../../components/signs/SignToolbar";

import SignCanvas
    from "../../../../components/signs/SignCanvas";

import SignLayersPanel
    from "../../../../components/signs/SignLayersPanel";

import TemplatesList
    from "../../../../components/signs/TemplatesList";

import {
    createSignTemplate,
    updateSignTemplate,
    deleteSignTemplate,
    getSignTemplates,
    uploadTemplateImage,
    deleteTemplateImage
} from "../../../../services/sign/signTemplatesService";

import {
    notifySuccess,
    notifyError,
    notifyConfirm
} from "../../../../services/notificationService";

import {
    useAuth
} from "../../../../context/AuthContext";

import "../../../../style/settings/template/signTemplates.css";


const MAX_TEMPLATES = 5;

const DEFAULT_TEMPLATE_NAME =
    "Plantilla sin título";


const createDefaultTextLayer = (
    text
) => ({
    id: generateLayerId(),
    type: "text",

    text,

    x: 200,
    y: 200,

    width: 600,
    height: 120,

    fontSize: 72,
    fontWeight: 700,

    color: "#000000",

    textAlign: "center",
    fontFamily: "Arial"
});


const normalizeLayers = (
    layers = []
) =>
    layers.map((layer) => {

        if (layer.type === "text") {
            return {
                fontSize: 72,
                fontWeight: 700,
                color: "#000000",
                textAlign: "center",
                fontFamily: "Arial",
                width: 600,
                height: 120,
                ...layer
            };
        }

        if (layer.type === "shape") {
            return {
                backgroundColor: "#000000",
                opacity: 0.2,
                borderRadius: 20,
                width: 300,
                height: 200,
                ...layer
            };
        }

        if (layer.type === "image") {
            return {
                width: 300,
                height: 300,
                ...layer
            };
        }

        return layer;
    });


const isStorageObjectNotFound = (
    error
) =>
    error?.code ===
        "storage/object-not-found" ||
    error?.code ===
        "storage/object-not-found";


const SignTemplatesSection = () => {

    const {
        session
    } = useAuth();

    const user =
        session?.user;

    const company =
        session?.company;

    const companyId =
        company?.id;


    /* ========================================================
       STATE
       ======================================================== */

    const [
        template,
        setTemplate
    ] = useState(
        defaultSignTemplate
    );

    const [
        selectedLayerId,
        setSelectedLayerId
    ] = useState(null);

    const [
        rightPanelTab,
        setRightPanelTab
    ] = useState("properties");

    const [
        templates,
        setTemplates
    ] = useState([]);

    const [
        templateName,
        setTemplateName
    ] = useState(
        DEFAULT_TEMPLATE_NAME
    );

    const [
        selectedTemplateId,
        setSelectedTemplateId
    ] = useState(null);

    const [
        copiedLayer,
        setCopiedLayer
    ] = useState(null);

    const [
        history,
        setHistory
    ] = useState([]);

    const [
        future,
        setFuture
    ] = useState([]);


    const hasReachedTemplateLimit =
        templates.length >= MAX_TEMPLATES;


    /* ========================================================
       SIGN DATA
       ======================================================== */

    const signData = {
        clientName:
            "Nombre del cliente",

        reservationDate:
            "Fecha de reserva",

        pickupLocation:
            "Lugar de recogida",

        reservationNumber:
            "Número de reserva",

        dropOff:
            "Lugar de destino",

        companyName:
            company?.companyName ||
            company?.name ||
            ""
    };


    /* ========================================================
       HISTORY
       ======================================================== */

    const saveHistory = useCallback(
        () => {

            setHistory(
                (previous) => [
                    ...previous,
                    structuredClone(template)
                ]
            );

            setFuture([]);

        },
        [template]
    );


    const undo = useCallback(
        () => {

            if (!history.length) {
                return;
            }

            const previousState =
                history[
                    history.length - 1
                ];

            setFuture(
                (previous) => [
                    structuredClone(template),
                    ...previous
                ]
            );

            setHistory(
                (previous) =>
                    previous.slice(0, -1)
            );

            setTemplate(
                previousState
            );

        },
        [
            history,
            template
        ]
    );


    const redo = useCallback(
        () => {

            if (!future.length) {
                return;
            }

            const nextState =
                future[0];

            setHistory(
                (previous) => [
                    ...previous,
                    structuredClone(template)
                ]
            );

            setFuture(
                (previous) =>
                    previous.slice(1)
            );

            setTemplate(
                nextState
            );

        },
        [
            future,
            template
        ]
    );


    /* ========================================================
       LAYER UPDATE
       ======================================================== */

    const updateLayer = useCallback(
        (
            layerId,
            updates
        ) => {

            const layer =
                template.layers.find(
                    (item) =>
                        item.id === layerId
                );

            if (!layer) {
                return;
            }

            saveHistory();

            setTemplate(
                (previous) => ({
                    ...previous,

                    layers:
                        previous.layers.map(
                            (item) =>
                                item.id === layerId
                                    ? {
                                        ...item,
                                        ...updates
                                    }
                                    : item
                        )
                })
            );

        },
        [
            template.layers,
            saveHistory
        ]
    );


    /* ========================================================
       CANVAS ORIENTATION
       ======================================================== */

    const setCanvasOrientation =
        useCallback(
            (orientation) => {

                if (
                    orientation !==
                        "landscape" &&
                    orientation !==
                        "portrait"
                ) {
                    return;
                }

                const canvas =
                    orientation ===
                        "landscape"
                        ? {
                            orientation,
                            width: 1400,
                            height: 900
                        }
                        : {
                            orientation,
                            width: 900,
                            height: 1400
                        };

                saveHistory();

                setTemplate(
                    (previous) => ({
                        ...previous,
                        canvas: {
                            ...previous.canvas,
                            ...canvas
                        }
                    })
                );

            },
            [saveHistory]
        );


    /* ========================================================
       LOAD TEMPLATES
       ======================================================== */

    const loadTemplates =
        useCallback(
            async () => {

                if (!companyId) {
                    setTemplates([]);
                    return;
                }

                try {

                    const data =
                        await getSignTemplates(
                            companyId
                        );

                    const safeTemplates =
                        Array.isArray(data)
                            ? data
                            : [];

                    const sortedTemplates =
                        [...safeTemplates].sort(
                            (a, b) => {

                                const aDate =
                                    a.updatedAt?.seconds ||
                                    0;

                                const bDate =
                                    b.updatedAt?.seconds ||
                                    0;

                                return (
                                    bDate -
                                    aDate
                                );
                            }
                        );

                    setTemplates(
                        sortedTemplates
                    );

                    if (!sortedTemplates.length) {

                        setTemplate(
                            defaultSignTemplate
                        );

                        setTemplateName(
                            DEFAULT_TEMPLATE_NAME
                        );

                        setSelectedTemplateId(
                            null
                        );

                        setSelectedLayerId(
                            null
                        );

                        return;
                    }

                    const firstTemplate =
                        sortedTemplates[0];

                    setTemplate({
                        canvas:
                            firstTemplate.canvas ||
                            defaultSignTemplate.canvas,

                        layers:
                            normalizeLayers(
                                firstTemplate.layers ||
                                []
                            )
                    });

                    setTemplateName(
                        firstTemplate.name ||
                        DEFAULT_TEMPLATE_NAME
                    );

                    setSelectedTemplateId(
                        firstTemplate.id
                    );

                    setSelectedLayerId(
                        null
                    );

                    setHistory([]);
                    setFuture([]);

                } catch (error) {

                    console.error(
                        "Error loading sign templates:",
                        error
                    );

                    notifyError(
                        "No se pudieron cargar las plantillas."
                    );
                }

            },
            [companyId]
        );


    useEffect(
        () => {
            loadTemplates();
        },
        [loadTemplates]
    );


    /* ========================================================
       SAVE TEMPLATE
       ======================================================== */

    const handleSaveTemplate =
        async () => {

            if (!companyId) {
                notifyError(
                    "No se encontró la empresa."
                );
                return;
            }

            try {

                if (selectedTemplateId) {

                    await updateSignTemplate({
                        companyId,
                        templateId:
                            selectedTemplateId,
                        template,
                        templateName
                    });

                    notifySuccess(
                        "Plantilla actualizada"
                    );

                } else {

                    if (
                        templates.length >=
                        MAX_TEMPLATES
                    ) {
                        notifyError(
                            "Has alcanzado el límite de 5 plantillas."
                        );
                        return;
                    }

                    const newTemplateId =
                        await createSignTemplate({
                            companyId,
                            user,
                            template,
                            templateName
                        });

                    setSelectedTemplateId(
                        newTemplateId
                    );

                    notifySuccess(
                        "Plantilla guardada"
                    );
                }

                await loadTemplates();

            } catch (error) {

                console.error(
                    "Error saving sign template:",
                    error
                );

                notifyError(
                    "Error guardando plantilla."
                );
            }
        };


    /* ========================================================
       DELETE TEMPLATE
       ======================================================== */

    const handleDeleteTemplate =
        async () => {

            if (
                !companyId ||
                !selectedTemplateId
            ) {
                return;
            }

            const confirmed =
                await notifyConfirm(
                    "Eliminar plantilla",
                    "Esta acción eliminará la plantilla permanentemente."
                );

            if (!confirmed) {
                return;
            }

            try {

                const imageLayers =
                    template.layers.filter(
                        (layer) =>
                            layer.type === "image" &&
                            layer.storagePath
                    );

                for (
                    const imageLayer
                    of imageLayers
                ) {

                    try {

                        await deleteTemplateImage(
                            imageLayer.storagePath
                        );

                    } catch (error) {

                        /*
                         * Si el archivo ya no existe,
                         * podemos continuar con el borrado
                         * de la plantilla.
                         */

                        if (
                            !isStorageObjectNotFound(
                                error
                            )
                        ) {

                            console.warn(
                                "No se pudo eliminar la imagen:",
                                error
                            );
                        }
                    }
                }

                await deleteSignTemplate(
                    companyId,
                    selectedTemplateId
                );

                notifySuccess(
                    "Plantilla eliminada"
                );

                setSelectedTemplateId(
                    null
                );

                setSelectedLayerId(
                    null
                );

                setTemplate(
                    defaultSignTemplate
                );

                setTemplateName(
                    DEFAULT_TEMPLATE_NAME
                );

                setHistory([]);
                setFuture([]);

                await loadTemplates();

            } catch (error) {

                console.error(
                    "Error deleting sign template:",
                    error
                );

                notifyError(
                    "Error eliminando plantilla."
                );
            }
        };


    /* ========================================================
       CREATE NEW TEMPLATE
       ======================================================== */

    const handleCreateNewTemplate =
        () => {

            if (hasReachedTemplateLimit) {
                return;
            }

            saveHistory();

            setTemplate(
                structuredClone(
                    defaultSignTemplate
                )
            );

            setSelectedTemplateId(
                null
            );

            setSelectedLayerId(
                null
            );

            setTemplateName(
                DEFAULT_TEMPLATE_NAME
            );

            setRightPanelTab(
                "properties"
            );
        };


    /* ========================================================
       OPEN TEMPLATE
       ======================================================== */

    const openTemplate =
        (selectedTemplate) => {

            if (!selectedTemplate) {
                return;
            }

            setTemplate({
                canvas:
                    selectedTemplate.canvas ||
                    defaultSignTemplate.canvas,

                layers:
                    normalizeLayers(
                        selectedTemplate.layers ||
                        []
                    )
            });

            setTemplateName(
                selectedTemplate.name ||
                DEFAULT_TEMPLATE_NAME
            );

            setSelectedTemplateId(
                selectedTemplate.id
            );

            setSelectedLayerId(
                null
            );

            setHistory([]);
            setFuture([]);

        };


    /* ========================================================
       CREATE LAYER
       ======================================================== */

    const addLayer = (
        layer
    ) => {

        saveHistory();

        setTemplate(
            (previous) => ({
                ...previous,

                layers: [
                    ...previous.layers,
                    layer
                ]
            })
        );

        setSelectedLayerId(
            layer.id
        );

        setRightPanelTab(
            "properties"
        );
    };


    const createTextLayer = (
        text
    ) => {

        addLayer(
            createDefaultTextLayer(
                text
            )
        );
    };


    const addDynamicFieldLayer = (
        field
    ) => {

        createTextLayer(
            field
        );
    };


    const addStaticTextLayer = () => {

        createTextLayer(
            "Nuevo texto"
        );
    };


    const addShapeLayer = () => {

        addLayer({
            id: generateLayerId(),

            type: "shape",

            x: 200,
            y: 200,

            width: 300,
            height: 200,

            backgroundColor:
                "#000000",

            opacity: 0.2,

            borderRadius: 20
        });
    };


    /* ========================================================
       IMAGE
       ======================================================== */

    const addImageLayer =
        async (event) => {

            const file =
                event.target.files?.[0];

            event.target.value = "";

            if (!file || !companyId) {
                return;
            }

            try {

                const result =
                    await uploadTemplateImage({
                        companyId,
                        file
                    });

                const newLayer = {
                    id: generateLayerId(),

                    type: "image",

                    src: result.url,

                    storagePath:
                        result.path,

                    x: 200,
                    y: 200,

                    width: 300,
                    height: 300
                };

                addLayer(
                    newLayer
                );

            } catch (error) {

                console.error(
                    "Error uploading template image:",
                    error
                );

                notifyError(
                    "Error cargando imagen."
                );
            }
        };


    /* ========================================================
       DELETE LAYER
       ======================================================== */

    const deleteLayer =
        async (layerId) => {

            const layer =
                template.layers.find(
                    (item) =>
                        item.id === layerId
                );

            if (!layer) {
                return;
            }

            if (
                layer.type === "image" &&
                layer.storagePath
            ) {

                try {

                    await deleteTemplateImage(
                        layer.storagePath
                    );

                } catch (error) {

                    if (
                        !isStorageObjectNotFound(
                            error
                        )
                    ) {

                        console.warn(
                            "No se pudo eliminar la imagen:",
                            error
                        );
                    }
                }
            }

            saveHistory();

            setTemplate(
                (previous) => ({
                    ...previous,

                    layers:
                        previous.layers.filter(
                            (item) =>
                                item.id !== layerId
                        )
                })
            );

            if (
                selectedLayerId ===
                layerId
            ) {
                setSelectedLayerId(
                    null
                );
            }
        };


    /* ========================================================
       DUPLICATE
       ======================================================== */

    const duplicateLayer =
        (layer) => {

            if (!layer) {
                return;
            }

            const duplicatedLayer = {
                ...layer,

                id: generateLayerId(),

                x:
                    (layer.x || 0) +
                    40,

                y:
                    (layer.y || 0) +
                    40
            };

            addLayer(
                duplicatedLayer
            );
        };


    /* ========================================================
       MOVE LAYER ORDER
       ======================================================== */

    const moveLayerUp =
        (index) => {

            if (
                index < 0 ||
                index >=
                    template.layers.length - 1
            ) {
                return;
            }

            saveHistory();

            setTemplate(
                (previous) => {

                    const layers = [
                        ...previous.layers
                    ];

                    [
                        layers[index],
                        layers[index + 1]
                    ] = [
                        layers[index + 1],
                        layers[index]
                    ];

                    return {
                        ...previous,
                        layers
                    };
                }
            );
        };


    const moveLayerDown =
        (index) => {

            if (
                index <= 0 ||
                index >=
                    template.layers.length
            ) {
                return;
            }

            saveHistory();

            setTemplate(
                (previous) => {

                    const layers = [
                        ...previous.layers
                    ];

                    [
                        layers[index],
                        layers[index - 1]
                    ] = [
                        layers[index - 1],
                        layers[index]
                    ];

                    return {
                        ...previous,
                        layers
                    };
                }
            );
        };


    /* ========================================================
       MOVE SELECTED LAYER
       ======================================================== */

    const moveSelectedLayer =
        (
            deltaX,
            deltaY
        ) => {

            if (!selectedLayerId) {
                return;
            }

            const layer =
                template.layers.find(
                    (item) =>
                        item.id ===
                        selectedLayerId
                );

            if (!layer) {
                return;
            }

            updateLayer(
                selectedLayerId,
                {
                    x:
                        (layer.x || 0) +
                        deltaX,

                    y:
                        (layer.y || 0) +
                        deltaY
                }
            );
        };


    /* ========================================================
       COPY / PASTE
       ======================================================== */

    const pasteLayer = () => {

        if (!copiedLayer) {
            return;
        }

        duplicateLayer(
            copiedLayer
        );
    };


    /* ========================================================
       KEYBOARD SHORTCUTS
       ======================================================== */

    const handleKeyDown =
        useCallback(
            (event) => {

                const activeElement =
                    document.activeElement;

                const isTyping =
                    activeElement?.tagName ===
                        "INPUT" ||
                    activeElement?.tagName ===
                        "TEXTAREA" ||
                    activeElement?.isContentEditable;

                if (isTyping) {
                    return;
                }

                const selectedLayer =
                    template.layers.find(
                        (layer) =>
                            layer.id ===
                            selectedLayerId
                    );


                /* Delete */

                if (
                    event.key ===
                        "Delete" ||
                    event.key ===
                        "Backspace"
                ) {

                    if (!selectedLayerId) {
                        return;
                    }

                    event.preventDefault();

                    deleteLayer(
                        selectedLayerId
                    );

                    return;
                }


                /* Escape */

                if (
                    event.key ===
                    "Escape"
                ) {

                    setSelectedLayerId(
                        null
                    );

                    return;
                }


                /* Ctrl + D */

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "d"
                ) {

                    event.preventDefault();

                    if (selectedLayer) {
                        duplicateLayer(
                            selectedLayer
                        );
                    }

                    return;
                }


                /* Ctrl + S */

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "s"
                ) {

                    event.preventDefault();

                    handleSaveTemplate();

                    return;
                }


                /* Ctrl + Z */

                if (
                    event.ctrlKey &&
                    !event.shiftKey &&
                    event.key.toLowerCase() ===
                        "z"
                ) {

                    event.preventDefault();

                    undo();

                    return;
                }


                /* Ctrl + Shift + Z / Ctrl + Y */

                if (
                    (
                        event.ctrlKey &&
                        event.shiftKey &&
                        event.key.toLowerCase() ===
                            "z"
                    ) ||
                    (
                        event.ctrlKey &&
                        event.key.toLowerCase() ===
                            "y"
                    )
                ) {

                    event.preventDefault();

                    redo();

                    return;
                }


                /* Ctrl + C */

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "c"
                ) {

                    if (!selectedLayer) {
                        return;
                    }

                    event.preventDefault();

                    setCopiedLayer(
                        structuredClone(
                            selectedLayer
                        )
                    );

                    return;
                }


                /* Ctrl + V */

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "v"
                ) {

                    event.preventDefault();

                    pasteLayer();

                    return;
                }


                /* Arrow movement */

                const moveAmount =
                    event.shiftKey
                        ? 10
                        : 1;

                switch (event.key) {

                    case "ArrowUp":

                        event.preventDefault();

                        moveSelectedLayer(
                            0,
                            -moveAmount
                        );

                        break;


                    case "ArrowDown":

                        event.preventDefault();

                        moveSelectedLayer(
                            0,
                            moveAmount
                        );

                        break;


                    case "ArrowLeft":

                        event.preventDefault();

                        moveSelectedLayer(
                            -moveAmount,
                            0
                        );

                        break;


                    case "ArrowRight":

                        event.preventDefault();

                        moveSelectedLayer(
                            moveAmount,
                            0
                        );

                        break;


                    default:
                        break;
                }

            },
            [
                template.layers,
                selectedLayerId,
                deleteLayer,
                duplicateLayer,
                handleSaveTemplate,
                undo,
                redo,
                pasteLayer,
                moveSelectedLayer
            ]
        );


    useEffect(
        () => {

            window.addEventListener(
                "keydown",
                handleKeyDown
            );

            return () =>
                window.removeEventListener(
                    "keydown",
                    handleKeyDown
                );

        },
        [handleKeyDown]
    );


    /* ========================================================
       RENDER
       ======================================================== */

    const selectedLayer =
        template.layers.find(
            (layer) =>
                layer.id ===
                selectedLayerId
        );


    return (
        <div className="sign-template-editor">

            {/* ==================================================
                MAIN
                ================================================== */}

            <div className="sign-template-main">

                <div className="sign-template-header">

                    <input
                        id="sign-image-upload"
                        type="file"
                        accept="image/*"
                        style={{
                            display: "none"
                        }}
                        onChange={
                            addImageLayer
                        }
                    />


                    {/* HEADER */}

                    <div className="sign-template-header-left">

                        <div className="sign-template-title-group">

                            <h3>
                                Plantillas de la empresa
                            </h3>

                            <p className="sign-template-subtitle">
                                Diseña plantillas dinámicas con campos personalizables.
                            </p>

                        </div>


                        {/* TEMPLATES */}

                        <div className="sign-template-templates-wrapper">

                            <div className="sign-template-templates-column">

                                <TemplatesList
                                    templates={
                                        templates
                                    }
                                    onSelectTemplate={
                                        openTemplate
                                    }
                                />

                            </div>


                            <div className="sign-template-controls-column">

                                <div className="sign-template-input-wrapper">

                                    <input
                                        value={
                                            templateName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setTemplateName(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Nombre de la plantilla"
                                        className="sign-template-name-input"
                                    />

                                </div>


                                {hasReachedTemplateLimit && (

                                    <div className="sign-template-limit-message">

                                        <strong>
                                            Límite alcanzado:
                                        </strong>{" "}

                                        Ya tienes 5 plantillas creadas. Puedes editar o eliminar plantillas existentes para crear nuevas.

                                    </div>

                                )}


                                <div className="sign-template-buttons-row">

                                    <button
                                        type="button"
                                        onClick={
                                            handleCreateNewTemplate
                                        }
                                        disabled={
                                            hasReachedTemplateLimit
                                        }
                                        className={`sign-template-new-btn ${
                                            hasReachedTemplateLimit
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        Nuevo
                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleSaveTemplate
                                        }
                                        className="sign-template-save-btn"
                                    >
                                        Guardar
                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleDeleteTemplate
                                        }
                                        disabled={
                                            !selectedTemplateId
                                        }
                                        className={`sign-template-delete-btn ${
                                            !selectedTemplateId
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        Eliminar
                                    </button>

                                </div>


                                {/* ORIENTATION */}

                                <div className="sign-orientation-toggle">

                                    <button
                                        type="button"
                                        className={
                                            template.canvas
                                                .orientation ===
                                            "landscape"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCanvasOrientation(
                                                "landscape"
                                            )
                                        }
                                    >
                                        Horizontal
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            template.canvas
                                                .orientation ===
                                            "portrait"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCanvasOrientation(
                                                "portrait"
                                            )
                                        }
                                    >
                                        Vertical
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* TOOLBAR */}

                    <div className="sign-template-top-actions">

                        <div className="sign-template-toolbar-wrapper">

                            <SignToolbar
                                onAddDynamicField={
                                    addDynamicFieldLayer
                                }
                                onAddStaticText={
                                    addStaticTextLayer
                                }
                                onAddShape={
                                    addShapeLayer
                                }
                                onAddImage={() =>
                                    document
                                        .getElementById(
                                            "sign-image-upload"
                                        )
                                        ?.click()
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* CANVAS */}

                <div className="sign-template-canvas-wrapper">

                    <div
                        className="sign-template-canvas-scale"
                        style={{
                            width:
                                template.canvas.width,
                            height:
                                template.canvas.height
                        }}
                    >

                        <SignCanvas
                            template={
                                template
                            }
                            setTemplate={
                                setTemplate
                            }
                            saveHistory={
                                saveHistory
                            }
                            signData={
                                signData
                            }
                            selectedLayerId={
                                selectedLayerId
                            }
                            setSelectedLayerId={(
                                id
                            ) => {

                                setSelectedLayerId(
                                    id
                                );

                                setRightPanelTab(
                                    "properties"
                                );
                            }}
                        />

                    </div>

                </div>

            </div>


            {/* ==================================================
                SIDEBAR
                ================================================== */}

            <div className="sign-template-sidebar">

                <div className="sign-template-tabs">

                    <button
                        type="button"
                        onClick={() =>
                            setRightPanelTab(
                                "properties"
                            )
                        }
                        className={
                            rightPanelTab ===
                            "properties"
                                ? "active"
                                : ""
                        }
                    >
                        Propiedades
                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            setRightPanelTab(
                                "layers"
                            )
                        }
                        className={
                            rightPanelTab ===
                            "layers"
                                ? "active"
                                : ""
                        }
                    >
                        Capas
                    </button>

                </div>


                <div className="sign-template-sidebar-content">

                    {rightPanelTab ===
                        "properties" && (

                        <SignLayerProperties
                            selectedLayer={
                                selectedLayer
                            }
                            updateLayer={
                                updateLayer
                            }
                        />

                    )}


                    {rightPanelTab ===
                        "layers" && (

                        <SignLayersPanel
                            layers={
                                template.layers
                            }
                            selectedLayerId={
                                selectedLayerId
                            }
                            setSelectedLayerId={(
                                id
                            ) => {

                                setSelectedLayerId(
                                    id
                                );

                                setRightPanelTab(
                                    "properties"
                                );
                            }}
                            onDeleteLayer={
                                deleteLayer
                            }
                            onDuplicateLayer={
                                duplicateLayer
                            }
                            onMoveLayerUp={
                                moveLayerUp
                            }
                            onMoveLayerDown={
                                moveLayerDown
                            }
                        />

                    )}

                </div>

            </div>

        </div>
    );
};


export default SignTemplatesSection;