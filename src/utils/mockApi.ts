import { Post } from '../types/post';

const POSTS_KEY = 'smms_published_posts';
const DRAFTS_KEY = 'smms_draft_posts';
const SCHEDULED_KEY = 'smms_scheduled_posts';

const delay = (ms: number = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Synchronous LocalStorage helpers
const getStoredItems = (key: string): Post[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage:`, err);
    return [];
  }
};

const setStoredItems = (key: string, items: Post[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage:`, err);
  }
};

// Simulated Async API Service with LocalStorage persistence
export const fetchPostsApi = async (): Promise<Post[]> => {
  await delay(300);
  return getStoredItems(POSTS_KEY);
};

export const fetchDraftsApi = async (): Promise<Post[]> => {
  await delay(300);
  return getStoredItems(DRAFTS_KEY);
};

export const fetchScheduledApi = async (): Promise<Post[]> => {
  await delay(300);
  return getStoredItems(SCHEDULED_KEY);
};

export const saveDraftApi = async (
  draftData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<Post> => {
  await delay(400);
  const existingDrafts = getStoredItems(DRAFTS_KEY);
  const now = new Date().toISOString();

  let updatedDraft: Post;

  if (draftData.id) {
    const existingIndex = existingDrafts.findIndex((d) => d.id === draftData.id);
    if (existingIndex !== -1) {
      updatedDraft = {
        ...existingDrafts[existingIndex],
        ...draftData,
        id: draftData.id,
        updatedAt: now,
        status: 'draft',
      };
      existingDrafts[existingIndex] = updatedDraft;
    } else {
      updatedDraft = {
        id: draftData.id,
        content: draftData.content,
        platforms: draftData.platforms,
        mediaUrl: draftData.mediaUrl,
        createdAt: draftData.createdAt || now,
        updatedAt: now,
        status: 'draft',
        hashtags: draftData.hashtags,
      };
      existingDrafts.unshift(updatedDraft);
    }
  } else {
    updatedDraft = {
      id: Date.now().toString(),
      content: draftData.content,
      platforms: draftData.platforms,
      mediaUrl: draftData.mediaUrl,
      createdAt: draftData.createdAt || now,
      updatedAt: now,
      status: 'draft',
      hashtags: draftData.hashtags,
    };
    existingDrafts.unshift(updatedDraft);
  }

  setStoredItems(DRAFTS_KEY, existingDrafts);
  return updatedDraft;
};

export const schedulePostApi = async (
  postData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string; scheduledAt?: string }
): Promise<Post> => {
  await delay(450);
  const existingScheduled = getStoredItems(SCHEDULED_KEY);
  const now = new Date().toISOString();

  const scheduledPost: Post = {
    id: postData.id || Date.now().toString(),
    content: postData.content,
    platforms: postData.platforms,
    mediaUrl: postData.mediaUrl,
    createdAt: postData.createdAt || now,
    updatedAt: now,
    scheduledAt: postData.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
    status: 'scheduled',
    hashtags: postData.hashtags,
  };

  const existingIdx = existingScheduled.findIndex((s) => s.id === scheduledPost.id);
  if (existingIdx !== -1) {
    existingScheduled[existingIdx] = scheduledPost;
  } else {
    existingScheduled.unshift(scheduledPost);
  }

  setStoredItems(SCHEDULED_KEY, existingScheduled);

  if (postData.id) {
    const existingDrafts = getStoredItems(DRAFTS_KEY);
    setStoredItems(DRAFTS_KEY, existingDrafts.filter((d) => d.id !== postData.id));
  }

  return scheduledPost;
};

export const deleteDraftApi = async (id: string): Promise<boolean> => {
  await delay(350);
  const drafts = getStoredItems(DRAFTS_KEY);
  setStoredItems(DRAFTS_KEY, drafts.filter((d) => d.id !== id));

  const scheduled = getStoredItems(SCHEDULED_KEY);
  setStoredItems(SCHEDULED_KEY, scheduled.filter((s) => s.id !== id));

  return true;
};

export const deletePostApi = async (id: string): Promise<boolean> => {
  await delay(350);
  const posts = getStoredItems(POSTS_KEY);
  setStoredItems(POSTS_KEY, posts.filter((p) => p.id !== id));
  return true;
};

export const publishPostApi = async (
  postData: Omit<Post, 'status' | 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<Post> => {
  await delay(500);
  const now = new Date().toISOString();

  const newPublishedPost: Post = {
    id: postData.id || Date.now().toString(),
    content: postData.content,
    platforms: postData.platforms,
    mediaUrl: postData.mediaUrl,
    createdAt: postData.createdAt || now,
    updatedAt: now,
    status: 'published',
    hashtags: postData.hashtags,
  };

  const existingPosts = getStoredItems(POSTS_KEY);
  setStoredItems(POSTS_KEY, [newPublishedPost, ...existingPosts]);

  if (postData.id) {
    const existingDrafts = getStoredItems(DRAFTS_KEY);
    setStoredItems(DRAFTS_KEY, existingDrafts.filter((d) => d.id !== postData.id));

    const existingScheduled = getStoredItems(SCHEDULED_KEY);
    setStoredItems(SCHEDULED_KEY, existingScheduled.filter((s) => s.id !== postData.id));
  }

  return newPublishedPost;
};
