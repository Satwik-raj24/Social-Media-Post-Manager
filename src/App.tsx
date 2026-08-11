import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { FilterBar } from './components/FilterBar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CalendarView } from './components/CalendarView';
import { UserManagement } from './components/UserManagement';
import { PostComposer } from './components/PostComposer';
import { PostPreview } from './components/PostPreview';
import { DraftList } from './components/DraftList';
import { PostList } from './components/PostList';
import { ScheduleModal } from './components/ScheduleModal';
import { Post, Platform } from './types/post';
import { useAppDispatch, useAppSelector } from './store';
import {
  fetchPostsThunk,
  fetchDraftsThunk,
  fetchScheduledThunk,
  saveDraftThunk,
  schedulePostThunk,
  publishPostThunk,
  deleteDraftThunk,
  deletePostThunk,
  setEditingDraftId,
  clearEditingDraftId,
  clearToast,
} from './store/postsSlice';
import { setSelectedPlatforms } from './store/platformsSlice';
import {
  selectFilteredPosts,
  selectFilteredDrafts,
  selectFilteredScheduledPosts,
  selectPostStats,
} from './store/selectors';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  // Authentication State
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Memoized Selectors derived via createSelector
  const filteredPosts = useAppSelector(selectFilteredPosts);
  const filteredDrafts = useAppSelector(selectFilteredDrafts);
  const filteredScheduled = useAppSelector(selectFilteredScheduledPosts);
  const stats = useAppSelector(selectPostStats);

  // Redux State
  const editingDraftId = useAppSelector((state) => state.posts.editingDraftId);
  const isSaving = useAppSelector((state) => state.posts.loading);
  const toast = useAppSelector((state) => state.posts.toast);
  const selectedPlatforms = useAppSelector((state) => state.platforms.selectedPlatforms);

  // Local Form Input State
  const [content, setContent] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [scheduleModalDate, setScheduleModalDate] = useState<string | null>(null);

  // Fetch initial posts, drafts, and scheduled posts into Redux store on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPostsThunk());
      dispatch(fetchDraftsThunk());
      dispatch(fetchScheduledThunk());
    }
  }, [isAuthenticated, dispatch]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  // Memoized Callback Handlers
  const resetForm = useCallback(() => {
    setContent('');
    dispatch(setSelectedPlatforms(['twitter']));
    setMediaUrl('');
    setScheduledAt('');
    dispatch(clearEditingDraftId());
  }, [dispatch]);

  const handleSaveDraft = useCallback(async () => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    await dispatch(
      saveDraftThunk({
        id: editingDraftId || undefined,
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl.trim() || undefined,
        hashtags,
      })
    );
    resetForm();
  }, [content, editingDraftId, selectedPlatforms, mediaUrl, dispatch, resetForm]);

  const handleSchedulePost = useCallback(async () => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    const formattedScheduledAt = new Date(scheduledAt).toISOString();
    await dispatch(
      schedulePostThunk({
        id: editingDraftId || undefined,
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl.trim() || undefined,
        scheduledAt: formattedScheduledAt,
        hashtags,
      })
    );
    resetForm();
  }, [content, editingDraftId, selectedPlatforms, mediaUrl, scheduledAt, dispatch, resetForm]);

  const handlePublish = useCallback(async () => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    await dispatch(
      publishPostThunk({
        id: editingDraftId || undefined,
        content: content.trim(),
        platforms: selectedPlatforms,
        mediaUrl: mediaUrl.trim() || undefined,
        hashtags,
      })
    );
    resetForm();
  }, [content, editingDraftId, selectedPlatforms, mediaUrl, dispatch, resetForm]);

  const handleEditDraft = useCallback(
    (draft: Post) => {
      dispatch(setEditingDraftId(draft.id));
      setContent(draft.content);
      dispatch(setSelectedPlatforms(draft.platforms));
      setMediaUrl(draft.mediaUrl || '');

      if (draft.scheduledAt) {
        const d = new Date(draft.scheduledAt);
        const pad = (num: number) => String(num).padStart(2, '0');
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setScheduledAt(localIso);
      } else {
        setScheduledAt('');
      }

      const composerElem = document.getElementById('post-composer-section');
      if (composerElem) {
        composerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [dispatch]
  );

  const handleDeleteDraft = useCallback(
    (id: string) => {
      dispatch(deleteDraftThunk(id));
      if (editingDraftId === id) {
        resetForm();
      }
    },
    [dispatch, editingDraftId, resetForm]
  );

  const handleDeletePost = useCallback(
    (id: string) => {
      dispatch(deletePostThunk(id));
    },
    [dispatch]
  );

  const handlePublishDraft = useCallback(
    (draft: Post) => {
      dispatch(publishPostThunk(draft));
      if (editingDraftId === draft.id) {
        resetForm();
      }
    },
    [dispatch, editingDraftId, resetForm]
  );

  const handlePlatformsChange = useCallback(
    (platforms: Platform[]) => {
      dispatch(setSelectedPlatforms(platforms));
    },
    [dispatch]
  );

  const handleSelectCalendarDate = useCallback((dateIso: string) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (new Date(dateIso).getTime() < startOfToday) {
      return;
    }
    setScheduledAt(dateIso);
    setScheduleModalDate(dateIso);
    
    // Also scroll smooth to post composer section
    const composerElem = document.getElementById('post-composer-section');
    if (composerElem) {
      composerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleModalSchedulePost = useCallback(
    async (data: { content: string; platforms: Platform[]; mediaUrl?: string; scheduledAt: string }) => {
      const hashtags = data.content.match(/#[a-zA-Z0-9_]+/g) || [];
      await dispatch(
        schedulePostThunk({
          content: data.content,
          platforms: data.platforms,
          mediaUrl: data.mediaUrl,
          scheduledAt: data.scheduledAt,
          hashtags,
        })
      );
      resetForm();
    },
    [dispatch, resetForm]
  );

  const handleModalSaveDraft = useCallback(
    async (data: { content: string; platforms: Platform[]; mediaUrl?: string }) => {
      const hashtags = data.content.match(/#[a-zA-Z0-9_]+/g) || [];
      await dispatch(
        saveDraftThunk({
          content: data.content,
          platforms: data.platforms,
          mediaUrl: data.mediaUrl,
          hashtags,
        })
      );
      resetForm();
    },
    [dispatch, resetForm]
  );

  // If user is not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }

  // Protected Main Application Workspace
  return (
    <div className="app-container">
      <Header />

      {toast && (
        <div className={`toast-banner ${toast.type}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="btn-link"
            onClick={() => dispatch(clearToast())}
            style={{ textDecoration: 'none', marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
      )}

      <main>
        {/* Admin User Management Control Panel (Visible strictly to Admin role) */}
        <UserManagement />

        {/* Derived Analytics Dashboard */}
        <AnalyticsDashboard stats={stats} />

        {/* Search & Filter Control Bar */}
        <FilterBar />

        {/* Interactive Month Scheduling Calendar */}
        <CalendarView
          scheduledPosts={filteredScheduled}
          onSelectEvent={handleEditDraft}
          onSelectDate={handleSelectCalendarDate}
          selectedDateIso={scheduledAt}
        />

        {/* Post Composition & Live Social Preview */}
        <div className="workspace-grid">
          <PostComposer
            content={content}
            onContentChange={setContent}
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={handlePlatformsChange}
            mediaUrl={mediaUrl}
            onMediaUrlChange={setMediaUrl}
            scheduledAt={scheduledAt}
            onScheduledAtChange={setScheduledAt}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
            onSchedulePost={handleSchedulePost}
            onReset={resetForm}
            editingDraftId={editingDraftId}
            onCancelEdit={resetForm}
            isSaving={isSaving}
          />

          <PostPreview
            content={content}
            selectedPlatforms={selectedPlatforms}
            mediaUrl={mediaUrl}
          />
        </div>

        {/* Quick Schedule Modal triggered when clicking any date on the calendar */}
        <ScheduleModal
          isOpen={Boolean(scheduleModalDate)}
          dateIso={scheduleModalDate || ''}
          onClose={() => setScheduleModalDate(null)}
          onSchedulePost={handleModalSchedulePost}
          onSaveDraft={handleModalSaveDraft}
        />

        {/* Filtered Saved Drafts */}
        <DraftList
          drafts={filteredDrafts}
          onEditDraft={handleEditDraft}
          onDeleteDraft={handleDeleteDraft}
          onPublishDraft={handlePublishDraft}
          activeEditingId={editingDraftId}
          isLoading={isSaving}
        />

        {/* Filtered Published Posts Feed */}
        <PostList posts={filteredPosts} onDeletePost={handleDeletePost} />
      </main>
    </div>
  );
};

export default App;
