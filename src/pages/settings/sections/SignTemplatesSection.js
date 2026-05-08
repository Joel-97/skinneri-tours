import React, { useState, useEffect } from "react";
import { defaultSignTemplate } from "../../../components/signs/signTemplateDefault";
import { generateLayerId } from "../../../components/signs/utils/generateLayerId";
import SignLayerProperties from "../../../components/signs/SignLayerProperties";
import SignToolbar from "../../../components/signs/SignToolbar";
import SignCanvas from "../../../components/signs/SignCanvas";
import SignLayersPanel from "../../../components/signs/SignLayersPanel";
import TemplatesList from "../../../components/signs/TemplatesList";
import {
  createSignTemplate,
  updateSignTemplate,
  deleteSignTemplate,
  getSignTemplates,
  uploadTemplateImage,
  deleteTemplateImage,
} from "../../../services/sign/signTemplatesService";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../services/notificationService";

import "../../../style/settings/template/signTemplates.css";

const SignTemplatesSection = ({ companyId, user }) => {

  const [template, setTemplate] = useState(defaultSignTemplate);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [rightPanelTab, setRightPanelTab] = useState("properties");
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("Plantilla sin título");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [copiedLayer, setCopiedLayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [future,  setFuture] = useState([]);
  const hasReachedTemplateLimit = templates.length >= 5;
  /*
  |--------------------------------------------------------------------------
  | EXAMPLE DATA
  |--------------------------------------------------------------------------
  */

    const reservation = {

    clientName:
        "Nombre del cliente",

    clientEmail:
        "Correo electrónico",

    phone:
        "Número de teléfono",

    reservationNumber:
        "Número de reserva",

    reservationDate:
        "Fecha de reserva",

    passengers:
        "# de pasajeros",

    serviceTypeName:
        "Tipo de servicio",

    serviceCategory:
        "Categoría del servicio",

    locationFromName:
        "Lugar de recogida",

    locationToName:
        "Lugar de destino",

    durationLabel:
        "Duración",

    subtotal:
        "Subtotal",

    taxAmount:
        "Impuestos",

    total:
        "Total",

    currency:
        "Moneda",

    symbol:
        "$",

    status:
        "Estado de la reserva",

    notes:
        "Notas adicionales",

    staffName:
        "Nombre del staff",

    title:
        "Título de la reserva",
    };

    const company = {

    companyName:
        "Nombre de la empresa",
    };

  /*
  |--------------------------------------------------------------------------
  | SIGN DATA
  |--------------------------------------------------------------------------
  */

  const signData = {
    clientName: reservation.clientName,

    reservationDate: reservation.reservationDate,

    pickupLocation: reservation.pickupLocation,

    reservationNumber: reservation.reservationNumber,

    dropOff: reservation.dropOff,

    companyName: company.companyName,
  };

  /*
  |--------------------------------------------------------------------------
  | GUARDA EL HISTORIAL DEL LAYER
  |--------------------------------------------------------------------------
  */
  const saveHistory = () => {

    setHistory((prev) => [
        ...prev,
        structuredClone(template),
    ]);

    /*
    -----------------------------------
    CLEAR FUTURE
    -----------------------------------
    */

    setFuture([]);
  };

    const undo = () => {

        if (history.length === 0) {
            return;
        }

        /*
        -----------------------------------
        LAST HISTORY
        -----------------------------------
        */

        const previousState = history[history.length - 1];

        /*
        -----------------------------------
        SAVE CURRENT TO FUTURE
        -----------------------------------
        */

        setFuture((prev) => [
            structuredClone(template),
            ...prev,
        ]);

        /*
        -----------------------------------
        REMOVE LAST HISTORY
        -----------------------------------
        */

        setHistory((prev) =>  prev.slice(0, -1));

        /*
        -----------------------------------
        RESTORE
        -----------------------------------
        */

        setTemplate(previousState);
    };

    const redo = () => {

        if (future.length === 0) {
            return;
        }

        /*
        -----------------------------------
        NEXT STATE
        -----------------------------------
        */
        const nextState = future[0];
        /*
        -----------------------------------
        SAVE CURRENT
        -----------------------------------
        */

        setHistory((prev) => [
            ...prev,
            structuredClone(template),
        ]);

        /*
        -----------------------------------
        REMOVE FUTURE
        -----------------------------------
        */

        setFuture((prev) => prev.slice(1));

        /*
        -----------------------------------
        RESTORE
        -----------------------------------
        */

        setTemplate(nextState);
    };
  /*
  |--------------------------------------------------------------------------
  | UPDATE LAYER
  |--------------------------------------------------------------------------
  */

  const updateLayer = (layerId, updates) => {
    saveHistory();
    const updatedLayers = template.layers.map((layer) => {

      if (layer.id === layerId) {
        return {
          ...layer,
          ...updates,
        };
      }

      return layer;
    });

    setTemplate({
      ...template,
      layers: updatedLayers,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR HORIENTACION DEL ARCHIVO
  |--------------------------------------------------------------------------
  */

  const setCanvasOrientation = (
    orientation
    ) => {

    if (orientation === "landscape") {

        setTemplate({
        ...template,

        canvas: {
            ...template.canvas,

            orientation: "landscape",

            width: 1400,

            height: 900,
        },
        });

        return;
    }

    setTemplate({
        ...template,

        canvas: {
        ...template.canvas,

        orientation: "portrait",

        width: 900,

        height: 1400,
        },
    });
  };

    /*
    |--------------------------------------------------------------------------
    | LOAD TEMPLATES
    |--------------------------------------------------------------------------
    */

    const loadTemplates = async () => {

        try {

            /*
            -----------------------------------
            GET TEMPLATES
            -----------------------------------
            */

            const data = await getSignTemplates(companyId);

            /*
            -----------------------------------
            SORT BY UPDATED DATE
            -----------------------------------
            */

            const sortedTemplates =
                [...data].sort((a, b) => {

                const aDate = a.updatedAt?.seconds || 0;
                const bDate = b.updatedAt?.seconds || 0;

                return bDate - aDate;
            });

            /*
            -----------------------------------
            SET LIST
            -----------------------------------
            */

            setTemplates(sortedTemplates);

            /*
            -----------------------------------
            AUTO OPEN TEMPLATE
            -----------------------------------
            */

            if (sortedTemplates.length > 0) {

            const firstTemplate = sortedTemplates[0];

            setTemplate({

                canvas:
                firstTemplate.canvas ||
                defaultSignTemplate.canvas,

                layers:
                firstTemplate.layers || [],
            });

            setTemplateName(

                firstTemplate.name ||
                "Plantilla sin título"
            );

            setSelectedTemplateId(
                firstTemplate.id
            );

            /*
            -----------------------------------
            RESET SELECTED LAYER
            -----------------------------------
            */

            setSelectedLayerId(
                null
            );

            } else {

            /*
            -----------------------------------
            EMPTY STATE
            -----------------------------------
            */

            setTemplate(
                defaultSignTemplate
            );

            setTemplateName(
                "Plantilla sin título"
            );

            setSelectedTemplateId(
                null
            );

            setSelectedLayerId(
                null
            );
            }

        } catch (error) {

            console.error(error);
        }
    };

    useEffect(() => {

    if (!companyId) return;

        loadTemplates();

    }, [companyId]);

    /*
    |--------------------------------------------------------------------------
    | USE EFFECT PARA VER CUANDO SE TOCA EL TECLADO
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

        }, [
        selectedLayerId,
        template,
    ]);

    /*
    |--------------------------------------------------------------------------
    | SAVE TEMPLATE
    |--------------------------------------------------------------------------
    */

    const handleSaveTemplate =
        async () => {

        try {

        /*
        -----------------------------------
        UPDATE
        -----------------------------------
        */

        if (selectedTemplateId) {

            await updateSignTemplate({
            companyId,

            templateId:
                selectedTemplateId,

            template,

            templateName,
            });
            notifySuccess("Plantilla actualizada");

        } else {

            /*
            -----------------------------------
            CREATE
            -----------------------------------
            */

            const newTemplateId =
            await createSignTemplate({
                companyId,

                user,

                template,

                templateName,
            });

            setSelectedTemplateId(
            newTemplateId
            );
            notifySuccess("Plantilla guardada");
        }

        await loadTemplates();

        } catch (error) {

        console.error(error);

        notifyError("Error guardando plantilla");
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE TEMPLATE
    |--------------------------------------------------------------------------
    */

    const handleDeleteTemplate =
    async () => {

    /*
    -----------------------------------
    VALIDATE TEMPLATE
    -----------------------------------
    */

    if (!selectedTemplateId) {
        return;
    }

    /*
    -----------------------------------
    CONFIRM DELETE
    -----------------------------------
    */

    const confirmDelete =
        await notifyConfirm(
        "Eliminar plantilla",
        "Esta acción eliminará la plantilla permanentemente."
        );

    if (!confirmDelete) {
        return;
    }

    try {

    /*
    -----------------------------------
    GET TEMPLATE IMAGES
    -----------------------------------
    */

    const templateImages =
        template.layers.filter(
        (layer) =>

            layer.type === "image" &&
            layer.storagePath
        );

    /*
    -----------------------------------
    DELETE STORAGE IMAGES
    -----------------------------------
    */

    for (const imageLayer of templateImages) {

        try {

            await deleteTemplateImage(imageLayer.storagePath);

        } catch (error) {
            console.error("Error deleting image:", error);
        }
    }

    /*
    -----------------------------------
    DELETE TEMPLATE
    -----------------------------------
    */

    await deleteSignTemplate(companyId, selectedTemplateId);

    /*
    -----------------------------------
    RELOAD TEMPLATES
    -----------------------------------
    */

    await loadTemplates();

    /*
    -----------------------------------
    SUCCESS
    -----------------------------------
    */

    notifySuccess("Plantilla eliminada");

    } catch (error) {

        console.error(error);
        notifyError("Error eliminando plantilla");
    }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE TEMPLATE
    |--------------------------------------------------------------------------
    */

    const handleCreateNewTemplate = () => {
        setTemplate(defaultSignTemplate);

        setSelectedTemplateId(null);

        setSelectedLayerId(null);

        setTemplateName("Plantilla sin título");
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN TEMPLATE
    |--------------------------------------------------------------------------
    */

    const openTemplate = (
    selectedTemplate
    ) => {

    const normalizedLayers =
        selectedTemplate.layers.map(
        (layer) => {

            /*
            -----------------------------------
            TEXT
            -----------------------------------
            */

            if (layer.type === "text") {

            return {
                fontSize: 72,

                fontWeight: 700,

                color: "#000000",

                textAlign: "center",

                fontFamily: "Arial",

                width: 600,

                height: 120,

                ...layer,
            };
            }

            /*
            -----------------------------------
            SHAPE
            -----------------------------------
            */

            if (layer.type === "shape") {

            return {
                backgroundColor: "#000000",

                opacity: 0.2,

                borderRadius: 20,

                width: 300,

                height: 200,

                ...layer,
            };
            }

            /*
            -----------------------------------
            IMAGE
            -----------------------------------
            */

            if (layer.type === "image") {

            return {
                width: 300,

                height: 300,

                ...layer,
            };
            }

            return layer;
        }
        );

    setTemplate({
        canvas: selectedTemplate.canvas,

        layers: normalizedLayers,
    });

    setTemplateName(
        selectedTemplate.name
    );

    setSelectedTemplateId(
        selectedTemplate.id
    );

    };

  /*
  |--------------------------------------------------------------------------
  | CREATE TEXT LAYER
  |--------------------------------------------------------------------------
  */

  const createTextLayer = (textValue) => {
    saveHistory();
    const newLayer = {
      id: generateLayerId(),

      type: "text",

      text: textValue,

      x: 200,
      y: 200,

      width: 600,
      height: 120,

      fontSize: 72,

      fontWeight: 700,

      color: "#000000",

      textAlign: "center",

      fontFamily: "Arial",
    };

    setTemplate({
      ...template,
      layers: [...template.layers, newLayer],
    });

    setSelectedLayerId(newLayer.id);

    setRightPanelTab("properties");
  };

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC FIELDS
  |--------------------------------------------------------------------------
  */

  const addDynamicFieldLayer = (
    fieldValue
  ) => {

  createTextLayer(fieldValue);
  };

  /*
  |--------------------------------------------------------------------------
  | STATIC TEXT
  |--------------------------------------------------------------------------
  */

  const addStaticTextLayer = () => {
    createTextLayer("Nuevo texto");
  };

  /*
  |--------------------------------------------------------------------------
  | SHAPE
  |--------------------------------------------------------------------------
  */

  const addShapeLayer = () => {
    saveHistory();

    const newLayer = {
      id: generateLayerId(),

      type: "shape",

      x: 200,
      y: 200,

      width: 300,
      height: 200,

      backgroundColor: "#000000",

      opacity: 0.2,

      borderRadius: 20,
    };

    setTemplate({
      ...template,
      layers: [...template.layers, newLayer],
    });

    setSelectedLayerId(newLayer.id);
    setRightPanelTab("properties");
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

    const addImageLayer = async (event) => {
        saveHistory();
        try {

            /*
            -----------------------------------
            FILE
            -----------------------------------
            */

            const file = event.target.files[0];

            if (!file) {
            return;
            }

            /*
            -----------------------------------
            UPLOAD TO FIREBASE STORAGE
            -----------------------------------
            */

            const result = await uploadTemplateImage({ companyId, file,});

            /*
            -----------------------------------
            CREATE IMAGE LAYER
            -----------------------------------
            */

            const newLayer = {
            id: generateLayerId(),

            type: "image",

            src: result.url,

            storagePath:
                result.path,

            x: 200,
            y: 200,

            width: 300,
            height: 300,
            };

            /*
            -----------------------------------
            UPDATE TEMPLATE
            -----------------------------------
            */

            setTemplate({
            ...template,

            layers: [
                ...template.layers,
                newLayer,
            ],
            });

            /*
            -----------------------------------
            SELECT LAYER
            -----------------------------------
            */

            setSelectedLayerId(newLayer.id);
            setRightPanelTab("properties");
            //notifySuccess("Imagen subida");

        } catch (error) {

            console.error(error);
            notifyError("Error cargando imagen");
        }
    };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

    const deleteLayer = async (layerId) => {
    saveHistory();
    /*
    -----------------------------------
    FIND LAYER
    -----------------------------------
    */

    const layerToDelete =
        template.layers.find(
        (layer) =>
            layer.id === layerId
        );

    /*
    -----------------------------------
    DELETE IMAGE FROM STORAGE
    -----------------------------------
    */

    if (
        layerToDelete?.type === "image" &&
        layerToDelete?.storagePath
    ) {

        try {

        await deleteTemplateImage(
            layerToDelete.storagePath
        );

        } catch (error) {

        console.error(
            "Error deleting image:",
            error
        );
        }
    }

    /*
    -----------------------------------
    REMOVE LAYER
    -----------------------------------
    */

    const updatedLayers = template.layers.filter(
        (layer) =>
            layer.id !== layerId
        );

    setTemplate({
        ...template,

        layers: updatedLayers,
    });

    /*
    -----------------------------------
    RESET SELECTED
    -----------------------------------
    */

    if (
        selectedLayerId === layerId
    ) {

        setSelectedLayerId(
        null
        );
    }
    };

  /*
  |--------------------------------------------------------------------------
  | DUPLICATE
  |--------------------------------------------------------------------------
  */

  const duplicateLayer = (layer) => {
    saveHistory();

    const duplicatedLayer = {
      ...layer,

      id: generateLayerId(),

      x: layer.x + 40,
      y: layer.y + 40,
    };

    setTemplate({
      ...template,
      layers: [...template.layers, duplicatedLayer],
    });

    setSelectedLayerId(duplicatedLayer.id);

    setRightPanelTab("properties");
  };

  /*
  |--------------------------------------------------------------------------
  | MOVE UP
  |--------------------------------------------------------------------------
  */

  const moveLayerUp = (index) => {
    saveHistory();
    if (index >= template.layers.length - 1) {
      return;
    }

    const updatedLayers = [...template.layers];

    [
      updatedLayers[index],
      updatedLayers[index + 1],
    ] = [
      updatedLayers[index + 1],
      updatedLayers[index],
    ];

    setTemplate({
      ...template,
      layers: updatedLayers,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | MOVE DOWN
  |--------------------------------------------------------------------------
  */

  const moveLayerDown = (index) => {
    saveHistory();

    if (index <= 0) {
      return;
    }

    const updatedLayers = [...template.layers];

    [
      updatedLayers[index],
      updatedLayers[index - 1],
    ] = [
      updatedLayers[index - 1],
      updatedLayers[index],
    ];

    setTemplate({
      ...template,
      layers: updatedLayers,
    });
  };
  
  const moveSelectedLayer = (deltaX, deltaY ) => {
    saveHistory();

    /*
    -----------------------------------
    VALIDATE
    -----------------------------------
    */

    if (!selectedLayerId) {
        return;
    }

    /*
    -----------------------------------
    FIND LAYER
    -----------------------------------
    */

    const selectedLayer =
        template.layers.find(
        (layer) =>
            layer.id === selectedLayerId
        );

    if (!selectedLayer) {
        return;
    }

    /*
    -----------------------------------
    UPDATE POSITION
    -----------------------------------
    */

    updateLayer(
        selectedLayerId,
        {
            x: selectedLayer.x + deltaX,
            y: selectedLayer.y + deltaY,
        }
    );
  };

  const pasteLayer = () => {

    /*
    -----------------------------------
    VALIDATE
    -----------------------------------
    */

    if (!copiedLayer) {
        return;
    }

    /*
    -----------------------------------
    DUPLICATE
    -----------------------------------
    */

    const duplicatedLayer = {
        ...copiedLayer,
        id: generateLayerId(),
        x: copiedLayer.x + 40,
        y: copiedLayer.y + 40,
    };

    /*
    -----------------------------------
    UPDATE TEMPLATE
    -----------------------------------
    */

    setTemplate({
        ...template,

        layers: [
        ...template.layers,
        duplicatedLayer,
        ],
    });

    /*
    -----------------------------------
    SELECT
    -----------------------------------
    */

    setSelectedLayerId(duplicatedLayer.id );

    setRightPanelTab("properties");
    };

  const handleKeyDown = (
    event
    ) => {

    /*
    -----------------------------------
    ACTIVE ELEMENT
    -----------------------------------
    */

    const activeElement = document.activeElement;

    const isTyping =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA";

    /*
    -----------------------------------
    PREVENT SHORTCUTS
    WHILE TYPING
    -----------------------------------
    */

    if (isTyping) {
        return;
    }

    /*
    -----------------------------------
    VALIDATE LAYER
    -----------------------------------
    */

    const selectedLayer =
        template.layers.find(
        (layer) => layer.id === selectedLayerId);

    /*
    -----------------------------------
    DELETE
    -----------------------------------
    */

    if (
        event.key === "Delete" ||
        event.key === "Backspace"
    ) {

        if (!selectedLayerId) {
        return;
        }

        event.preventDefault();
        deleteLayer(selectedLayerId);

        return;
    }

    /*
    -----------------------------------
    ESC
    -----------------------------------
    */

    if (event.key === "Escape") {
        setSelectedLayerId(null);
        return;
    }

    /*
    -----------------------------------
    CTRL + D
    -----------------------------------
    */

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "d"
    ) {
        event.preventDefault();

        if (!selectedLayer) {
        return;
        }

        duplicateLayer(selectedLayer);
        return;
    }

    /*
    -----------------------------------
    CTRL + S
    -----------------------------------
    */

    if ( event.ctrlKey && event.key.toLowerCase() === "s" ) {

        event.preventDefault();
        handleSaveTemplate();

    return;
    }

    /*
    -----------------------------------
    CTRL + Z
    -----------------------------------
    */

    if (event.ctrlKey && !event.shiftKey &&
        event.key.toLowerCase() === "z") {

        event.preventDefault();
        undo();
        return;
    }

    /*
    -----------------------------------
    REDO
    CTRL + SHIFT + Z
    CTRL + Y
    -----------------------------------
    */

    if (
        (
            event.ctrlKey && event.shiftKey &&
            event.key.toLowerCase() === "z"
        ) 
        ||
        (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        )

    ) {

        event.preventDefault();
        redo();
        return;
    }

    /*
    -----------------------------------
    CTRL + C
    -----------------------------------
    */

    if (event.ctrlKey && event.key.toLowerCase() === "c") {

        if (!selectedLayer) {
            return;
        }

        event.preventDefault();
        setCopiedLayer(selectedLayer);

        //notifySuccess("Layer copiado");

        return;
        }

    /*
    -----------------------------------
    CTRL + V
    -----------------------------------
    */

    if (
    event.ctrlKey &&
    event.key.toLowerCase() === "v"
    ) {

    event.preventDefault();

    pasteLayer();

    return;
    }

    /*
    -----------------------------------
    MOVEMENT
    -----------------------------------
    */

    const moveAmount = event.shiftKey ? 10 : 1;

    switch (event.key) {

        case "ArrowUp":
            event.preventDefault();
            moveSelectedLayer(0, -moveAmount);

        break;

        case "ArrowDown":
            event.preventDefault();
            moveSelectedLayer(0, moveAmount);

        break;

        case "ArrowLeft":
            event.preventDefault();
            moveSelectedLayer(-moveAmount, 0);

        break;

        case "ArrowRight":
            event.preventDefault();
            moveSelectedLayer(moveAmount, 0);

        break;

        default:
        break;
    }
  };

  return (
    <div className="sign-template-editor">

    {/* LEFT */}
    <div className="sign-template-main">

    {/* HEADER */}
    <div className="sign-template-header">

        {/* HIDDEN IMAGE INPUT */}
        <input
        id="sign-image-upload"

        type="file"

        accept="image/*"

        style={{
            display: "none"
        }}

        onChange={addImageLayer}
        />
        
        {/* LEFT */}
        <div className="sign-template-header-left">

        {/* TITLE */}
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

        {/* LEFT */}
        <div className="sign-template-templates-column">

            <TemplatesList
            templates={templates}
            onSelectTemplate={openTemplate}
            />

        </div>

        {/* RIGHT */}
        <div className="sign-template-controls-column">

            {/* INPUT */}
            <div className="sign-template-input-wrapper">

            <input
                value={templateName}

                onChange={(e) =>
                setTemplateName(
                    e.target.value
                )
                }

                placeholder="Nombre de la plantilla"

                className="sign-template-name-input"
            />

            </div>

            {
                hasReachedTemplateLimit && (

                    <div className="sign-template-limit-message">
                        <strong> Límite alcanzado:</strong>
                        {" "}
                        Ya tienes 5 plantillas creadas. Puedes editar o eliminar
                        plantillas existentes para crear nuevas.
                    </div>
                )
            }

            {/* BUTTONS */}
            <div className="sign-template-buttons-row">

            <button
                onClick={handleCreateNewTemplate}
                disabled={hasReachedTemplateLimit}
                className={`sign-template-new-btn ${hasReachedTemplateLimit ? "disabled" : "" }`}
            >
                Nuevo
            </button>

            {/* <button
                onClick={handleCreateNewTemplate}
                className="sign-template-new-btn"
            >
                Nuevo
            </button> */}

            <button
                onClick={
                handleSaveTemplate
                }

                className="sign-template-save-btn"
            >
                Guardar
            </button>

            <button
                onClick={
                handleDeleteTemplate
                }

                disabled={
                !selectedTemplateId
                }

                className={`sign-template-delete-btn ${!selectedTemplateId ? "disabled" : "" }`}
            >
                Eliminar
            </button>

            </div>

            {/* ORIENTATION */}
            <div className="sign-orientation-toggle">

            <button
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

        {/* RIGHT */}
        <div className="sign-template-top-actions">

        {/* TOOLBAR */}
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

            onAddImage={() => {

                document
                .getElementById(
                    "sign-image-upload"
                )
                .click();
            }}
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
            template.canvas.height,
        }}
        >

        <SignCanvas
            template={template}
            setTemplate={setTemplate}
            saveHistory={saveHistory}
            signData={signData}

            selectedLayerId={
            selectedLayerId
            }

            setSelectedLayerId={(id) => {

            setSelectedLayerId(id);

            setRightPanelTab(
                "properties"
            );
            }}
        />

        </div>

    </div>

    </div>

    {/* RIGHT */}
    <div className="sign-template-sidebar">

        {/* TABS */}
        <div className="sign-template-tabs">

        <button
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

        {/* CONTENT */}
        <div className="sign-template-sidebar-content">

        {rightPanelTab ===
            "properties" && (

            <SignLayerProperties
            selectedLayer={
                template.layers.find(
                (layer) =>
                    layer.id ===
                    selectedLayerId
                )
            }

            updateLayer={
                updateLayer
            }
            />

        )}

        {rightPanelTab ===
            "layers" && (

            <SignLayersPanel
            layers={template.layers}

            selectedLayerId={
                selectedLayerId
            }

            setSelectedLayerId={(
                id
            ) => {

                setSelectedLayerId(id);

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