import { ACTIONS } from '@/consts/consts';
import { Plus } from 'lucide-react';



export function CreateNewCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl p-5 text-white" style={{ backgroundColor: 'var(--color-dark-card)' }}>
      {/* Top: drop hint + heading */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button className="flex size-7 items-center justify-center rounded-full hover:opacity-80" style={{ backgroundColor: 'var(--color-dark-card-alt)' }}>
            <Plus className="size-4" />
          </button>
          Drop anywhere to upload
        </div>
        <div>
          <h2 className="text-2xl font-bold">Create New</h2>
          <p className="mt-0.5 text-sm text-slate-400">Start something or upload files to your drive</p>
        </div>
      </div>

      {/* Bottom: action rows */}
      <div className="flex flex-col gap-2">
        {ACTIONS.map(({ label, icon: Icon, shortcut }) => (
          <button
            key={label}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:opacity-80" style={{ backgroundColor: 'var(--color-dark-card-alt)' }}
          >
            <Icon className="size-4 shrink-0 text-slate-400" />
            <span className="flex-1 text-left">{label}</span>
            <span className="text-xs text-slate-500">{shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
