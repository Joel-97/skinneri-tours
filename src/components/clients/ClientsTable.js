import React, { useEffect, useState } from "react";
import { getClients, deleteClient } from "../../services/clients/clientService";
import { UserAuth } from "../../context/AuthContext";
import ClientCreateModal from "./CreateClientModal";
import {
  notifySuccess,
  notifyError,
  notifyConfirm
} from "../../services/notificationService";

const ClientsTable = ({ searchTerm, onSelectClient, refresh }) => {

  const { companyId, adminData, isSuperAdmin } = UserAuth();

  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    if (companyId) {
      loadClients();
    }
  }, [refresh, companyId]);

  const loadClients = async () => {
    try {
      const data = await getClients(companyId);
      setClients(data);
    } catch (error) {
      console.error(error);
      notifyError("Error", "No se pudieron cargar los clientes.");
    }
  };

  const canDelete =
    isSuperAdmin || adminData?.role === "admin";

  /* ================= ELIMINAR CLIENTE ================= */

  const handleDelete = async (client, e) => {
    e.stopPropagation();

    if (!canDelete) return;

    const confirmed = await notifyConfirm(
      "¿Eliminar cliente?",
      `Esta acción eliminará a "${client.name}" permanentemente.`
    );

    if (!confirmed) return;

    try {
      await deleteClient(client.id, companyId);
      await loadClients();

      notifySuccess(
        "Cliente eliminado",
        "El cliente fue eliminado correctamente."
      );

    } catch (error) {
      console.error(error);
      notifyError(
        "Error",
        "No se pudo eliminar el cliente."
      );
    }
  };

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">

          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Tipo</th>
                <th style={{ width: "120px" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} onClick={() => onSelectClient(client)} style={{ cursor: "pointer" }}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.type}</td>

                  <td className="d-flex gap-2">

                    {/* EDITAR */}
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClient(client);
                      }}
                    >
                      ✏️
                    </button>

                    {/* ELIMINAR SOLO ADMIN */}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => handleDelete(client, e)}
                      >
                        🗑️
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL CREAR / EDITAR CLIENTE */}
      <ClientCreateModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onClientCreated={() => {
          setEditingClient(null);
          loadClients();

          notifySuccess(
            "Cliente actualizado",
            "Los cambios se guardaron correctamente."
          );
        }}
        client={editingClient}
        mode="edit"
      />
    </>
  );
};

export default ClientsTable;
