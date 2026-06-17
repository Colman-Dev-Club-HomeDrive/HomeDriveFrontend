import { Home } from '@/ui/pages/Home';
import { Login } from '@/ui/pages/Login';
import { NotFound } from '@/ui/pages/NotFound';
import { WorkSpace } from '@/ui/pages/WorkSpace';
import { Root } from '@/ui/Root';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login
  },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: '/workspaces', Component: WorkSpace },
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
