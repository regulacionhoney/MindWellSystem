import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { authApi } from "@/services/authApi";
import { formatDate } from "@/lib/format";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setMessage({ kind: "error", text: "Name and email are required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });
      await refreshUser();
      setMessage({ kind: "success", text: "Profile updated successfully." });
    } catch (updateError) {
      setMessage({ kind: "error", text: getErrorMessage(updateError) });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPwMessage(null);
    const nextErrors: Record<string, string> = {};
    if (!currentPassword) nextErrors.current_password = "Enter your current password.";
    if (newPassword.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (newPassword !== passwordConfirmation) {
      nextErrors.password_confirmation = "Passwords do not match.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setPwErrors(nextErrors);
      return;
    }
    setPwErrors({});
    setSavingPassword(true);
    try {
      await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setPwMessage({ kind: "success", text: "Password updated successfully." });
    } catch (updateError) {
      setPwMessage({ kind: "error", text: getErrorMessage(updateError) });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Update your personal information." />

      {message && (
        <div className="mb-4">
          <Alert variant={message.kind}>{message.text}</Alert>
        </div>
      )}

      <Card className="max-w-2xl shadow-md ring-1 ring-gray-100">
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={name || user.name} src={avatar || user.avatar} size="lg" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs capitalize text-emerald-700">{user.role}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-name">Full name</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="profile-phone">Phone (optional)</Label>
              <Input id="profile-phone" value={phone} placeholder="+63 912 345 6789" onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="profile-avatar">Avatar URL (optional)</Label>
              <Input id="profile-avatar" value={avatar} placeholder="https://..." onChange={(e) => setAvatar(e.target.value)} />
            </div>

            <div>
              <Label>Member since</Label>
              <Input value={formatDate(user.created_at)} readOnly />
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-6 max-w-2xl shadow-md ring-1 ring-gray-100">
        <CardBody>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Change password</h3>
            <p className="text-xs text-gray-500">Update the password used to sign in to your account.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
            {pwMessage && <Alert variant={pwMessage.kind}>{pwMessage.text}</Alert>}
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={currentPassword}
                error={pwErrors.current_password}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  placeholder="At least 8 characters"
                  error={pwErrors.password}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  error={pwErrors.password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button type="submit" variant="secondary" loading={savingPassword}>
                Update password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}