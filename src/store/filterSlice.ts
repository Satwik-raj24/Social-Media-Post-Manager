import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from '../types/post';

interface FilterState {
  searchQuery: string;
  platformFilter: Platform | 'all';
}

const initialState: FilterState = {
  searchQuery: '',
  platformFilter: 'all',
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPlatformFilter: (state, action: PayloadAction<Platform | 'all'>) => {
      state.platformFilter = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.platformFilter = 'all';
    },
  },
});

export const { setSearchQuery, setPlatformFilter, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
