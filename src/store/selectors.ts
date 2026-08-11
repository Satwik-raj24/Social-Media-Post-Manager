import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Platform } from '../types/post';

// Basic Input Selectors
export const selectPosts = (state: RootState) => state.posts.posts;
export const selectDrafts = (state: RootState) => state.posts.drafts;
export const selectScheduledPosts = (state: RootState) => state.posts.scheduled;
export const selectSearchQuery = (state: RootState) => state.filter.searchQuery;
export const selectPlatformFilter = (state: RootState) => state.filter.platformFilter;

// Memoized Selector: Filtered Published Posts
export const selectFilteredPosts = createSelector(
  [selectPosts, selectSearchQuery, selectPlatformFilter],
  (posts, searchQuery, platformFilter) => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesPlatform =
        platformFilter === 'all' || post.platforms.includes(platformFilter);

      if (!matchesPlatform) return false;
      if (!query) return true;

      const matchesContent = post.content.toLowerCase().includes(query);
      const matchesHashtag = post.hashtags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return matchesContent || matchesHashtag;
    });
  }
);

// Memoized Selector: Filtered Draft Posts
export const selectFilteredDrafts = createSelector(
  [selectDrafts, selectSearchQuery, selectPlatformFilter],
  (drafts, searchQuery, platformFilter) => {
    const query = searchQuery.trim().toLowerCase();

    return drafts.filter((draft) => {
      const matchesPlatform =
        platformFilter === 'all' || draft.platforms.includes(platformFilter);

      if (!matchesPlatform) return false;
      if (!query) return true;

      const matchesContent = draft.content.toLowerCase().includes(query);
      const matchesHashtag = draft.hashtags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return matchesContent || matchesHashtag;
    });
  }
);

// Memoized Selector: Filtered Scheduled Posts
export const selectFilteredScheduledPosts = createSelector(
  [selectScheduledPosts, selectSearchQuery, selectPlatformFilter],
  (scheduled, searchQuery, platformFilter) => {
    const query = searchQuery.trim().toLowerCase();

    return scheduled.filter((post) => {
      const matchesPlatform =
        platformFilter === 'all' || post.platforms.includes(platformFilter);

      if (!matchesPlatform) return false;
      if (!query) return true;

      const matchesContent = post.content.toLowerCase().includes(query);
      const matchesHashtag = post.hashtags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      return matchesContent || matchesHashtag;
    });
  }
);

// Memoized Selector: Post Analytics Statistics & Platform Distribution
export const selectPostStats = createSelector(
  [selectPosts, selectDrafts, selectScheduledPosts],
  (posts, drafts, scheduled) => {
    const totalPublished = posts.length;
    const totalDrafts = drafts.length;
    const totalScheduled = scheduled.length;

    // Derived unique hashtag set
    const allHashtags = new Set<string>();
    [...posts, ...drafts, ...scheduled].forEach((item) => {
      item.hashtags?.forEach((tag) => allHashtags.add(tag.toLowerCase()));
    });

    // Derived platform breakdown counts
    const platformCounts: Record<Platform, number> = {
      twitter: 0,
      facebook: 0,
      linkedin: 0,
      instagram: 0,
    };

    [...posts, ...scheduled].forEach((post) => {
      post.platforms.forEach((platform) => {
        if (platformCounts[platform] !== undefined) {
          platformCounts[platform] += 1;
        }
      });
    });

    // Find top platform
    let topPlatform: string = 'None';
    let maxCount = 0;
    (Object.keys(platformCounts) as Platform[]).forEach((platform) => {
      if (platformCounts[platform] > maxCount) {
        maxCount = platformCounts[platform];
        topPlatform = platform;
      }
    });

    return {
      totalPublished,
      totalDrafts,
      totalScheduled,
      totalHashtags: allHashtags.size,
      platformCounts,
      topPlatform: maxCount > 0 ? topPlatform : 'None',
    };
  }
);
