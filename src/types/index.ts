export interface InstagramUser {
  username: string;
  name?: string;
  profileUrl: string;
  timestamp: number; // Unix timestamp in milliseconds
  isWhitelisted?: boolean;
  notes?: string;
}

export interface SnapshotStats {
  totalFollowers: number;
  totalFollowing: number;
  mutualFollowers: number;
  notFollowingBack: number; // You follow, they don't
  fans: number;             // They follow, you don't
  ratio: number;
}

export interface Snapshot {
  id: string;
  userId?: string;
  label: string;
  timestamp: number;
  followers: InstagramUser[];
  following: InstagramUser[];
  stats: SnapshotStats;
}

export interface ComparisonResult {
  previousSnapshotId: string;
  previousLabel: string;
  previousDate: number;
  currentSnapshotId: string;
  currentLabel: string;
  currentDate: number;
  lostFollowers: InstagramUser[];   // Unfollowers
  newFollowers: InstagramUser[];    // Recently joined
  unfollowedByYou: InstagramUser[]; // Accounts you stopped following
  newFollowing: InstagramUser[];    // Accounts you newly followed
  netChange: number;
}

export interface GrowthDataPoint {
  date: string;
  timestamp: number;
  followers: number;
  following: number;
  gained: number;
  lost: number;
  net: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  instagramHandle?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type ActiveTab =
  | 'overview'
  | 'not-following-back'
  | 'fans'
  | 'mutual'
  | 'lost-followers'
  | 'new-followers'
  | 'all-following'
  | 'all-followers'
  | 'whitelist'
  | 'compare'
  | 'export-guide';
