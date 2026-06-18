import { useState } from 'react';
import { Cloud } from 'lucide-react';

export type LoginFormValues = {
  userName: string;
  password: string;
  rememberMe: boolean;
};

type LoginFormProps = {
  onSubmit?: (values: LoginFormValues) => void;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({ userName, password, rememberMe });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[url('/bg4.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center text-white">
      <div className="absolute inset-0 bg-slate-950/20" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 flex items-center justify-center gap-3">
          <Cloud className="h-16 w-16 text-white" />
          <h1 className="text-center text-5xl font-bold uppercase tracking-[0.35em] text-white sm:text-6xl">
            HOME CLOUD
          </h1>
        </div>

        <div className="w-full max-w-xl rounded-2xl bg-slate-950/5 backdrop-blur-3xl border border-white/10 shadow-2xl p-8">
          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white" htmlFor="userName">
                User Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-blue-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  value={userName}
                  onChange={(event) => setUserName(event.target.value)}
                  placeholder="User Name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-14 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-blue-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-14 py-4 pr-14 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19.5c-5.55 0-10.21-3.4-12-8.25a10.92 10.92 0 0 1 4.66-5.81" />
                      <path d="M1.5 1.5 22.5 22.5" />
                      <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                      <path d="M15 11c0 1.657-1.343 3-3 3a2.99 2.99 0 0 1-2.12-.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="inline-flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-5 w-5 rounded border border-blue-500 bg-slate-950/40 text-blue-500 focus:ring-blue-400/40"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-sky-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

