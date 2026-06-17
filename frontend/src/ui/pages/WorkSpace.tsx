import { Link } from 'react-router';

export function WorkSpace() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 px-0 py-8">
      <h1 className="text-2xl font-bold">Workspaces</h1>
      <p className="text-sm text-muted-foreground">Workspace management page.</p>
      <Link to="/" className="text-sm text-primary hover:underline">
        Back to Home
      </Link>
    </div>
  );
}
