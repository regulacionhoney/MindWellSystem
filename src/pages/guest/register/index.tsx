import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AuthShell } from "@/components/common/auth-shell";
import { SocialLogin } from "@/components/common/social-login";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";

type RoleOption = "student" | "counselor";

export default function RegisterPage() {
  const { register, isAuthenticated, role: authRole } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleOption>("student");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && authRole) {
    const target = authRole === "admin" ? "/admin/dashboard" : `/${authRole}/dashboard`;
    return <Navigate to={target} replace />;
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) next.password_confirmation = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const created = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
        role: selectedRole,
        phone: phone.trim() || undefined,
      });
      navigate("/login", { replace: true, state: { registered: true, email: created.email } });
    } catch (registerError) {
      setError(getErrorMessage(registerError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-lg font-semibold text-gray-900">Create an account</h2>
      <p className="mt-1 text-sm text-gray-500">Join MindWell to access counseling support.</p>

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            error={errors.name}
            placeholder="Your name"
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="role">I am a</Label>
          <Select id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as RoleOption)}>
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            error={errors.password}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password_confirmation">Confirm password</Label>
          <Input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            error={errors.password_confirmation}
            placeholder="Repeat your password"
            autoComplete="new-password"
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>

      <SocialLogin providers={["google", "facebook"]} />

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}