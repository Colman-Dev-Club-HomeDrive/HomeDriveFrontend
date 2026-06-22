import { useState } from 'react';
import { Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/user.slice';
import { VITE_API_URL } from '@/consts/consts';

type AuthMode = 'signin' | 'signup';

const REGISTER_URL = `${VITE_API_URL}/auth/register`;

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function SignUp() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('signup submit clicked');

    clearMessages();

    if (mode === 'signin') {
      setSuccessMessage('Sign in is not connected yet.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email is required.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and Confirm Password must match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data?.message === 'string' ? data.message : 'Registration failed. Please try again.';
        setErrorMessage(message);
        return;
      }

      const result = data as RegisterResponse;

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      dispatch(setUser({ id: result.user.id, name: result.user.name }));

      setSuccessMessage('Account created successfully! Redirecting...');
      navigate('/');
    } catch {
      setErrorMessage('Could not reach the server. Make sure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'signin' ? 'Sign In' : 'Sign Up';
  const subtitle = mode === 'signin' ? 'Welcome back, sign in to your account' : 'Create your account';
  const submitLabel = mode === 'signin' ? 'Sign in' : 'Create account';
  const toggleLabel = mode === 'signin' ? "Don't have an account?" : 'Already have an account?';
  const toggleAction = mode === 'signin' ? 'Sign Up' : 'Sign In';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[url('/bg4.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-slate-950/10" />
      <div className="relative z-10 w-full max-w-xl px-6 py-12">
        <div className="mb-10 flex items-center justify-center gap-3 text-center">
          <Cloud className="h-16 w-16 text-foreground" />
          <h1 className="text-4xl font-bold uppercase tracking-[0.35em] text-foreground sm:text-5xl whitespace-nowrap">
            HOME DRIVE
          </h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">{subtitle}</p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">{title}</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col items-center space-y-5">
            {errorMessage ? (
              <p className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {successMessage}
              </p>
            ) : null}

            {mode === 'signup' ? (
              <>
                <div className="w-full max-w-sm space-y-2">
                  <label className="block text-sm font-medium text-foreground" htmlFor="name">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearMessages();
                    }}
                    placeholder="Name"
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="w-full max-w-sm space-y-2">
                  <label className="block text-sm font-medium text-foreground" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      clearMessages();
                    }}
                    placeholder="Username"
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </>
            ) : null}

            <div className="w-full max-w-sm space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearMessages();
                }}
                placeholder="Email"
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {mode === 'signup' ? (
              <div className="w-full max-w-sm space-y-2">
                <label className="block text-sm font-medium text-foreground" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    clearMessages();
                  }}
                  placeholder="Phone Number"
                  className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : null}

            <div className="w-full max-w-sm space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearMessages();
                }}
                placeholder="Password"
                className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {mode === 'signup' ? (
              <div className="w-full max-w-sm space-y-2">
                <label className="block text-sm font-medium text-foreground" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearMessages();
                  }}
                  placeholder="Confirm Password"
                  className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full max-w-sm rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : submitLabel}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                clearMessages();
              }}
              className="w-full max-w-sm rounded-2xl border border-border/70 bg-background/90 px-5 py-4 text-sm font-semibold text-foreground transition hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {toggleAction}
            </button>

            <p className="w-full max-w-sm text-center text-sm text-muted-foreground">{toggleLabel}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
