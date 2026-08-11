import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DraftList } from '../components/DraftList';
import { saveDraftApi } from '../utils/mockApi';
import { Post } from '../types/post';
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

describe('Draft Management & Storage', () => {
  const sampleDraft: Post = {
    id: 'draft_999',
    content: 'Unfinished campus draft text #test',
    platforms: ['twitter', 'instagram'],
    createdAt: new Date().toISOString(),
    status: 'draft',
    hashtags: ['#test'],
  };

  it('renders saved drafts list properly', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <DraftList
          drafts={[sampleDraft]}
          onEditDraft={vi.fn()}
          onDeleteDraft={vi.fn()}
          onPublishDraft={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByText('Saved Drafts (1)')).toBeInTheDocument();
    expect(screen.getByText('Unfinished campus draft text #test')).toBeInTheDocument();
  });

  it('persists draft to storage via saveDraftApi', async () => {
    const saved = await saveDraftApi({
      content: 'Storage test draft',
      platforms: ['linkedin'],
    });

    expect(saved.id).toBeDefined();
    expect(saved.status).toBe('draft');
    expect(saved.content).toBe('Storage test draft');
  });

  it('triggers onEditDraft callback when Edit Draft button is clicked', () => {
    const store = createTestStore();
    const onEditDraft = vi.fn();
    render(
      <Provider store={store}>
        <DraftList
          drafts={[sampleDraft]}
          onEditDraft={onEditDraft}
          onDeleteDraft={vi.fn()}
          onPublishDraft={vi.fn()}
        />
      </Provider>
    );

    const editBtn = screen.getByText('Edit Draft');
    fireEvent.click(editBtn);
    expect(onEditDraft).toHaveBeenCalledWith(sampleDraft);
  });
});
