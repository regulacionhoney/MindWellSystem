import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeSocialSession } = useAuth();

  const session = useState(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    if (!token || !userParam) {
      return null;
    }
    try {
      const user = JSON.parse(userParam) as User;
      return { user, token };
    } catch {
      return null;
    }
  })[0];

  useEffect(() => {
    if (!session) {
      return;
    }
    completeSocialSession(session.user, session.token);
    navigate("/", { replace: true });
  }, [session, navigate, completeSocialSession]);

  const errorCode = searchParams.get("error");
  const provider = searchParams.get("provider");

  const errorMessage =
    errorCode === "not_configured"
      ? `${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Social"} sign-in isn't connected yet. Please use your email to sign in instead.`
      : errorCode === "deactivated"
        ? "Your account has been deactivated. Please contact an administrator."
        : "Sign-in could not be completed. Please try again.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm text-center">
        {session ? (
          <div>
            <div className="mx-auto size-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="mt-5 text-sm text-gray-600">Completing sign in...</p>
          </div>
        ) : (
          <>
            <Alert variant="error">{errorMessage}</Alert>
            <Link
              to="/login"
              className="mt-5 inline-block font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}