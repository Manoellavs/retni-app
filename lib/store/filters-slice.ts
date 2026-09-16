import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { TransactionType } from '@/lib/types'

export interface FiltersState {
  search: string
  type: TransactionType | 'todos'
  page: number
  pageSize: number
}

const initialState: FiltersState = {
  search: '',
  type: 'todos',
  page: 1,
  pageSize: 8,
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 1
    },
    setTypeFilter(state, action: PayloadAction<TransactionType | 'todos'>) {
      state.type = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setSearch, setTypeFilter, setPage, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer
