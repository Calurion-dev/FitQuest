import { create } from 'zustand'

interface UndoState {
  label: string | null
  apply: (() => void) | null
  offer: (label: string, apply: () => void) => void
  clear: () => void
  run: () => void
}

/** Annulation à 1 niveau, en mémoire (jamais persistée ni synchronisée). */
export const useUndo = create<UndoState>()((set, get) => ({
  label: null,
  apply: null,
  offer: (label, apply) => set({ label, apply }),
  clear: () => set({ label: null, apply: null }),
  run: () => {
    get().apply?.()
    set({ label: null, apply: null })
  }
}))
