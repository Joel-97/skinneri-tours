import React, { useState } from 'react';
import { Container, Navbar, Dropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from "react-router-dom";

import logoWord from '../../assets/Logo_izquierda_blanco_peq.png';

import { UserAuth } from '../../context/AuthContext';
import { server } from '../../services/serverName/Server';
import '../../style/style.css';
import '../../style/navbar.css';

/* -------------------------------------------------------------------------- */
/*                               AvatarDropdown                               */
/* -------------------------------------------------------------------------- */

const AvatarDropdown = ({ user, logout, isSuperAdmin }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const location = useLocation();

  // ✅ FIX AQUÍ
  const isActive = (path) => location.pathname.startsWith(path);

  const avatarUrl = user?.email
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email.charAt(0)}&backgroundColor=ffffff&textColor=08204b`
    : `https://api.dicebear.com/7.x/initials/svg?seed=A&backgroundColor=ffffff&textColor=0a2a63`;

  return (
    <Dropdown show={show} onToggle={setShow}>
      <Dropdown.Toggle
        as="div"
        className="dropdown-toggle nav-user"
        onClick={() => setShow(!show)}
      >
        <img src={avatarUrl} className="nav-avatar" alt="User avatar" />
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">

        <Dropdown.Item
          onClick={() => navigate("/home")}
          className={isActive("/home") ? "active-item" : ""}
        >
          Inicio
        </Dropdown.Item>
        
        <Dropdown.Item
          onClick={() => navigate("/clients")}
          className={isActive("/clients") ? "active-item" : ""}
        >
          Clientes
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => navigate("/transport")}
          className={isActive("/transport") ? "active-item" : ""}
        >
          Transportes
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => navigate("/adventure")}
          className={isActive("/adventure") ? "active-item" : ""}
        >
          Aventuras
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => navigate("/settings")}
          className={isActive("/settings") ? "active-item" : ""}
        >
          Configuración
        </Dropdown.Item>

        <Dropdown.Item
          onClick={() => navigate("/reports")}
          className={isActive("/reports") ? "active-item" : ""}
        >
          Reportes
        </Dropdown.Item>

        {isSuperAdmin && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              onClick={() => navigate("/superadmin")}
              className={isActive("/superadmin") ? "active-item" : ""}
            >
              Panel SuperAdmin
            </Dropdown.Item>
          </>
        )}

        <Dropdown.Divider />

        <Dropdown.Item
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          Cerrar sesión
        </Dropdown.Item>

      </Dropdown.Menu>
    </Dropdown>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   Navbar                                   */
/* -------------------------------------------------------------------------- */

const Navbars = () => {
  const { user, adminData, company, logout, isSuperAdmin } = UserAuth();
  const navigate = useNavigate();

  if (!user || adminData?.status === "pending") return null;

  return (
    <Navbar expand="lg" className="navbar">
      <Container fluid className="navbar-content">

        <div className="navbar-left">
          <h4 className="mb-0 text-white company-name">
            {company?.name || "Sistema"}
          </h4>
        </div>

        <div
          className="navbar-center"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          {server === "dev" ? (
            <span className="test-mode">THIS IS A TEST MODE</span>
          ) : (
            <img
              src={logoWord}
              alt="Logo"
              className="navbar-logo-center"
            />
          )}
        </div>

        <div className="navbar-right">
          <AvatarDropdown
            user={user}
            logout={logout}
            isSuperAdmin={isSuperAdmin}
          />
        </div>

      </Container>
    </Navbar>
  );
};

export default Navbars;