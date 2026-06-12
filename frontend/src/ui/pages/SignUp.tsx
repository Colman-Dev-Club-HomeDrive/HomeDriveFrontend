import { useState } from 'react';
import { Cloud } from 'lucide-react';

const initialFormState = {
  name: '',
  username: '',
  email: '',
  phone: '',
  password: ''
};

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^\+?[0-9\s()-]{7,20}$/.test(phone);

export function SignUp() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof typeof initialFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.username.trim()) nextErrors.username = 'Username is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!validateEmail(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(form.phone.trim())) nextErrors.phone = 'Enter a valid phone number.';
    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8) nextErrors.password = 'Password should be at least 8 characters.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setSubmitted(false);
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[url('/bg4.jpg')] bg-cover bg-center bg-no-repeat flex items-center justify-center text-foreground">
      <div className="absolute inset-0 bg-slate-950/10" />
      <div className="relative z-10 w-full max-w-xl px-6 py-12">
        <div className="mb-10 flex items-center justify-center gap-3 text-center">
          <Cloud className="h-16 w-16 text-foreground" />
          <h1 className="text-4xl font-bold uppercase tracking-[0.35em] text-foreground sm:text-5xl whitespace-nowrap">
            HOME DRIVE
          </h1>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Create your account</p>
            <h2 className="mt-3 text-4xl font-semibold text-foreground">Sign Up</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-5">
            {['name', 'username', 'email', 'phone', 'password'].map((field) => {
              const label =
                field === 'name'
                  ? 'Name'
                  : field === 'username'
                  ? 'Username'
                  : field === 'email'
                  ? 'Email'
                  : field === 'phone'
                  ? 'Phone Number'
                  : 'Password';
              const type = field === 'password' ? 'password' : field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text';

              return (
                <div key={field} className="w-full max-w-sm space-y-2">
                  <label className="block text-sm font-medium text-foreground" htmlFor={field}>
                    {label}
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={type}
                    value={form[field as keyof typeof initialFormState]}
                    onChange={(event) => handleChange(field as keyof typeof initialFormState, event.target.value)}
                    placeholder={label}
                    className="w-full rounded-2xl border border-border bg-background/80 px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors[field] ? <p className="mt-1 text-sm text-destructive">{errors[field]}</p> : null}
                </div>
              );
            })}

            <button
              type="submit"
              className="w-full max-w-sm rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Create account
            </button>

            {submitted ? (
              <p className="w-full max-w-sm rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary-foreground">
                Success! Your sign up request is ready to submit.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
