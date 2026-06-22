import { Home } from '@/ui/pages/Home';
import { Login } from '@/ui/pages/Login';
import { MyDrive } from '@/ui/pages/MyDrive';
import { NotFound } from '@/ui/pages/NotFound';
import { WorkSpace } from '@/ui/pages/WorkSpace';
import { Root } from '@/ui/Root';
import { SignUp } from '@/ui/pages/SignUp';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/signin',
    Component: SignUp
  },
  {
    path: '/signup',
    Component: SignUp
  },
  {
    path: '/login',
    Component: Login
  },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: '/mydrive', Component: MyDrive },
      { path: '/workspaces', Component: WorkSpace },
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
