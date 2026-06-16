import type { User, Creator, Brand, Campaign, Application, FeedPost, Notification, ScoreAuditLog } from '../types/index';
import usersData from '../data/users.json';
import creatorsData from '../data/creators.json';
import brandsData from '../data/brands.json';
import campaignsData from '../data/campaigns.json';
import feedData from '../data/feed.json';

export interface VerificationToken {
  userId: string;
  expiresAt: string; // ISO 8601
}

export interface InMemoryStore {
  users: Map<string, User>;
  creators: Map<string, Creator>;
  brands: Map<string, Brand>;
  campaigns: Map<string, Campaign>;
  applications: Map<string, Application>;
  feedPosts: Map<string, FeedPost>;
  notifications: Map<string, Notification>;
  scoreAuditLogs: ScoreAuditLog[];
  verificationTokens: Map<string, VerificationToken>;
}

function createStore(): InMemoryStore {
  const store: InMemoryStore = {
    users: new Map(),
    creators: new Map(),
    brands: new Map(),
    campaigns: new Map(),
    applications: new Map(),
    feedPosts: new Map(),
    notifications: new Map(),
    scoreAuditLogs: [],
    verificationTokens: new Map(),
  };
  seedStore(store);
  return store;
}

function seedStore(store: InMemoryStore): void {
  store.users.clear();
  store.creators.clear();
  store.brands.clear();
  store.campaigns.clear();
  store.applications.clear();
  store.feedPosts.clear();
  store.notifications.clear();
  store.scoreAuditLogs = [];
  store.verificationTokens.clear();

  for (const u of usersData as User[]) store.users.set(u.id, { ...u });
  for (const c of creatorsData as Creator[]) store.creators.set(c.id, { ...c });
  for (const b of brandsData as Brand[]) store.brands.set(b.id, { ...b });
  for (const c of campaignsData as Campaign[]) store.campaigns.set(c.id, { ...c });
  for (const p of feedData as FeedPost[]) store.feedPosts.set(p.id, { ...p });
}

let _store: InMemoryStore | null = null;

export function getStore(): InMemoryStore {
  if (!_store) _store = createStore();
  return _store;
}

export function resetStore(): void {
  if (_store) {
    seedStore(_store);
  } else {
    _store = createStore();
  }
}
