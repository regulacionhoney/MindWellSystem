type SocialOption = {
  label: string;
  icon: React.ReactNode;
};

const googleIcon = (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

const facebookIcon = (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
    <path
      fill="#1877F2"
      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
    />
  </svg>
);

const icons = {
  google: googleIcon,
  facebook: facebookIcon,
};

const allOptions: SocialOption[] = [
  { label: "Google", icon: icons.google },
  { label: "Facebook", icon: icons.facebook },
];

export type SocialProvider = keyof typeof icons;

type SocialLoginProps = {
  providers?: SocialProvider[];
};

function getApiOrigin(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function SocialLogin({ providers = ["google", "facebook"] }: SocialLoginProps) {
  const options = allOptions.filter((option) =>
    providers.some((provider) => provider === option.label.toLowerCase()),
  );

  const startOAuth = (provider: SocialProvider) => {
    window.location.assign(`${getApiOrigin()}/api/auth/${provider}/redirect`);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => startOAuth(option.label.toLowerCase() as SocialProvider)}
            className="flex items-center justify-center gap-2.5 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
          >
            {option.icon}
            <span>
              Continue with {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}