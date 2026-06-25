import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { AuthBootstrap } from '@/ui/AuthBootstrap';
import '@/styles/index.css';

export function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  );
}
