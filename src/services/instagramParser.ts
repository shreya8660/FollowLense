import JSZip from 'jszip';
import { InstagramUser, SnapshotStats } from '../types';

export interface ParseResult {
  followers: InstagramUser[];
  following: InstagramUser[];
  stats: SnapshotStats;
  sourceType: 'json' | 'html' | 'zip';
  summary: {
    followerCount: number;
    followingCount: number;
    filesFound: string[];
  };
}

/**
 * Extracts username, link, and timestamp from raw Instagram JSON entry
 */
function extractUserFromJsonItem(item: any): InstagramUser | null {
  if (!item) return null;

  // Modern Instagram export schema: string_list_data array
  if (Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
    const data = item.string_list_data[0];
    const username = (data.value || item.title || '').trim().toLowerCase();
    if (!username) return null;

    let timestamp = Date.now();
    if (data.timestamp) {
      // Instagram timestamps are usually seconds, convert to milliseconds if needed
      timestamp = data.timestamp > 1e11 ? data.timestamp : data.timestamp * 1000;
    }

    return {
      username,
      name: item.title && item.title !== username ? item.title : undefined,
      profileUrl: data.href || `https://www.instagram.com/${username}`,
      timestamp,
    };
  }

  // Direct username property
  if (typeof item === 'string') {
    const clean = item.trim().toLowerCase().replace(/^@/, '');
    return clean ? { username: clean, profileUrl: `https://www.instagram.com/${clean}`, timestamp: Date.now() } : null;
  }

  if (item.username) {
    const username = item.username.trim().toLowerCase().replace(/^@/, '');
    const ts = item.timestamp ? (item.timestamp > 1e11 ? item.timestamp : item.timestamp * 1000) : Date.now();
    return {
      username,
      name: item.name || item.full_name,
      profileUrl: item.href || `https://www.instagram.com/${username}`,
      timestamp: ts,
    };
  }

  // Title fallback
  if (item.title && typeof item.title === 'string' && !item.title.includes(' ')) {
    const username = item.title.trim().toLowerCase().replace(/^@/, '');
    return {
      username,
      profileUrl: `https://www.instagram.com/${username}`,
      timestamp: Date.now(),
    };
  }

  return null;
}

/**
 * Parse raw Instagram followers/following JSON content
 */
export function parseInstagramJson(jsonString: string): InstagramUser[] {
  const users: InstagramUser[] = [];
  const seen = new Set<string>();

  try {
    const data = JSON.parse(jsonString);

    let rawList: any[] = [];

    if (Array.isArray(data)) {
      rawList = data;
    } else if (data.relationships_following && Array.isArray(data.relationships_following)) {
      rawList = data.relationships_following;
    } else if (data.relationships_followers && Array.isArray(data.relationships_followers)) {
      rawList = data.relationships_followers;
    } else if (data.followers && Array.isArray(data.followers)) {
      rawList = data.followers;
    } else if (data.following && Array.isArray(data.following)) {
      rawList = data.following;
    } else if (data.string_list_data && Array.isArray(data.string_list_data)) {
      rawList = [{ string_list_data: data.string_list_data }];
    } else {
      // Find any property that is an array
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          rawList = data[key];
          break;
        }
      }
    }

    for (const item of rawList) {
      const parsed = extractUserFromJsonItem(item);
      if (parsed && !seen.has(parsed.username)) {
        seen.add(parsed.username);
        users.push(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to parse Instagram JSON:', err);
    throw new Error('Invalid JSON format. Please verify you selected a valid Instagram export file.');
  }

  return users;
}

/**
 * Parse Instagram HTML export file
 */
export function parseInstagramHtml(htmlString: string): InstagramUser[] {
  const users: InstagramUser[] = [];
  const seen = new Set<string>();

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Instagram HTML exports contain <a> tags pointing to instagram.com/_username_
    const links = Array.from(doc.querySelectorAll('a[href*="instagram.com/"]'));

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').trim();

      // Extract username from URL: https://www.instagram.com/username or text
      const match = href.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      let username = match ? match[1] : text.replace(/^@/, '');
      username = username.trim().toLowerCase();

      // Ignore standard IG internal paths
      if (!username || ['help', 'about', 'legal', 'privacy', 'explore', 'direct'].includes(username)) {
        return;
      }

      if (!seen.has(username)) {
        seen.add(username);

        // Try to get timestamp from adjacent elements if available
        let timestamp = Date.now();
        const parent = link.closest('div');
        if (parent) {
          const dateEl = parent.querySelector('div, span, time');
          if (dateEl && dateEl.textContent) {
            const parsedTime = Date.parse(dateEl.textContent);
            if (!isNaN(parsedTime)) {
              timestamp = parsedTime;
            }
          }
        }

        users.push({
          username,
          profileUrl: `https://www.instagram.com/${username}`,
          timestamp,
        });
      }
    });
  } catch (err) {
    console.error('Failed to parse Instagram HTML:', err);
    throw new Error('Failed to parse HTML export. Please check the file formatting.');
  }

  return users;
}

/**
 * Calculate snapshot stats between followers and following arrays
 */
export function calculateSnapshotStats(followers: InstagramUser[], following: InstagramUser[]): SnapshotStats {
  const followersSet = new Set(followers.map((u) => u.username.toLowerCase()));
  const followingSet = new Set(following.map((u) => u.username.toLowerCase()));

  let mutualCount = 0;
  let notFollowingBackCount = 0; // You follow them, they don't follow back
  let fansCount = 0;             // They follow you, you don't follow them back

  for (const user of following) {
    if (followersSet.has(user.username.toLowerCase())) {
      mutualCount++;
    } else {
      notFollowingBackCount++;
    }
  }

  for (const user of followers) {
    if (!followingSet.has(user.username.toLowerCase())) {
      fansCount++;
    }
  }

  const ratio = following.length > 0 ? parseFloat((followers.length / following.length).toFixed(2)) : 0;

  return {
    totalFollowers: followers.length,
    totalFollowing: following.length,
    mutualFollowers: mutualCount,
    notFollowingBack: notFollowingBackCount,
    fans: fansCount,
    ratio,
  };
}

/**
 * Parses an entire Instagram export ZIP file or extracted files
 */
export async function parseInstagramZip(file: File): Promise<ParseResult> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  let followersData: InstagramUser[] = [];
  let followingData: InstagramUser[] = [];
  const filesFound: string[] = [];

  // Search for followers and following files in the zip
  for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
    if (zipEntry.dir) continue;

    const lowerPath = relativePath.toLowerCase();

    // Check for followers file
    if (
      (lowerPath.includes('followers_') || lowerPath.endsWith('followers.json') || lowerPath.endsWith('followers.html')) &&
      !lowerPath.includes('pending') &&
      !lowerPath.includes('close_friends')
    ) {
      filesFound.push(relativePath);
      const text = await zipEntry.async('string');
      if (lowerPath.endsWith('.json')) {
        followersData = followersData.concat(parseInstagramJson(text));
      } else if (lowerPath.endsWith('.html') || lowerPath.endsWith('.htm')) {
        followersData = followersData.concat(parseInstagramHtml(text));
      }
    }

    // Check for following file
    if (
      (lowerPath.includes('following_') || lowerPath.endsWith('following.json') || lowerPath.endsWith('following.html')) &&
      !lowerPath.includes('recent_follow_requests') &&
      !lowerPath.includes('pending')
    ) {
      filesFound.push(relativePath);
      const text = await zipEntry.async('string');
      if (lowerPath.endsWith('.json')) {
        followingData = followingData.concat(parseInstagramJson(text));
      } else if (lowerPath.endsWith('.html') || lowerPath.endsWith('.htm')) {
        followingData = followingData.concat(parseInstagramHtml(text));
      }
    }
  }

  // Deduplicate in case multiple part files were loaded
  const uniqueFollowers = Array.from(new Map(followersData.map((u) => [u.username, u])).values());
  const uniqueFollowing = Array.from(new Map(followingData.map((u) => [u.username, u])).values());

  if (uniqueFollowers.length === 0 && uniqueFollowing.length === 0) {
    throw new Error(
      'Could not find followers or following data in the zip file. Ensure you selected "Followers and following" when requesting your Instagram export.'
    );
  }

  const stats = calculateSnapshotStats(uniqueFollowers, uniqueFollowing);

  return {
    followers: uniqueFollowers,
    following: uniqueFollowing,
    stats,
    sourceType: 'zip',
    summary: {
      followerCount: uniqueFollowers.length,
      followingCount: uniqueFollowing.length,
      filesFound,
    },
  };
}
