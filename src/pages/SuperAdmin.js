import { useEffect, useState, useMemo } from "react";
import Select from "react-select";

import { listenPendingAdmins } from "../services/superAdmin/getPendingAdmins";
import { listenCompanies, listenCompanyAdmins } from "../services/superAdmin/getCompanies";

import {
  approveAdmin,
  rejectAdmin,
  createCompany,
  disableAdmin,
  enableAdmin,
  changeAdminRole,
  changeAdminCompany
} from "../services/superAdmin/adminActions";

import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import ModalC from "../components/general/modalSuperAdmin";

import "../style/superAdminCompanies.css";
import "../style/superAdmin.css";

import Swal from "sweetalert2";

const ROLE_OPTIONS = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff"
};

const SuperAdmin = () => {

  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyAdmins, setCompanyAdmins] = useState({});
  const [loadingAction, setLoadingAction] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");

  /* -------------------- LISTENERS -------------------- */

  useEffect(() => {

    const unsubscribeAdmins = listenPendingAdmins(setPendingAdmins);
    const unsubscribeCompanies = listenCompanies(setCompanies);

    return () => {
      unsubscribeAdmins();
      unsubscribeCompanies();
    };

  }, []);

  useEffect(() => {

    if (!companies.length) return;

    const unsubscribes = [];

    companies.forEach(company => {

      const unsubscribe = listenCompanyAdmins(
        company.id,
        (admins) => {

          setCompanyAdmins(prev => ({
            ...prev,
            [company.id]: admins
          }));

        }
      );

      unsubscribes.push(unsubscribe);

    });

    return () => unsubscribes.forEach(unsub => unsub());

  }, [companies]);

  /* -------------------- MEMO OPTIONS -------------------- */

  const companyOptions = useMemo(() => {
    return companies.map(c => ({
      value: c.id,
      label: c.name
    }));
  }, [companies]);

  /* -------------------- APPROVE ADMIN -------------------- */

  const openApproveModal = (admin) => {

    setSelectedAdmin(admin);
    setSelectedCompanyId("");
    setNewCompanyName("");
    setShowModal(true);

  };

  const closeModal = () => {
    console.log("dentro");

    setShowModal(false);
    setSelectedAdmin(null);
    setSelectedCompanyId("");
    setNewCompanyName("");

  };

  const confirmApprove = async () => {

    if (!selectedCompanyId && !newCompanyName.trim()) {

      Swal.fire({
        icon: "warning",
        title: "Falta información",
        text: "Selecciona empresa o crea una nueva."
      });

      return;

    }

    setLoadingAction(selectedAdmin.id);

    try {

      let companyIdToUse = selectedCompanyId;

      if (!selectedCompanyId) {

        const newCompany = await createCompany(newCompanyName.trim());
        companyIdToUse = newCompany.id;

      }

      await approveAdmin(selectedAdmin.id, companyIdToUse);

      closeModal();

      Swal.fire({
        icon: "success",
        title: "Administrador aprobado",
        text: "Asignado correctamente."
      });

    } catch (error) {

      console.error(error);

      Swal.fire(
        "Error",
        "No se pudo aprobar el administrador",
        "error"
      );

    }

    setLoadingAction(null);

  };

  /* -------------------- REJECT ADMIN -------------------- */

  const handleReject = async (admin) => {

    const confirm = await Swal.fire({
      title: "¿Rechazar admin?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {

      setLoadingAction(admin.id);

      await rejectAdmin(admin.id);

    } catch (error) {

      Swal.fire("Error", "No se pudo rechazar", "error");

    }

    setLoadingAction(null);

  };

  /* -------------------- ADMIN ACTIONS -------------------- */

  const handleDisable = async (adminId) => {

    try {

      setLoadingAction(adminId);
      await disableAdmin(adminId);

    } catch (error) {

      Swal.fire("Error", "No se pudo deshabilitar", "error");

    }

    setLoadingAction(null);

  };

  const handleEnable = async (adminId) => {

    try {

      setLoadingAction(adminId);
      await enableAdmin(adminId);

    } catch (error) {

      Swal.fire("Error", "No se pudo habilitar", "error");

    }

    setLoadingAction(null);

  };

  const handleRoleChange = async (admin) => {

    const { value: role } = await Swal.fire({
      title: "Cambiar rol",
      input: "select",
      inputOptions: ROLE_OPTIONS,
      inputValue: admin.role
    });

    if (!role) return;

    try {

      await changeAdminRole(admin.id, role);

    } catch (error) {

      Swal.fire("Error", "No se pudo cambiar rol", "error");

    }

  };

  const handleCompanyChange = async (admin) => {

    const options = {};

    companies.forEach(c => {
      options[c.id] = c.name;
    });

    const { value: newCompany } = await Swal.fire({
      title: "Mover a empresa",
      input: "select",
      inputOptions: options,
      inputValue: admin.companyId
    });

    if (!newCompany) return;

    try {

      await changeAdminCompany(admin.id, newCompany);

    } catch (error) {

      Swal.fire("Error", "No se pudo mover", "error");

    }

  };

  /* -------------------- UI -------------------- */

  return (

    <div className="superadmin-container">

      {/* MODAL APPROVE */}
      <ModalC
        show={showModal}
        onHide={closeModal}
        title="Aprobar administrador"
      >

        <div className="modal-content-superadmin">

          <p>Empresa existente</p>

          <Select
            className="input-company"
            options={companyOptions}
            value={
              companyOptions.find(
                option => option.value === selectedCompanyId
              ) || null
            }
            onChange={(selectedOption) =>
              setSelectedCompanyId(selectedOption?.value || "")
            }
            placeholder="Seleccionar empresa"
            isClearable
            isSearchable
          />

          <p>O crear nueva empresa</p>

          <input
            className="input-company"
            value={newCompanyName}
            onChange={(e) =>
              setNewCompanyName(e.target.value)
            }
          />

          <div className="modal-actions">

            <button
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancelar
            </button>

            <button
              className="approve-confirm-btn"
              onClick={confirmApprove}
            >
              Aprobar
            </button>

          </div>

        </div>

      </ModalC>

      <Tabs>

        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Empresas</Tab>
          <Tab>Solicitudes</Tab>
        </TabList>

        {/* DASHBOARD */}

        <TabPanel>

          <h3>Resumen</h3>

          <p>Total empresas: {companies.length}</p>
          <p>Admins pendientes: {pendingAdmins.length}</p>

        </TabPanel>

        {/* EMPRESAS */}

        <TabPanel>

          <h3 className="section-title">Empresas</h3>

          <div className="companies-grid">

            {companies.map(company => {

              const admins = companyAdmins[company.id] || [];

              return (

                <div
                  key={company.id}
                  className={`company-card-wrapper ${
                    admins.length > 6 ? "many" : ""
                  }`}
                >

                  <div className="company-card">

                    <div className="company-header">

                      <div>

                        <h4 className="company-name">
                          {company.name}
                        </h4>

                        <span className="company-id">
                          ID: {company.id}
                        </span>

                      </div>

                      <span className="admins-count">
                        {admins.length} admins
                      </span>

                    </div>

                    <div className="company-admins-list">

                      <p className="admins-title">
                        Administradores
                      </p>

                      {admins.length === 0 && (
                        <p className="no-admins">
                          Sin administradores
                        </p>
                      )}

                      {admins.map(admin => (

                        <div key={admin.id} className="admin-item">

                          <div className="admin-info">

                            <p className="admin-email">
                              {admin.email}
                            </p>

                            <div className="admin-meta">

                              <span className={`badge role-${admin.role}`}>
                                {admin.role}
                              </span>

                              <span className={`badge status-${admin.status}`}>
                                {admin.status}
                              </span>

                            </div>

                          </div>

                          <div className="admin-actions">

                            {admin.status === "approved" ? (

                              <button
                                className="btn btn-disable"
                                disabled={loadingAction === admin.id}
                                onClick={() => handleDisable(admin.id)}
                              >
                                {loadingAction === admin.id ? "..." : "Deshabilitar"}
                              </button>

                            ) : (

                              <button
                                className="btn btn-enable"
                                disabled={loadingAction === admin.id}
                                onClick={() => handleEnable(admin.id)}
                              >
                                {loadingAction === admin.id ? "..." : "Habilitar"}
                              </button>

                            )}

                            <button
                              className="btn btn-role"
                              onClick={() => handleRoleChange(admin)}
                            >
                              Rol
                            </button>

                            <button
                              className="btn btn-move"
                              onClick={() => handleCompanyChange(admin)}
                            >
                              Mover
                            </button>

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </TabPanel>

        {/* SOLICITUDES */}

        <TabPanel>

          <h3 className="section-title">
            Solicitudes de administradores
          </h3>

          {pendingAdmins.length === 0 && (
            <p className="empty-state">
              No hay solicitudes pendientes
            </p>
          )}

          <div className="requests-grid">

            {pendingAdmins.map(admin => (

              <div key={admin.id} className="request-card">

                <div className="request-info">

                  <p className="request-email">
                    {admin.email}
                  </p>

                  <span className="request-badge">
                    Pendiente
                  </span>

                </div>

                <div className="request-actions">

                  <button
                    className="btn approve"
                    onClick={() => openApproveModal(admin)}
                  >
                    Aprobar
                  </button>

                  <button
                    className="btn reject"
                    onClick={() => handleReject(admin)}
                  >
                    Rechazar
                  </button>

                </div>

              </div>

            ))}

          </div>

        </TabPanel>

      </Tabs>

    </div>
  );

};

export default SuperAdmin;