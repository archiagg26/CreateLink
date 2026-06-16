import type { FeedPost, FeedFilters } from '../types/index';
import { getStore } from './store';
import { generateId, nowISO, simulateLatency } from './mockUtils';
import { createNotification } from './notificationService';

export async function loadFeed(filters?: Partial<FeedFilters>): Promise<FeedPost[]> {
  await simulateLatency(200, 600);
  const store = getStore();
  let posts = Array.from(store.feedPosts.values()).filter((p) => !p.removed);

  if (filters?.category) posts = posts.filter((p) => p.category === filters.category);
  if (filters?.deadlineBefore) {
    const deadline = new Date(filters.deadlineBefore);
    posts = posts.filter((p) => {
      if (p.campaignId) {
        const campaign = store.campaigns.get(p.campaignId);
        return campaign ? new Date(campaign.deadline) <= deadline : true;
      }
      return true;
    });
  }
  if (filters?.compensationType) {
    posts = posts.filter((p) => {
      if (p.campaignId) {
        const campaign = store.campaigns.get(p.campaignId);
        return campaign?.compensationType === filters.compensationType;
      }
      return false;
    });
  }

  // Sort by collaborationMatchScore descending, tiebreak by publishedAt descending
  return posts.sort((a, b) => {
    const scoreDiff = (b.collaborationMatchScore ?? 0) - (a.collaborationMatchScore ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export async function publishPost(
  post: Omit<FeedPost, 'id' | 'publishedAt' | 'removed'>
): Promise<FeedPost> {
  await simulateLatency(200, 500);
  const store = getStore();
  const newPost: FeedPost = {
    ...post,
    id: generateId(),
    publishedAt: nowISO(),
    removed: false,
  };
  store.feedPosts.set(newPost.id, newPost);
  return newPost;
}

export function removePost(postId: string, reason?: string): void {
  const store = getStore();
  const post = store.feedPosts.get(postId);
  if (!post) return;
  store.feedPosts.set(postId, { ...post, removed: true });
  // Notify the post author
  const notifBody = reason ?? 'Your post was removed for violating community guidelines.';
  createNotification(post.authorId, 'post_removed', 'Post Removed', notifBody);
}
