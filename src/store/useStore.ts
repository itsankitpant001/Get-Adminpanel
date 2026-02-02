import { create } from 'zustand'

interface StoreState {
  doc: any[]
  apiJson: Record<string, any>
  loading: boolean
  error: string | null

  setDoc: (data: any[]) => void
  setApiJson: (data: Record<string, any>) => void
  updateApiJson: (key: string, value: any) => void
  resetApiJson: () => void
  resetDoc: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  doc: [],
  apiJson: {},
  loading: false,
  error: null,
}

export const useStore = create<StoreState>((set) => ({
  ...initialState,
  setDoc: (data) => set({ doc: data }),
  setApiJson: (data) => set({ apiJson: data }),
  updateApiJson: (key, value) =>
    set((state) => ({
      apiJson: { ...state.apiJson, [key]: value },
    })),
  resetApiJson: () => set({ apiJson: {} }),
  resetDoc: () => set({ doc: [] }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
