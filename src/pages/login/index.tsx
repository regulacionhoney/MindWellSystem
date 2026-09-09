import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { AuthShell } from "@/components/common/auth-shell";
import { SocialLogin } from "@/components/common/social-login";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";

type LoginState = {
  registered?: boolean;
  email?: string;
};

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const locationState = useLocation().state as LoginState | null;
  const [email, setEmail] = useState(locationState?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && role) {
    const target = role === "admin" ? "/admin/dashboard" : `/${role}/dashboard`;
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      const target = loggedIn.role === "admin" ? "/admin/dashboard" : `/${loggedIn.role}/dashboard`;
      navigate(target, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>
      <p className="mt-1 text-sm text-gray-500">Welcome back. Enter your details to continue.</p>

      {locationState?.registered && (
        <Alert variant="success" className="mt-4">
          Account created successfully. Sign in to continue.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" loading={submitting}>
          Sign in
        </Button>
      </form>

      <SocialLogin providers={["google", "facebook"]} />

      <p className="mt-5 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}