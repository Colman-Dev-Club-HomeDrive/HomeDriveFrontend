import { Home } from '@/ui/pages/Home';
import { Login } from '@/ui/pages/Login';
import { MyDrive } from '@/ui/pages/MyDrive';
import { NotFound } from '@/ui/pages/NotFound';
import { Stats } from '@/ui/pages/Stats';
import { Trash } from '@/ui/pages/Trash';
import { WorkSpace } from '@/ui/pages/WorkSpace';
import { Root } from '@/ui/Root';
import { SignUp } from '@/ui/pages/SignUp';
import { createBrowserRouter, redirect } from 'react-router-dom';

// Auth check loader
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    return redirect('/login');
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login
  },
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
    Component: Root,
    children: [
      { 
        path: '/home', 
        Component: Home,
        loader: requireAuth
      },
      { 
        path: '/mydrive', 
        Component: MyDrive,
        loader: requireAuth
      },
      { 
        path: '/workspaces', 
        Component: WorkSpace,
        loader: requireAuth
      },
      { 
        path: '/workspaces/:workspaceId', 
        Component: MyDrive,
        loader: requireAuth
      },
      {
        path: '/stats',
        Component: Stats,
        loader: requireAuth,
      },
      {
        path: '/trash',
        Component: Trash,
        loader: requireAuth,
      },
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);
