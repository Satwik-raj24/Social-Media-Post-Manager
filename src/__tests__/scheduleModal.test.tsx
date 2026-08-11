import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ScheduleModal } from '../components/ScheduleModal';
import postsReducer from '../store/postsSlice';
import platformsReducer from '../store/platformsSlice';
import filterReducer from '../store/filterSlice';
import authReducer from '../store/authSlice';
import { UserRole } from '../types/auth';

const createTestStore = () =>
  configureStore({
    reducer: {
      posts: postsReducer,
      platforms: platformsReducer,
      filter: filterReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { id: 'u_101', email: 'admin@gmail.com', name: 'Admin User', role: 'admin' as UserRole },
        token: 'mock.test.token',
        isAuthenticated: true,
        loading: false,
        error: null,
        usersList: [],
      },
    },
  });

describe('ScheduleModal Component', () => {
  it('does not render when isOpen is false', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ScheduleModal
          isOpen={false}
          dateIso="2026-08-15T09:00"
          onClose={vi.fn()}
          onSchedulePost={vi.fn()}
        />
      </Provider>
    );

    expect(screen.queryByText(/Schedule Post/i)).not.toBeInTheDocument();
  });

  it('renders schedule modal with formatted date when isOpen is true', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ScheduleModal
          isOpen={true}
          dateIso="2026-08-15T09:00"
          onClose={vi.fn()}
          onSchedulePost={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What would you like to schedule/i)).toBeInTheDocument();
  });

  it('calls onSchedulePost with entered form data when schedule button is clicked', async () => {
    const store = createTestStore();
    const onSchedulePost = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <Provider store={store}>
        <ScheduleModal
          isOpen={true}
          dateIso="2026-08-15T09:00"
          onClose={onClose}
          onSchedulePost={onSchedulePost}
        />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText(/What would you like to schedule/i);
    fireEvent.change(textarea, { target: { value: 'Exciting announcement #update' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Post|Schedule Post/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSchedulePost).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Exciting announcement #update',
          platforms: ['twitter'],
        })
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
