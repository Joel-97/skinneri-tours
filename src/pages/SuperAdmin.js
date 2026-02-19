import { useEffect, useState } from "react";
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

import ModalC from "../components/general/modal";
import "../style/superAdminCompanies.css";
import "../style/superAdmin.css";

import Swal from "sweetalert2";

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

  // escuchar admins por empresa
  useEffect(() => {
    if (!companies.length) return;

    const unsubscribes = [];

    companies.forEach(company => {
      const unsubscribe = listenCompanyAdmins(company.id, (admins) => {
        setCompanyAdmins(prev => ({
          ...prev,
          [company.id]: admins
        }));
      });

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [companies]);

  /* -------------------- APPROVE ADMIN -------------------- */

  const openApproveModal = (admin) => {
    setSelectedAdmin(admin);
    setSelectedCompanyId("");
    setNewCompanyName("");
    setShowModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedCompanyId && !newCompanyName) {
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
        const newCompany = await createCompany(newCompanyName);
        companyIdToUse = newCompany.id;
      }

      await approveAdmin(selectedAdmin.id, companyIdToUse);

      setShowModal(false);
      setSelectedAdmin(null);

      Swal.fire({
        icon: "success",
        title: "Administrador aprobado",
        text: "Asignado correctamente."
      });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo aprobar el admin", "error");
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

    setLoadingAction(admin.id);
    await rejectAdmin(admin.id);
    setLoadingAction(null);
  };

  /* -------------------- ADMIN ACTIONS -------------------- */

  const handleDisable = async (adminId) => {
    setLoadingAction(adminId);
    await disableAdmin(adminId);
    setLoadingAction(null);
  };

  const handleEnable = async (adminId) => {
    setLoadingAction(adminId);
    await enableAdmin(adminId);
    setLoadingAction(null);
  };

  const handleRoleChange = async (admin) => {
    const { value: role } = await Swal.fire({
      title: "Cambiar rol",
      input: "select",
      inputOptions: {
        admin: "Admin",
        manager: "Manager",
        staff: "Staff"
      },
      inputValue: admin.role
    });

    if (!role) return;

    await changeAdminRole(admin.id, role);
  };

  const handleCompanyChange = async (admin) => {
    const companyOptions = {};
    companies.forEach(c => companyOptions[c.id] = c.name);

    const { value: newCompany } = await Swal.fire({
      title: "Mover a empresa",
      input: "select",
      inputOptions: companyOptions,
      inputValue: admin.companyId
    });

    if (!newCompany) return;

    await changeAdminCompany(admin.id, newCompany);
  };

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.name
  }));

  /* -------------------- UI -------------------- */

  return (
    <div className="superadmin-container">

      {/* MODAL APPROVE */}
      <ModalC
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Aprobar administrador"
      >
        <div className="modal-content-superadmin">
          <p>Empresa existente</p>
          <Select
            className="input-company"
            options={companyOptions}
            value={
              companyOptions.find(
                (option) => option.value === selectedCompanyId
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
            onChange={(e) => setNewCompanyName(e.target.value)}
          />

          <button className="approve-confirm-btn" onClick={confirmApprove}>
            Aprobar
          </button>
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
            {companies.map(company => (
            <div
              className={`company-admins ${
                companyAdmins[company.id]?.length > 6 ? "many" : ""
              }`}
            >

              <div key={company.id} className="company-card" >

                {/* HEADER */}
                <div className="company-header">
                  <div>
                    <h4 className="company-name">{company.name}</h4>
                    <span className="company-id">ID: {company.id}</span>
                  </div>

                  <span className="admins-count">
                    {companyAdmins[company.id]?.length || 0} admins
                  </span>
                </div>

                {/* ADMINS */}
                <div className="company-admins">
                  <p className="admins-title">Administradores</p>

                  {companyAdmins[company.id]?.length === 0 && (
                    <p className="no-admins">Sin administradores</p>
                  )}

                  {companyAdmins[company.id]?.map(admin => (
                    <div key={admin.id} className="admin-item">

                      {/* INFO ADMIN */}
                      <div className="admin-info">
                        <p className="admin-email">{admin.email}</p>

                        <div className="admin-meta">
                          <span className={`badge role-${admin.role}`}>
                            {admin.role}
                          </span>

                          <span className={`badge status-${admin.status}`}>
                            {admin.status}
                          </span>
                        </div>
                      </div>

                      {/* ACCIONES */}
                      <div className="admin-actions">

                        {admin.status === "approved" ? (
                          <button
                            className="btn btn-disable"
                            onClick={() => handleDisable(admin.id)}
                          >
                            Deshabilitar
                          </button>
                        ) : (
                          <button
                            className="btn btn-enable"
                            onClick={() => handleEnable(admin.id)}
                          >
                            Habilitar
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
            ))}
          </div>
        </TabPanel>


        {/* SOLICITUDES */}
        <TabPanel>
          <h3 className="section-title">Solicitudes de administradores</h3>

          {pendingAdmins.length === 0 && (
            <p className="empty-state">No hay solicitudes pendientes</p>
          )}

          <div className="requests-grid">
            {pendingAdmins.map(admin => (
              <div key={admin.id} className="request-card">

                <div className="request-info">
                  <p className="request-email">{admin.email}</p>
                  <span className="request-badge">Pendiente</span>
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
