import { LoginForm, type LoginFormValues } from '../components/LoginForm';

export function Login() {
  const handleSubmit = (values: LoginFormValues) => {
    // TODO: Add login handling logic
    console.log(values);
  };

  return <LoginForm onSubmit={handleSubmit} />;
}
