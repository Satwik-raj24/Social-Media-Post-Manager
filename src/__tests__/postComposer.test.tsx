import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PostComposer } from '../components/PostComposer';
import postsReducer from '../store/postsSlice';
import platformsReducer from '../store/platformsSlice';
import filterReducer from '../store/filterSlice';
import authReducer from '../store/authSlice';
import { UserRole } from '../types/auth';

// Helper to create a store with an authenticated Admin user
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

describe('PostComposer Component', () => {
  const defaultProps = {
    content: '',
    onContentChange: vi.fn(),
    selectedPlatforms: ['twitter' as const],
    onPlatformsChange: vi.fn(),
    mediaUrl: '',
    onMediaUrlChange: vi.fn(),
    scheduledAt: '',
    onScheduledAtChange: vi.fn(),
    onPublish: vi.fn(),
    onSaveDraft: vi.fn(),
    onSchedulePost: vi.fn(),
    onReset: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    const testStore = createTestStore();
    return render(
      <Provider store={testStore}>
        <PostComposer {...defaultProps} {...props} />
      </Provider>
    );
  };

  it('renders composer title and textarea placeholder for Admin role', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/What would you like to share today/i)).toBeInTheDocument();
  });

  it('displays character counter with Twitter limit of 280 chars', () => {
    renderComponent({ content: 'Hello World' });
    expect(screen.getByText('11 / 280 chars')).toBeInTheDocument();
  });

  it('detects and displays valid hashtags', () => {
    renderComponent({ content: 'Testing #college #project' });
    expect(screen.getByText('#college')).toBeInTheDocument();
    expect(screen.getByText('#project')).toBeInTheDocument();
  });

  it('triggers onContentChange when typing into textarea', () => {
    const onContentChange = vi.fn();
    renderComponent({ onContentChange });
    const textarea = screen.getByPlaceholderText(/What would you like to share today/i);
    fireEvent.change(textarea, { target: { value: 'New post content' } });
    expect(onContentChange).toHaveBeenCalledWith('New post content');
  });
});
