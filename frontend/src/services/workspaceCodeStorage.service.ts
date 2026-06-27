import {
  DEFAULT_WORKSPACE_CODE_STATE,
  type LegacyWorkspaceCodeState,
  type WorkspaceCodeState,
} from '@/types/workspaceCode.type';
import { normalizeWorkspaceCodeState } from '@/utils/workspaceCodeTree';

const STORAGE_PREFIX = 'homedrive:workspace-code:';

function storageKey(workspaceId: string): string {
  return `${STORAGE_PREFIX}${workspaceId}`;
}

export function loadWorkspaceCodeState(workspaceId: string): WorkspaceCodeState {
  try {
    const raw = localStorage.getItem(storageKey(workspaceId));
    if (!raw) {
      return normalizeWorkspaceCodeState(DEFAULT_WORKSPACE_CODE_STATE);
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'string') {
        return normalizeWorkspaceCodeState({ content: parsed });
      }

      if (parsed && typeof parsed === 'object') {
        return normalizeWorkspaceCodeState(parsed as Partial<WorkspaceCodeState & LegacyWorkspaceCodeState>);
      }
    } catch {
      return normalizeWorkspaceCodeState({ content: raw });
    }

    return normalizeWorkspaceCodeState(DEFAULT_WORKSPACE_CODE_STATE);
  } catch {
    return normalizeWorkspaceCodeState(DEFAULT_WORKSPACE_CODE_STATE);
  }
}

export function saveWorkspaceCodeState(workspaceId: string, state: WorkspaceCodeState): void {
  try {
    localStorage.setItem(storageKey(workspaceId), JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode errors.
  }
}
