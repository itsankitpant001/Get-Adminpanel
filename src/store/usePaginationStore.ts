import { create, StateCreator } from 'zustand'

interface PaginationState {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setTotalItems: (total: number) => void
  setPagination: (data: { page?: number; limit?: number; totalItems?: number }) => void
  nextPage: () => void
  prevPage: () => void
  reset: () => void
}

const createPaginationSlice = (defaultLimit = 10): StateCreator<PaginationState> => (set, get) => ({
  page: 1,
  limit: defaultLimit,
  totalItems: 0,
  totalPages: 0,
  setPage: (page) => set({ page }),
  setLimit: (limit) => {
    const { totalItems } = get()
    set({ limit, page: 1, totalPages: Math.ceil(totalItems / limit) })
  },
  setTotalItems: (totalItems) => {
    const { limit } = get()
    set({ totalItems, totalPages: Math.ceil(totalItems / limit) })
  },
  setPagination: (data) => {
    const state = get()
    const newLimit = data.limit ?? state.limit
    const newTotal = data.totalItems ?? state.totalItems
    set({
      page: data.page ?? state.page,
      limit: newLimit,
      totalItems: newTotal,
      totalPages: Math.ceil(newTotal / newLimit),
    })
  },
  nextPage: () => {
    const { page, totalPages } = get()
    if (page < totalPages) set({ page: page + 1 })
  },
  prevPage: () => {
    const { page } = get()
    if (page > 1) set({ page: page - 1 })
  },
  reset: () => set({ page: 1, totalItems: 0, totalPages: 0 }),
})

/**
 * Factory function to create independent pagination stores.
 * Each call returns a new store instance so different pages/features
 * don't share state.
 *
 * Usage:
 *   const useVisitorPagination = createPaginationStore(10)
 *   const useProductPagination = createPaginationStore(20)
 */
export const createPaginationStore = (defaultLimit = 10) =>
  create<PaginationState>(createPaginationSlice(defaultLimit))

// Pre-built store for visitor analytics (10 per page)
export const useVisitorPagination = createPaginationStore(10)
