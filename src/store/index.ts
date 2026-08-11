import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import postsReducer from './postsSlice';
import platformsReducer from './platformsSlice';
import filterReducer from './filterSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    filter: filterReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks with correct Redux types
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
