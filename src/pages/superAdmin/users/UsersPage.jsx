import React from "react";

import Button from "../../../components/general/button";
import DataTable from "../../../components/general/dataTable";
import Avatar from "../../../components/general/Avatar";
import SearchInput from "../../../components/general/SearchInput";
import Toolbar from "../../../components/general/Toolbar";

import UserModal from "../../../components/superAdmin/UserModal";

import useUsers from "../../../hooks/user/useUsers";

import useUsersController from "../../../controllers/superAdmin/useUsersController";

export default function UsersPage() {

  /*
  ==========================================================
  USERS
  ==========================================================
  */

  const {

    users,

    loading,

    load,

    update,

    remove

  } = useUsers();

  /*
  ==========================================================
  CONTROLLER
  ==========================================================
  */

  const controller = useUsersController({

    users,

    load,

    update,

    remove

  });

  const {

    /*
    ==========================================
    STATE
    ==========================================
    */

    search,

    setSearch,

    selectedUser,

    modalOpen,

    mode,

    filteredUsers,

    /*
    ==========================================
    ACTIONS
    ==========================================
    */

    handleNewUser,

    handleViewUser,

    handleEditUser,

    handleCloseModal,

    handleSaveUser,

    handleDeleteUser

  } = controller;

  /*
  ==========================================================
  COLUMNS
  ==========================================================
  */

  const columns = [

    {

      key: "avatar",

      label: "",

      width: "70px"

    },

    {

      key: "displayName",

      label: "Nombre",

      sortable: true

    },

    {

      key: "email",

      label: "Correo",

      sortable: true

    },

    {

      key: "role",

      label: "Rol",

      sortable: true

    },

    {

      key: "status",

      label: "Estado",

      sortable: true

    },

    {

      key: "actions",

      label: "Acciones",

      width: "120px"

    }

  ];

  /*
  ==========================================================
  RENDER
  ==========================================================
  */

  return (

    <>

      <Toolbar

        left={

          <SearchInput

            value={search}

            onChange={setSearch}

            placeholder="Buscar usuario..."

          />

        }

        right={

          <Button

            onClick={handleNewUser}

          >

            Nuevo usuario

          </Button>

        }

      />

      <DataTable

        data={filteredUsers}

        loading={loading}

        columns={columns}

        emptyTitle="No hay usuarios registrados."

        emptyDescription="Cuando se registre el primer usuario aparecerá aquí."

        renderRow={(user) => (

          <>

            <td>

              <Avatar

                src={user.photoURL}

                name={user.displayName}

                size={38}

              />

            </td>

            <td>

              {user.displayName}

            </td>

            <td>

              {user.email}

            </td>

            <td>

              {user.role}

            </td>

            <td>

              {user.status}

            </td>

            <td>

              <Button

                onClick={() =>

                  handleViewUser(user)

                }

              >

                Ver

              </Button>

            </td>

          </>

        )}

      />

      <UserModal

        open={modalOpen}

        mode={mode}

        user={selectedUser}

        onClose={handleCloseModal}

        onEdit={handleEditUser}

        onSave={handleSaveUser}

        onDelete={handleDeleteUser}

      />

    </>

  );

}