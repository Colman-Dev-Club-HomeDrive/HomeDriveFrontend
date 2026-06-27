import { useNavigate, useLocation } from 'react-router-dom';
import { useLoginMutation } from '@/store/apis/auth.api';
import { LoginForm, type LoginFormValues } from '../components/LoginForm';
import type { ApiErrorResponse } from '@/types/auth.type';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useState } from 'react';

const getLoginErrorMessage = (error: FetchBaseQueryError): string => {
  if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
    const message = (error.data as ApiErrorResponse).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return 'Login failed. Please try again.';
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const handleSubmit = async (values: LoginFormValues) => {
    setErrorMessage('');
    setValidationMessage('');

    if (!values.email.trim()) {
      setValidationMessage('Email is required.');
      return;
    }

    if (!values.password) {
      setValidationMessage('Password is required.');
      return;
    }

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      // Redirect to where they were trying to go, or default to /home
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        setErrorMessage(getLoginErrorMessage(error as FetchBaseQueryError));
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    }
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      errorMessage={errorMessage}
      validationMessage={validationMessage}
      onFieldChange={() => {
        setErrorMessage('');
        setValidationMessage('');
      }}
    />
  );
}
