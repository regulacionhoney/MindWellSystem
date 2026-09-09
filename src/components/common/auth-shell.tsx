import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type AuthShellProps = {
  children: ReactNode;
};

const steps = [
  {
    icon: "clipboard" as const,
    title: "Share what's on your mind",
    description: "Send a simple counseling request whenever you need support.",
  },
  {
    icon: "users" as const,
    title: "Get matched with a counselor",
    description: "A qualified counselor reviews your request and schedules a session.",
  },
  {
    icon: "message" as const,
    title: "Talk privately & feel better",
    description: "Meet one-on-one in a safe, confidential space and start your journey.",
  },
];

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-stretch justify-center p-0 sm:p-6 lg:items-center lg:p-6">
      <div className="flex w-full max-w-6xl flex-col items-stretch overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl lg:flex-row lg:gap-6">
        <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-600 to-emerald-400" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] bg-[size:34px_34px]" />
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-emerald-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-16 size-96 rounded-full bg-emerald-200/30 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-white/95 shadow-lg">
                <img src="/mindwell-logo.png" alt="MindWell" className="size-12 object-contain" />
              </span>
              <div>
                <p className="text-base font-bold text-white">MindWell</p>
                <p className="text-[11px] text-emerald-200">Online mental health & counseling</p>
              </div>
            </div>

            <div className="my-6">
              <p className="text-[11px] font-semibold tracking-wider text-emerald-200 uppercase">
                Welcome to MindWell
              </p>
              <p className="mt-3 text-base text-emerald-100">
                A private online space to get mental health guidance from qualified counselors.
              </p>

              <ul className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white/15 shadow-lg backdrop-blur-md">
                      <Icon name={step.icon} className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-white">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-950/40 text-[10px] font-bold text-emerald-100">
                          {index + 1}
                        </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-100/90">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-emerald-200/90">
              Private · Confidential · Student-focused
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden bg-white px-6 py-8 sm:px-8 lg:rounded-3xl lg:px-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}