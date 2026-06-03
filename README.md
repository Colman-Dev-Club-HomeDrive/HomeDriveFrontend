# Full-Stack Starter (React + Express + MongoDB)

A full-stack boilerplate with a **React/Vite** frontend and a **Node/Express + MongoDB (Mongoose)** backend.

This README focuses on **what technologies are used** and **how the frontend/backend are structured** (architecture), based on the actual code in this repo.

---

## Tech stack (at a glance)

### Frontend (`frontend/`)

- **Runtime / bundler**: Vite + TypeScript (ESM)
- **UI**: React 19
- **Routing**: React Router v7 (`RouterProvider` + `createBrowserRouter`)
- **State**: Redux Toolkit slices + **RTK Query** for data fetching
- **Styling**: Tailwind CSS v4 + `@tailwindcss/vite`
- **Component library**: shadcn/ui (New York style) + Radix primitives + Lucide icons
- **Forms & validation**: React Hook Form + Zod (+ resolvers)
- **Charts / tables / animation**: Recharts, TanStack Table, Motion
- **Realtime (client)**: `socket.io-client` with a provider + hooks pattern
- **Tooling**: ESLint (type-aware) + Prettier


## Project structure

```
full-stack-starter-code/

  frontend/
    src/
      main.tsx           # React entry + Redux Provider
      App.tsx            # RouterProvider
      router/            # route definitions
      ui/                # layout + pages
      store/             # Redux store + slices + RTK Query APIs
      sockets/           # socket.io client provider + hooks
      shadcn/            # shadcn/ui components, utils, registries
      styles/            # Tailwind v4 CSS entry
      types/             # shared frontend types
      consts/            # constants + env accessors
```

---

## Setup / installation


### Frontend

```bash
cd frontend
npm i
```

---

## Environment variables


### Frontend (`frontend/.env.development`, `frontend/.env.production`)

Used in `frontend/src/consts/consts.ts`:

- **`VITE_API_URL`**: backend base URL (example: `http://localhost:3000`)

---

## Running locally

### Terminal: frontend

```bash
cd frontend
npm run dev
```

---

## Frontend architecture

### App entry + routing

- `frontend/src/main.tsx` mounts the app and wraps it with the Redux `<Provider store={store} />`.
- `frontend/src/App.tsx` renders React Router’s `<RouterProvider />`.
- `frontend/src/router/index.ts` defines routes using `createBrowserRouter`:
  - `/` → `Root` layout → `Home` page
  - `*` → `NotFound`
- `frontend/src/ui/Root.tsx` is the **layout wrapper**. It currently wraps the app in `SocketProvider` and renders an `<Outlet />` for nested routes.

### State management (Redux Toolkit + RTK Query)

- `frontend/src/store/index.ts` configures the Redux store:
  - classic slices (example: `user`, `counter`)
  - RTK Query API slice(s) (example: `pokemonApi`)
- `frontend/src/store/hooks/index.ts` exports typed hooks:
  - `useAppDispatch`
  - `useAppSelector`
- `frontend/src/store/apis/pokemon.api.ts` is a working RTK Query example hitting the public PokeAPI.

How to think about it:

- **Slices** hold local UI/app state.
- **RTK Query** holds server/cache state and generates hooks (e.g. `useLazyGetPokemonByNameQuery`).

### Styling + UI components

- Tailwind CSS v4 is enabled via `@tailwindcss/vite` (see `frontend/vite.config.ts`).
- The Tailwind entry file is `frontend/src/styles/index.css`.
- shadcn/ui is configured in `frontend/components.json` and components live under `frontend/src/shadcn/components/ui/`.

### Path aliases

- `@/` resolves to `frontend/src` (configured in `frontend/vite.config.ts` and `frontend/tsconfig*.json`).

### Sockets (client-only)

The repo includes a reusable **Socket.IO client** wrapper:

- Provider: `frontend/src/sockets/SocketProvider.tsx`
  - accepts an array of URLs
  - creates and manages one socket connection per URL
  - exposes connection status per URL
- Hooks:
  - `frontend/src/sockets/useSockets.ts`
  - `frontend/src/sockets/useSocketStatuses.ts`

To enable sockets, add URLs in `frontend/src/ui/Root.tsx` (currently it’s an empty array).

Note: there is **no Socket.IO server** implemented in the backend in this repo.

---
### Frontend (`frontend/package.json`)

- `npm run dev`: start Vite dev server
- `npm run build`: typecheck/build
- `npm run preview`: preview the production build
- `npm run check`: typecheck + lint + format check

---

## Session Summary — June 3, 2026

### Overview
Built the full HomeDrive frontend UI from scratch — layout shell, design system, and all Home page sections — in a single session.

### Design System
- Translated the original `tokens.css` (`--color-bg`, `--color-hero`, `--color-surface`, etc.) into Tailwind CSS v4 semantic variables inside `src/styles/index.css`
- Mapped tokens to shadcn/ui variables: `--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`, `--ring`, `--destructive`
- Added Inter font (Google Fonts), custom scrollbar styles, and font-smoothing from `global.css`
- Defined dark mode palette derived from `--color-dark-card` / `--color-dark-card-alt`

### Layout Shell (`src/ui/`)
| File | Description |
|---|---|
| `Root.tsx` | App shell — `Sidebar` + `Navbar` + `<Outlet>` |
| `components/Sidebar.tsx` | Collapsible icon rail (56px) that expands to 208px on hover. 7 nav links, Settings + avatar at bottom. Uses `--color-hero` for logo/avatar accent. |
| `components/Navbar.tsx` | Top bar with centered search input, `Bot` (AI) + `Bell` (notifications w/ badge) icon buttons. `bg-card` to match sidebar. |

### Home Page Sections (`src/ui/pages/Home.tsx`)
| Component | Description |
|---|---|
| Greeting | Time-aware ("Good morning/afternoon/evening, Tal") with subtitle |
| `StorageCard` | Storage gauge — large GB number, progress bar using `--primary`, "Out of X GB total" caption |
| `MediaTypesCard` | Documents / Photos / Videos / Audio rows, each a full-width hover button with `bg-secondary` highlight |
| `CreateNewCard` | Dark panel (`--color-dark-card`) with drop hint, "Create New" heading, and 3 action rows (New Document ⌘D, New Folder ⌘F, Upload Files ⌘U) |
| `WorkspacesSection` | 2-column grid of workspace buttons — icon tile, name, file count, online dot indicator |
| `RecentActivity` | File list card with divider rows — icon, filename, smart timestamp (Today/Yesterday/relative), file size |
| `PhotoCollage` | Pinterest-style masonry grid using CSS `columns`. `columns-2 → sm:columns-3 → lg:columns-4`. Hover: zoom + dark overlay. Lazy loaded. |

### Key Design Decisions
- All cards use `bg-card` (white) on a `bg-background` (`#E8EAED`) page — inverted from the original flat design
- Cards styled without shadcn `Card` wrappers for tighter control — plain `div`/`button` with `rounded-2xl shadow-sm`
- Interactive cards are `<button>` elements with `active:scale-[0.98]` press feedback
- Responsive layout: `max-w-5xl mx-auto` container with `px-6` side padding
- Branches: `sidebar` → `navbar` → `dashbord` → `recentActivity` → `collage` → `summery`
