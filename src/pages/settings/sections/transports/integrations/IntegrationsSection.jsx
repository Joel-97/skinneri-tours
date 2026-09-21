/*
==========================================================
INTEGRATIONS SECTION
==========================================================
*/

import { useCallback, useEffect, useState } from "react";

import {
  KeyRound,
  Plus,
  RefreshCw,
  LayoutTemplate
} from "lucide-react";

import { useAuth } from "../../../../../context/AuthContext";

import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../../../../services/notificationService";

import {
  createTransportationIntegration,
  getTransportationIntegration,
  migrateTransportationIntegrationWidget,
  rotateTransportationIntegrationApiKey,
  updateTransportationIntegrationStatus
} from "../../../../../services/platform/transportationIntegrationService";

import CatalogHeader from "../../../components/CatalogHeader";
import CatalogToolbar from "../../../components/CatalogToolbar";
import CatalogEmpty from "../../../components/CatalogEmpty";
import CatalogStatusBadge from "../../../components/CatalogStatusBadge";
import CatalogActions from "../../../components/CatalogActions";

import DataTable from "../../../../../components/general/dataTable";

import "../../../../../style/settings/transportation/catalog/catalogSection.css";


/*
==========================================================
COMPONENT
==========================================================
*/

const IntegrationsSection = () => {

  /*
  ==========================================================
  CONTEXT
  ==========================================================
  */

  const { session } = useAuth();

  const company = session?.company;


  /*
  ==========================================================
  STATE
  ==========================================================
  */

  const [integration, setIntegration] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [rotating, setRotating] =
    useState(false);

  const [migratingWidget, setMigratingWidget] =
    useState(false);

  const [newApiKey, setNewApiKey] =
    useState("");

  const [widgetId, setWidgetId] =
    useState("");


  /*
  ==========================================================
  FETCH
  ==========================================================
  */

  const fetchIntegration = useCallback(
    async () => {

      if (!company?.id) {

        setLoading(false);

        return;

      }

      try {

        setLoading(true);

        const result =
          await getTransportationIntegration(
            company.id
          );

        setIntegration(
          result?.data || null
        );

      }

      catch (error) {

        console.error(error);

        notifyError(
          error?.message ||
          "No fue posible cargar la integración."
        );

      }

      finally {

        setLoading(false);

      }

    },
    [company]
  );


  /*
  ==========================================================
  EFFECTS
  ==========================================================
  */

  useEffect(() => {

    fetchIntegration();

  }, [fetchIntegration]);


  /*
  ==========================================================
  CREATE
  ==========================================================
  */

  const handleCreate = async () => {

    if (!company?.id) return;

    try {

      setCreating(true);

      setNewApiKey("");

      const result =
        await createTransportationIntegration(
          company.id
        );

      const data =
        result?.data;

      if (!data?.apiKey) {

        throw new Error(
          "No se recibió la API Key."
        );

      }


      /*
      ------------------------------------------------------
      SAVE API KEY TEMPORARILY
      ------------------------------------------------------
      */

      setNewApiKey(
        data.apiKey
      );


      /*
      ------------------------------------------------------
      UPDATE LOCAL STATE
      ------------------------------------------------------
      */

      setIntegration({

        exists: true,

        id: data.id,

        type: data.type,

        status: data.status,

        companyCode:
          data.companyCode,

        apiKeyPrefix:
          data.apiKey.slice(0, 16),

        widgetId:
          data.widgetId || null

      });


      /*
      ------------------------------------------------------
      WIDGET
      ------------------------------------------------------
      */

      if (data.widgetId) {

        setWidgetId(
          data.widgetId
        );

      }


      notifySuccess(
        "Integración creada",
        "La integración de transportes fue creada correctamente."
      );

    }

    catch (error) {

      console.error(error);

      notifyError(
        error?.message ||
        "No fue posible crear la integración."
      );

    }

    finally {

      setCreating(false);

    }

  };


  /*
  ==========================================================
  MIGRATE / CREATE WIDGET
  ==========================================================
  */

  const handleMigrateWidget = async () => {

    if (
      !company?.id ||
      !integration ||
      migratingWidget ||
      rotating ||
      updating
    ) {
      return;
    }


    /*
    ------------------------------------------------------
    CONFIRMATION
    ------------------------------------------------------
    */

    const confirmed =
      await notifyConfirm(
        "¿Deseas crear o vincular el Widget de transportes para esta integración?"
      );

    if (!confirmed) return;


    try {

      setMigratingWidget(true);


      /*
      ------------------------------------------------------
      MIGRATE
      ------------------------------------------------------
      */

      const result =
        await migrateTransportationIntegrationWidget(
          company.id
        );

      const data =
        result?.data;


      if (!data?.widgetId) {

        throw new Error(
          "No se recibió el Widget ID."
        );

      }


      /*
      ------------------------------------------------------
      SAVE WIDGET ID
      ------------------------------------------------------
      */

      setWidgetId(
        data.widgetId
      );


      /*
      ------------------------------------------------------
      REFRESH INTEGRATION
      ------------------------------------------------------
      */

      await fetchIntegration();


      /*
      ------------------------------------------------------
      SUCCESS MESSAGE
      ------------------------------------------------------
      */

      notifySuccess(
        "Widget disponible",
        data.widgetCreated
          ? "El Widget de transportes fue creado correctamente."
          : "El Widget de transportes ya existía y fue vinculado correctamente."
      );

    }

    catch (error) {

      console.error(error);

      notifyError(
        error?.message ||
        "No fue posible crear o vincular el Widget."
      );

    }

    finally {

      setMigratingWidget(false);

    }

  };


  /*
  ==========================================================
  ROTATE API KEY
  ==========================================================
  */

  const handleRotateApiKey = async () => {

    if (
      !company?.id ||
      !integration ||
      rotating
    ) {
      return;
    }


    /*
    ------------------------------------------------------
    CONFIRMATION
    ------------------------------------------------------
    */

    const confirmed =
      await notifyConfirm(
        "¿Deseas rotar la API Key? La clave actual quedará invalidada inmediatamente."
      );

    if (!confirmed) return;


    try {

      setRotating(true);

      setNewApiKey("");


      /*
      ------------------------------------------------------
      ROTATE
      ------------------------------------------------------
      */

      const result =
        await rotateTransportationIntegrationApiKey(
          company.id
        );

      const data =
        result?.data;


      if (!data?.apiKey) {

        throw new Error(
          "No se recibió la nueva API Key."
        );

      }


      /*
      ------------------------------------------------------
      SAVE NEW API KEY TEMPORARILY
      ------------------------------------------------------
      */

      setNewApiKey(
        data.apiKey
      );


      /*
      ------------------------------------------------------
      UPDATE LOCAL STATE
      ------------------------------------------------------
      */

      setIntegration(
        current => ({

          ...current,

          exists: true,

          id:
            data.id ||
            current?.id,

          type:
            data.type ||
            current?.type,

          status:
            data.status ||
            current?.status,

          companyCode:
            data.companyCode ||
            current?.companyCode,

          apiKeyPrefix:
            data.apiKeyPrefix ||
            data.apiKey.slice(0, 16),

          widgetId:
            data.widgetId ||
            current?.widgetId ||
            null

        })
      );


      notifySuccess(
        "API Key rotada",
        "La nueva API Key fue generada correctamente. La clave anterior ya no es válida."
      );

    }

    catch (error) {

      console.error(error);

      notifyError(
        error?.message ||
        "No fue posible rotar la API Key."
      );

    }

    finally {

      setRotating(false);

    }

  };


  /*
  ==========================================================
  TOGGLE STATUS
  ==========================================================
  */

  const handleToggleStatus = async () => {

    if (
      !company?.id ||
      !integration
    ) {
      return;
    }


    const isActive =
      integration.status === "active";


    const action =
      isActive
        ? "desactivar"
        : "activar";


    const confirmed =
      await notifyConfirm(
        `¿Deseas ${action} la integración de transportes?`
      );


    if (!confirmed) return;


    try {

      setUpdating(true);


      const newStatus =
        isActive
          ? "inactive"
          : "active";


      await updateTransportationIntegrationStatus(
        company.id,
        newStatus
      );


      notifySuccess(
        "Estado actualizado",
        `La integración fue ${
          newStatus === "active"
            ? "activada"
            : "desactivada"
        } correctamente.`
      );


      fetchIntegration();

    }

    catch (error) {

      console.error(error);

      notifyError(
        error?.message ||
        "No fue posible actualizar el estado."
      );

    }

    finally {

      setUpdating(false);

    }

  };


  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

  const columns = [

    {
      key: "name",
      label: "Integración",
      sortable: true,
      minWidth: "250px",
      maxWidth: "300px"
    },

    {
      key: "type",
      label: "Tipo",
      width: "180px"
    },

    {
      key: "apiKey",
      label: "API Key",
      minWidth: "260px",
      maxWidth: "300px"
    },

    {
      key: "status",
      label: "Estado",
      width: "150px",
      align: "center"
    },

    {
      key: "actions",
      label: "Acciones",
      width: "360px",
      align: "center"
    }

  ];


  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <div className="catalog-container">


      {/* ==================================================
          HEADER
      ================================================== */}

      <CatalogHeader
        title="Integraciones"
        description="Administra las integraciones disponibles para conectar servicios externos con Skinneri."
      >

        <CatalogToolbar>

          {!integration?.exists && (

            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={creating}
            >

              <Plus size={18} />

              {creating
                ? "Creando..."
                : "Crear integración"}

            </button>

          )}

        </CatalogToolbar>

      </CatalogHeader>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="catalog-content">


        {
          !loading &&
          !integration?.exists &&
          (

            <CatalogEmpty
              message="Todavía no existe una integración de transportes para esta empresa."
            />

          )
        }


        {
          integration?.exists &&
          (

            <DataTable
              columns={columns}
              data={[integration]}
              renderRow={() => (

                <>


                  {/* ======================================
                      NAME
                  ====================================== */}

                  <td>

                    <strong>
                      API de transportes
                    </strong>

                  </td>


                  {/* ======================================
                      TYPE
                  ====================================== */}

                  <td>
                    Transportes
                  </td>


                  {/* ======================================
                      API KEY
                  ====================================== */}

                  <td>

                    <code>

                      {integration.apiKeyPrefix}

                      •••••••••••••

                    </code>

                  </td>


                  {/* ======================================
                      STATUS
                  ====================================== */}

                  <td
                    style={{
                      textAlign: "center"
                    }}
                  >

                    <CatalogStatusBadge
                      value={
                        integration.status === "active"
                          ? "active"
                          : "inactive"
                      }
                      options={[
                        {
                          value: "active",
                          label: "Activa"
                        },
                        {
                          value: "inactive",
                          label: "Inactiva"
                        }
                      ]}
                    />

                  </td>


                  {/* ======================================
                      ACTIONS
                  ====================================== */}

                  <td
                    style={{
                      textAlign: "center"
                    }}
                  >

                    <CatalogActions>


                      {/* ==================================
                          WIDGET
                      ================================== */}

                      <button
                        className="catalog-action"
                        onClick={handleMigrateWidget}
                        disabled={
                          migratingWidget ||
                          rotating ||
                          updating
                        }
                      >

                        <LayoutTemplate
                          size={15}
                        />

                        {migratingWidget
                          ? "Preparando..."
                          : integration.widgetId || widgetId
                            ? "Widget disponible"
                            : "Crear Widget"}

                      </button>


                      {/* ==================================
                          ROTATE API KEY
                      ================================== */}

                      <button
                        className="catalog-action"
                        onClick={handleRotateApiKey}
                        disabled={
                          rotating ||
                          updating ||
                          migratingWidget
                        }
                      >

                        <RefreshCw
                          size={15}
                        />

                        {rotating
                          ? "Rotando..."
                          : "Rotar API Key"}

                      </button>


                      {/* ==================================
                          TOGGLE STATUS
                      ================================== */}

                      <button
                        className="catalog-action"
                        onClick={handleToggleStatus}
                        disabled={
                          updating ||
                          rotating ||
                          migratingWidget
                        }
                      >

                        {updating
                          ? "Actualizando..."
                          : integration.status === "active"
                            ? "Desactivar"
                            : "Activar"}

                      </button>


                    </CatalogActions>

                  </td>


                </>

              )}
            />

          )
        }


      </div>


      {/* ==================================================
          WIDGET ID
      ================================================== */}

      {
        (
          integration?.widgetId ||
          widgetId
        ) && (

          <div className="catalog-content">

            <div className="catalog-empty">

              <LayoutTemplate
                size={28}
              />


              <p>

                <strong>
                  Widget de transportes disponible.
                </strong>

              </p>


              <p>

                Este identificador público puede utilizarse
                para generar el código de inserción del Widget.

              </p>


              <p>

                <code>
                  {integration?.widgetId || widgetId}
                </code>

              </p>


              <p>

                El Widget utiliza este identificador público.
                La API Key privada nunca debe exponerse en el navegador.

              </p>

            </div>

          </div>

        )
      }


      {/* ==================================================
          API KEY CREATED / ROTATED
      ================================================== */}

      {
        newApiKey && (

          <div className="catalog-content">

            <div className="catalog-empty">

              <KeyRound
                size={28}
              />


              <p>

                <strong>
                  API Key generada correctamente.
                </strong>

              </p>


              <p>

                Esta clave solamente se mostrará
                durante esta operación.

              </p>


              <p>

                <code>
                  {newApiKey}
                </code>

              </p>


              <p>

                Guarda esta clave en un lugar seguro.
                La clave anterior ya no es válida.

              </p>

            </div>

          </div>

        )

      }


    </div>

  );

};


export default IntegrationsSection;