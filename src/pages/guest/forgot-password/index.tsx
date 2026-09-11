import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AuthShell } from "@/components/common/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/services/api";
import { authApi } from "@/services/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await authApi.forgotPassword(email.trim());
      setResetUrl(response.reset_url);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!resetUrl) return;
    try {
      await navigator.clipboard.writeText(resetUrl);
    } catch {
      window.prompt("Copy your reset link:", resetUrl);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-lg font-semibold text-gray-900">Forgot password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Enter your account email to generate a password reset link.
      </p>

      {resetUrl ? (
        <div className="mt-5 space-y-4">
          <Alert variant="success">
            Reset link generated. Copy it and open it to choose a new password.
          </Alert>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 break-all text-xs text-gray-600">
            {resetUrl}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={copyLink}>
              Copy link
            </Button>
            <Button type="button" onClick={() => window.location.assign(resetUrl)}>
              Open reset page
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
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
          <Button type="submit" className="w-full" loading={submitting}>
            Generate reset link
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