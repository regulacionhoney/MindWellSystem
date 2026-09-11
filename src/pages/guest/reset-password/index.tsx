import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthShell } from "@/components/common/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage } from "@/services/api";
import { authApi } from "@/services/authApi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const nextErrors: Record<string, string> = {};

    if (!token) nextErrors.token = "This reset link is missing its token.";
    if (!email) nextErrors.email = "This reset link is missing its email.";
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) {
      nextErrors.password_confirmation = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setDone(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-lg font-semibold text-gray-900">Choose a new password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Set a new password for <span className="font-medium text-gray-700">{email || "your account"}</span>.
      </p>

      {done ? (
        <div className="mt-5 space-y-4">
          <Alert variant="success">Your password has been reset. You can now sign in.</Alert>
          <Button className="w-full" onClick={() => window.location.assign("/login")}>
            Go to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {!token && errors.token && <Alert variant="error">{errors.token}</Alert>}
          {!email && errors.email && <Alert variant="error">{errors.email}</Alert>}
          <div>
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              placeholder="At least 8 characters"
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password-confirmation">Confirm new password</Label>
            <PasswordInput
              id="password-confirmation"
              autoComplete="new-password"
              value={passwordConfirmation}
              placeholder="Repeat your password"
              error={errors.password_confirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" loading={submitting}>
            Reset password
          </Button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-gray-500">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}