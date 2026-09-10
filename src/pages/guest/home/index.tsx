import { Link, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "message",
    title: "Share what's on your mind",
    text: "Request counseling on your own terms, whenever you need it.",
  },
  {
    icon: "users",
    title: "Get matched with a counselor",
    text: "Your request is reviewed and you're paired with the right support.",
  },
  {
    icon: "heart",
    title: "Talk privately & feel better",
    text: "Book sessions and message your counselor in a confidential space.",
  },
];

export default function GuestHomePage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const target = user.role === "admin" ? "/admin/dashboard" : `/${user.role}/dashboard`;
    return <Navigate to={target} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-emerald-50/50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm shadow-emerald-600/30">
            <Icon name="heart" className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">MindWell</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-600/30 transition-colors hover:from-emerald-700 hover:to-emerald-800"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="flex flex-col items-center py-16 text-center sm:py-24">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Student mental health, made simple
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            You&apos;re not alone. Help is here.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-gray-500">
            MindWell connects students with caring counselors through private, confidential sessions —
            from your first message to your next appointment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-3 text-base font-medium text-white shadow-md shadow-emerald-600/30 transition-colors hover:from-emerald-700 hover:to-emerald-800"
            >
              Start your free account
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="grid gap-5 pb-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon name={feature.icon} className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{feature.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white/60 py-6 text-center text-xs text-gray-400">
        Private · Confidential · Student-focused
      </footer>
    </div>
  );
}