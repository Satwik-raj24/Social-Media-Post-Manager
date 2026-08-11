import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from '../types/post';

interface PlatformsState {
  selectedPlatforms: Platform[];
  availablePlatforms: Platform[];
}

const initialState: PlatformsState = {
  selectedPlatforms: ['twitter'],
  availablePlatforms: ['twitter', 'facebook', 'linkedin', 'instagram'],
};

export const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    setSelectedPlatforms: (state, action: PayloadAction<Platform[]>) => {
      state.selectedPlatforms = action.payload;
    },
    togglePlatform: (state, action: PayloadAction<Platform>) => {
      const platform = action.payload;
      if (state.selectedPlatforms.includes(platform)) {
        state.selectedPlatforms = state.selectedPlatforms.filter((p) => p !== platform);
      } else {
        state.selectedPlatforms.push(platform);
      }
    },
    resetPlatforms: (state) => {
      state.selectedPlatforms = ['twitter'];
    },
  },
});

export const { setSelectedPlatforms, togglePlatform, resetPlatforms } = platformsSlice.actions;
export default platformsSlice.reducer;
