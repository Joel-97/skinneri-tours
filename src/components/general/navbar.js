import React, { useState } from "react";

import {
  Container,
  Navbar,
  Dropdown
} from "react-bootstrap";

import {
  useNavigate,
  useLocation
} from "react-router-dom";

import logoWord from "../../assets/Skinneri_Logo_izquierda_blanco.png";

import { useAuth } from "../../context/AuthContext";

import { isSuperAdmin } from "../../utils/authorization";

import { isModuleEnabled } from "../../utils/platform/moduleUtils";

import { server } from "../../services/serverName/Server";

import "../../style/style.css";
import "../../style/navbar.css";

/*
--------------------------------------------------------------------------
                               AvatarDropdown
--------------------------------------------------------------------------
*/

const AvatarDropdown = ({

  user,

  company,

  logout

}) => {

  const [

    show,

    setShow

  ] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  /*
  ==========================================================
  SUPER ADMIN
  ==========================================================
  */

  const userIsSuperAdmin =

    isSuperAdmin(user);

  /*
  ==========================================================
  MODULES
  ==========================================================
  */

  const transportationEnabled =

    isModuleEnabled(

      company,

      "transportation"

    );

  const adventureEnabled =

    isModuleEnabled(

      company,

      "adventure"

    );

  /*
  ==========================================================
  ACTIVE ROUTE
  ==========================================================
  */

  const isActive = (path) =>

    location.pathname.startsWith(path);

  /*
  ==========================================================
  AVATAR
  ==========================================================
  */

  const avatarUrl = user?.email

    ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email.charAt(
        0
      )}&backgroundColor=ffffff&textColor=08204b`

    : `https://api.dicebear.com/7.x/initials/svg?seed=A&backgroundColor=ffffff&textColor=0a2a63`;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <Dropdown

      show={show}

      onToggle={setShow}

    >

      <Dropdown.Toggle

        as="div"

        className="dropdown-toggle nav-user"

        onClick={() =>

          setShow(!show)

        }

      >

        <img

          src={avatarUrl}

          className="nav-avatar"

          alt="User avatar"

        />

      </Dropdown.Toggle>

      <Dropdown.Menu align="end">

        {/* ==================================================
            HOME
        ================================================== */}

        <Dropdown.Item

          onClick={() =>

            navigate("/home")

          }

          className={

            isActive("/home")

              ? "active-item"

              : ""

          }

        >

          Inicio

        </Dropdown.Item>

        {/* ==================================================
            CLIENTS
        ================================================== */}

        <Dropdown.Item

          onClick={() =>

            navigate("/clients")

          }

          className={

            isActive("/clients")

              ? "active-item"

              : ""

          }

        >

          Clientes

        </Dropdown.Item>

        {/* ==================================================
            TRANSPORTATION
        ================================================== */}

        {

          transportationEnabled && (

            <Dropdown.Item

              onClick={() =>

                navigate("/transport")

              }

              className={

                isActive("/transport")

                  ? "active-item"

                  : ""

              }

            >

              Transportes

            </Dropdown.Item>

          )

        }

        {/* ==================================================
            ADVENTURES
        ================================================== */}

        {

          adventureEnabled && (

            <Dropdown.Item

              onClick={() =>

                navigate("/adventure")

              }

              className={

                isActive("/adventure")

                  ? "active-item"

                  : ""

              }

            >

              Aventuras

            </Dropdown.Item>

          )

        }

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <Dropdown.Item

          onClick={() =>

            navigate("/analytics")

          }

          className={

            isActive("/analytics")

              ? "active-item"

              : ""

          }

        >

          Analíticas

        </Dropdown.Item>

        {/* ==================================================
            SETTINGS
        ================================================== */}

        <Dropdown.Item

          onClick={() =>

            navigate("/settings")

          }

          className={

            isActive("/settings")

              ? "active-item"

              : ""

          }

        >

          Configuración

        </Dropdown.Item>

        {/* ==================================================
            REPORTS
        ================================================== */}

        <Dropdown.Item

          onClick={() =>

            navigate("/reports")

          }

          className={

            isActive("/reports")

              ? "active-item"

              : ""

          }

        >

          Reportes

        </Dropdown.Item>

        {/* ==================================================
            SUPER ADMIN
        ================================================== */}

        {

          userIsSuperAdmin && (

            <>

              <Dropdown.Divider />

              <Dropdown.Item

                onClick={() =>

                  navigate("/superadmin")

                }

                className={

                  isActive("/superadmin")

                    ? "active-item"

                    : ""

                }

              >

                Panel SuperAdmin

              </Dropdown.Item>

            </>

          )

        }

        {/* ==================================================
            LOGOUT
        ================================================== */}

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

/*
--------------------------------------------------------------------------
                                   Navbar
--------------------------------------------------------------------------
*/

const Navbars = () => {

  const {

    session,

    logout,

    loading

  } = useAuth();

  const navigate = useNavigate();

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {

    return null;

  }

  /*
  ==========================================================
  NO SESSION
  ==========================================================
  */

  if (!session) {

    return null;

  }

  /*
  ==========================================================
  SESSION DATA
  ==========================================================
  */

  const user = session.user;

  const company = session.company;

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <Navbar

      expand="lg"

      className="navbar"

    >

      <Container

        fluid

        className="navbar-content"

      >

        {/* ==================================================
            COMPANY
        ================================================== */}

        <div className="navbar-left">

          {

            company?.logoURL ? (

              <img

                src={company.logoURL}

                alt={

                  company?.name ||

                  "Company Logo"

                }

                className="company-logo"

              />

            ) : (

              <h4 className="mb-0 text-white company-name">

                {

                  company?.name ||

                  "Sistema"

                }

              </h4>

            )

          }

        </div>

        {/* ==================================================
            CENTER LOGO
        ================================================== */}

        <div

          className="navbar-center"

          onClick={() =>

            navigate("/")

          }

          style={{

            cursor: "pointer"

          }}

        >

          {

            server === "dev"

              ? (

                <span className="test-mode">

                  THIS IS A TEST MODE

                </span>

              )

              : (

                <img

                  src={logoWord}

                  alt="Logo"

                  className="navbar-logo-center"

                />

              )

          }

        </div>

        {/* ==================================================
            USER
        ================================================== */}

        <div className="navbar-right">

          <AvatarDropdown

            user={user}

            company={company}

            logout={logout}

          />

        </div>

      </Container>

    </Navbar>

  );

};

export default Navbars;