# HomeCloud

HomeCloud is a full-stack file and workspace management app with a TypeScript backend and a modern React frontend.

The backend in [HomeDriveBackend](HomeDriveBackend) provides the API layer for auth, users, files, posts, and workspaces. The frontend in [HomeDriveFrontend](HomeDriveFrontend) is a Vite + React application that uses Redux Toolkit, RTK Query, sockets, and shadcn/ui for the user interface.

## Tech Stack

- Backend: Node.js, Express, MongoDB, TypeScript
- Frontend: React, Vite, TypeScript, Redux Toolkit, RTK Query
- UI: Tailwind CSS, shadcn/ui, Lucide icons
- Realtime: Socket.IO client support

## Project Layout

- [HomeDriveBackend](HomeDriveBackend): API, controllers, models, routes, validators, and types
- [HomeDriveFrontend](HomeDriveFrontend): React app, store, sockets, UI, hooks, and shared types

## Run Locally

Install dependencies and run the backend and frontend in separate terminals.

- Backend: `cd HomeDriveBackend && npm install && npm run dev`
- Frontend: `cd HomeDriveFrontend/frontend && npm install && npm run dev`
