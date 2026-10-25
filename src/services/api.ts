import { Snapshot, User, InstagramUser } from '../types';

const TOKEN_KEY = 'followlens_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string, instagramHandle?: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, instagramHandle }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register account');
    }
    setStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User } | null> {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        setStoredToken(null);
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  logout() {
    setStoredToken(null);
  },

  // Snapshots
  async getSnapshots(): Promise<Snapshot[]> {
    try {
      const res = await fetch('/api/snapshots', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.snapshots || [];
    } catch {
      return [];
    }
  },

  async saveSnapshot(snapshot: Partial<Snapshot>): Promise<Snapshot> {
    const res = await fetch('/api/snapshots', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(snapshot),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save snapshot');
    }
    return data.snapshot;
  },

  async deleteSnapshot(id: string): Promise<boolean> {
    const res = await fetch(`/api/snapshots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  },

  // Whitelist
  async getWhitelist(): Promise<Array<{ username: string; notes?: string; addedAt: number }>> {
    try {
      const res = await fetch('/api/whitelist', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.whitelist || [];
    } catch {
      return [];
    }
  },

  async toggleWhitelist(username: string, notes?: string): Promise<{ isWhitelisted: boolean; whitelist: any[] }> {
    const res = await fetch('/api/whitelist/toggle', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ username, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update whitelist');
    }
    return data;
  },
};
