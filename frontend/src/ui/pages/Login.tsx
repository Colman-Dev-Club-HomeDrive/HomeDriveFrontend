import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/store/apis/auth.api';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/user.slice';
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
  const dispatch = useAppDispatch();
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
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      }).unwrap();

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      dispatch(setUser({ id: result.user.id, name: result.user.name }));
      navigate('/');
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
