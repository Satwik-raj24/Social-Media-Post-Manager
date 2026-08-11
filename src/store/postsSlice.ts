import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '../types/post';
import {
  fetchPostsApi,
  fetchDraftsApi,
  fetchScheduledApi,
  saveDraftApi,
  schedulePostApi,
  deleteDraftApi,
  deletePostApi,
  publishPostApi,
} from '../utils/mockApi';

interface ToastNotification {
  message: string;
  type: 'success' | 'info';
}

interface PostsState {
  posts: Post[];
  drafts: Post[];
  scheduled: Post[];
  editingDraftId: string | null;
  loading: boolean;
  toast: ToastNotification | null;
}

const initialState: PostsState = {
  posts: [],
  drafts: [],
  scheduled: [],
  editingDraftId: null,
  loading: false,
  toast: null,
};

// Async Thunks
export const fetchPostsThunk = createAsyncThunk('posts/fetchPosts', async () => {
  return await fetchPostsApi();
});

export const fetchDraftsThunk = createAsyncThunk('posts/fetchDrafts', async () => {
  return await fetchDraftsApi();
});

export const fetchScheduledThunk = createAsyncThunk('posts/fetchScheduled', async () => {
  return await fetchScheduledApi();
});

export const saveDraftThunk = createAsyncThunk(
  'posts/saveDraft',
  async (draftData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => {
    return await saveDraftApi(draftData);
  }
);

export const schedulePostThunk = createAsyncThunk(
  'posts/schedulePost',
  async (postData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string; scheduledAt?: string }) => {
    return await schedulePostApi(postData);
  }
);

export const publishPostThunk = createAsyncThunk(
  'posts/publishPost',
  async (postData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => {
    return await publishPostApi(postData);
  }
);

export const deleteDraftThunk = createAsyncThunk('posts/deleteDraft', async (id: string) => {
  await deleteDraftApi(id);
  return id;
});

export const deletePostThunk = createAsyncThunk('posts/deletePost', async (id: string) => {
  await deletePostApi(id);
  return id;
});

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setEditingDraftId: (state, action: PayloadAction<string | null>) => {
      state.editingDraftId = action.payload;
    },
    clearEditingDraftId: (state) => {
      state.editingDraftId = null;
    },
    setToast: (state, action: PayloadAction<ToastNotification | null>) => {
      state.toast = action.payload;
    },
    clearToast: (state) => {
      state.toast = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchDraftsThunk.fulfilled, (state, action) => {
        state.drafts = action.payload;
      })
      .addCase(fetchScheduledThunk.fulfilled, (state, action) => {
        state.scheduled = action.payload;
      })
      .addCase(saveDraftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveDraftThunk.fulfilled, (state, action) => {
        state.loading = false;
        const savedDraft = action.payload;
        const index = state.drafts.findIndex((d) => d.id === savedDraft.id);
        if (index !== -1) {
          state.drafts[index] = savedDraft;
        } else {
          state.drafts.unshift(savedDraft);
        }
        state.editingDraftId = null;
        state.toast = {
          message: 'Draft saved successfully into Redux state!',
          type: 'success',
        };
      })
      .addCase(schedulePostThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(schedulePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        const scheduledPost = action.payload;
        const index = state.scheduled.findIndex((s) => s.id === scheduledPost.id);
        if (index !== -1) {
          state.scheduled[index] = scheduledPost;
        } else {
          state.scheduled.unshift(scheduledPost);
        }
        state.drafts = state.drafts.filter((d) => d.id !== scheduledPost.id);
        state.editingDraftId = null;
        state.toast = {
          message: `Post scheduled successfully for ${new Date(scheduledPost.scheduledAt!).toLocaleString()}!`,
          type: 'success',
        };
      })
      .addCase(publishPostThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(publishPostThunk.fulfilled, (state, action) => {
        state.loading = false;
        const publishedPost = action.payload;
        state.posts.unshift(publishedPost);
        state.drafts = state.drafts.filter((d) => d.id !== publishedPost.id);
        state.scheduled = state.scheduled.filter((s) => s.id !== publishedPost.id);
        state.editingDraftId = null;
        state.toast = {
          message: 'Post published successfully!',
          type: 'success',
        };
      })
      .addCase(deleteDraftThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDraftThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.drafts = state.drafts.filter((d) => d.id !== deletedId);
        state.scheduled = state.scheduled.filter((s) => s.id !== deletedId);
        if (state.editingDraftId === deletedId) {
          state.editingDraftId = null;
        }
        state.toast = {
          message: 'Post/Draft removed.',
          type: 'info',
        };
      })
      .addCase(deletePostThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.posts = state.posts.filter((p) => p.id !== deletedId);
        state.toast = {
          message: 'Published post deleted cleanly by Admin.',
          type: 'info',
        };
      });
  },
});

export const { setEditingDraftId, clearEditingDraftId, setToast, clearToast } = postsSlice.actions;
export default postsSlice.reducer;
