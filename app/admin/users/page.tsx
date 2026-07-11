// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, UserPlus, Search } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { User, Role } from "@/lib/types";
import { useAuth } from "@/lib/auth/auth-context";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const ROLE_OPTIONS: Role[] = ["USER", "ADMIN", "MANAGER", "SUPPORT"];

const ROLE_STYLES: Record<Role, string> = {
  USER: "bg-gray-100 text-gray-600",
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-blue-100 text-blue-700",
  SUPPORT: "bg-purple-100 text-purple-700",
};

function ChangeRoleModal({
  user,
  onClose,
  onChanged,
}: {
  user: User;
  onClose: () => void;
  onChanged: (u: User) => void;
}) {
  const [role, setRole] = useState<Role>(user.role);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (role === user.role) {
      onClose();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.patch(`/user/change-role/${user.id}`, { role });
      onChanged({ ...user, role });
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors du changement de rôle",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Changer le rôle de {user.username}
        </h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusToggle({
  user,
  onChanged,
}: {
  user: User;
  onChanged: (u: User) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  async function toggle() {
    const action = user.isActive ? "suspendre" : "réactiver";
    if (!confirm(`Voulez-vous ${action} le compte de ${user.username} ?`))
      return;
    setIsSaving(true);
    try {
      const updated = await apiClient.patch<User>(`/user/${user.id}/status`, {
        isActive: !user.isActive,
      });
      onChanged(updated);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Erreur lors du changement de statut",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isSaving}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50 ${
        user.isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
      title={
        user.isActive ? "Cliquer pour suspendre" : "Cliquer pour réactiver"
      }
    >
      {isSaving ? (
        <Loader2 size={12} className="animate-spin" />
      ) : user.isActive ? (
        "Actif"
      ) : (
        "Inactif"
      )}
    </button>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [roleEditUser, setRoleEditUser] = useState<User | null>(null);

  useEffect(() => {
    apiClient
      .get<User[]>("/user/all")
      .then((data) => setUsers(data ?? []))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function confirmDelete() {
    if (!confirmDeleteUser) return;
    setDeletingId(confirmDeleteUser.id);
    try {
      await apiClient.delete(`/user/${confirmDeleteUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== confirmDeleteUser.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
      setConfirmDeleteUser(null);
    }
  }

  const filtered = search
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : users;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{users.length} utilisateur(s)</p>
        </div>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <UserPlus size={16} />
          Nouvel utilisateur
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher (nom, email, username)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:underline"
                    >
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setRoleEditUser(user)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_STYLES[user.role]}`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <StatusToggle
                      user={user}
                      onChanged={(updated) =>
                        setUsers((prev) =>
                          prev.map((u) => (u.id === updated.id ? updated : u)),
                        )
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirmDeleteUser(user)}
                      disabled={
                        deletingId === user.id || user.id === currentUser?.id
                      }
                      title={
                        user.id === currentUser?.id
                          ? "Vous ne pouvez pas supprimer votre propre compte"
                          : undefined
                      }
                      className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                    >
                      {deletingId === user.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {roleEditUser && (
        <ChangeRoleModal
          user={roleEditUser}
          onClose={() => setRoleEditUser(null)}
          onChanged={(updated) =>
            setUsers((prev) =>
              prev.map((u) => (u.id === updated.id ? updated : u)),
            )
          }
        />
      )}

      <ConfirmDialog
        open={confirmDeleteUser !== null}
        title="Supprimer l'utilisateur"
        message={`Voulez-vous vraiment supprimer « ${confirmDeleteUser?.username} » ?`}
        confirmLabel="Supprimer"
        isLoading={deletingId !== null}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteUser(null)}
      />
    </div>
  );
}
