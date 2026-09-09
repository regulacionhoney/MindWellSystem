import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatusBadge } from "@/components/common/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { adminApi } from "@/services/adminApi";
import { getErrorMessage } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/use-fetch";
import { formatDate } from "@/lib/format";
import type { User, UserRole } from "@/types";

type RoleFilter = UserRole | "all";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("student");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useFetch(
    () => adminApi.listUsers({ role: filter, search: debouncedSearch || undefined, per_page: 10 }),
    [page, filter, debouncedSearch],
  );

  const handleToggleActive = async (user: User) => {
    setBusyId(user.id);
    setActionError(null);
    try {
      await adminApi.toggleActive(user.id);
      refetch();
    } catch (toggleError) {
      setActionError(getErrorMessage(toggleError));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setActionError(null);
    try {
      await adminApi.deleteUser(user.id);
      if (editing?.id === user.id) setEditing(null);
      refetch();
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    }
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone ?? "");
    setEditRole(user.role);
    setActionError(null);
  };

  const saveRole = async () => {
    if (!editing) return;
    if (!editName.trim() || !editEmail.trim()) {
      setActionError("Name and email are required.");
      return;
    }
    setBusyId(editing.id);
    setActionError(null);
    try {
      await adminApi.updateUser(editing.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        role: editRole,
      });
      setEditing(null);
      refetch();
    } catch (updateError) {
      setActionError(getErrorMessage(updateError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage accounts across the platform."
        actions={
          <Select value={filter} onChange={(e) => { setFilter(e.target.value as RoleFilter); setPage(1); }}>
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="counselor">Counselors</option>
            <option value="admin">Admins</option>
          </Select>
        }
      />

      <div className="mb-5">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            window.setTimeout(() => setDebouncedSearch(e.target.value.trim()), 400);
          }}
        />
      </div>

      {actionError && <p className="mb-4 text-sm text-red-600">{actionError}</p>}

      <Card>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-7 text-emerald-700" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : !data || data.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">No users found.</p>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {data.data.map((user) => (
                  <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatar} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={user.role} />
                      <StatusBadge value={user.is_active ? "active" : "inactive"} />
                      {user.id === currentUser?.id ? (
                        <span className="text-xs text-gray-400">You</span>
                      ) : (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={busyId === user.id}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(user)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} lastPage={data.last_page} total={data.total} onPageChange={setPage} />
            </>
          )}
        </CardBody>
      </Card>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${editing?.name ?? "User"}`}>
        {editing && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={editPhone} placeholder="Optional" onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select id="edit-role" value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
                <option value="student">Student</option>
                <option value="counselor">Counselor</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <Label>Member since</Label>
              <Input value={formatDate(editing.created_at)} readOnly />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button loading={busyId === editing.id} onClick={saveRole}>
                Save changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}