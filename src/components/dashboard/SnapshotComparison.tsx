import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ExternalLink,
  Shield,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { Snapshot, InstagramUser, ComparisonResult } from '../../types';
import { useToast } from '../../context/ToastContext';

interface SnapshotComparisonProps {
  snapshots: Snapshot[];
  whitelistSet: Set<string>;
  onToggleWhitelist: (username: string) => void;
}

export const SnapshotComparison: React.FC<SnapshotComparisonProps> = ({
  snapshots,
  whitelistSet,
  onToggleWhitelist,
}) => {
  const { showToast } = useToast();

  const [snapAId, setSnapAId] = useState<string>(
    snapshots.length > 1 ? snapshots[1].id : snapshots[0]?.id || ''
  );
  const [snapBId, setSnapBId] = useState<string>(
    snapshots.length > 0 ? snapshots[0].id : ''
  );
  const [activeView, setActiveView] = useState<'lost' | 'new' | 'unfollowedByYou' | 'newFollowing'>('lost');
  const [copied, setCopied] = useState(false);

  const snapA = useMemo(() => snapshots.find((s) => s.id === snapAId), [snapshots, snapAId]);
  const snapB = useMemo(() => snapshots.find((s) => s.id === snapBId), [snapshots, snapBId]);

  const comparison: ComparisonResult | null = useMemo(() => {
    if (!snapA || !snapB) return null;

    const snapAFollowersMap = new Map(snapA.followers.map((u) => [u.username.toLowerCase(), u]));
    const snapBFollowersMap = new Map(snapB.followers.map((u) => [u.username.toLowerCase(), u]));

    const snapAFollowingMap = new Map(snapA.following.map((u) => [u.username.toLowerCase(), u]));
    const snapBFollowingMap = new Map(snapB.following.map((u) => [u.username.toLowerCase(), u]));

    const lostFollowers: InstagramUser[] = [];
    for (const [username, user] of snapAFollowersMap.entries()) {
      if (!snapBFollowersMap.has(username)) {
        lostFollowers.push(user);
      }
    }

    const newFollowers: InstagramUser[] = [];
    for (const [username, user] of snapBFollowersMap.entries()) {
      if (!snapAFollowersMap.has(username)) {
        newFollowers.push(user);
      }
    }

    const unfollowedByYou: InstagramUser[] = [];
    for (const [username, user] of snapAFollowingMap.entries()) {
      if (!snapBFollowingMap.has(username)) {
        unfollowedByYou.push(user);
      }
    }

    const newFollowing: InstagramUser[] = [];
    for (const [username, user] of snapBFollowingMap.entries()) {
      if (!snapAFollowingMap.has(username)) {
        newFollowing.push(user);
      }
    }

    return {
      previousSnapshotId: snapA.id,
      previousLabel: snapA.label,
      previousDate: snapA.timestamp,
      currentSnapshotId: snapB.id,
      currentLabel: snapB.label,
      currentDate: snapB.timestamp,
      lostFollowers,
      newFollowers,
      unfollowedByYou,
      newFollowing,
      netChange: newFollowers.length - lostFollowers.length,
    };
  }, [snapA, snapB]);

  const activeList = useMemo(() => {
    if (!comparison) return [];
    if (activeView === 'lost') return comparison.lostFollowers;
    if (activeView === 'new') return comparison.newFollowers;
    if (activeView === 'unfollowedByYou') return comparison.unfollowedByYou;
    return comparison.newFollowing;
  }, [comparison, activeView]);

  const handleCopyList = () => {
    if (activeList.length === 0) return;
    const text = activeList.map((u) => `@${u.username}`).join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('success', 'Copied Usernames', `Copied ${activeList.length} handles`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!comparison) return;
    const rows = [
      ['Category', 'Username', 'Instagram URL', 'Timestamp'],
      ...comparison.lostFollowers.map((u) => ['Lost Follower (Unfollowed)', u.username, u.profileUrl, u.timestamp]),
      ...comparison.newFollowers.map((u) => ['New Follower', u.username, u.profileUrl, u.timestamp]),
      ...comparison.unfollowedByYou.map((u) => ['Unfollowed by You', u.username, u.profileUrl, u.timestamp]),
      ...comparison.newFollowing.map((u) => ['Newly Followed by You', u.username, u.profileUrl, u.timestamp]),
    ];

    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followlens_comparison_${snapA?.label}_vs_${snapB?.label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Comparison Exported', 'Downloaded full comparison report.');
  };

  if (snapshots.length < 2) {
    return (
      <div className="p-8 rounded-xl bg-[#131117] border border-[#211C28] text-center max-w-xl mx-auto my-8">
        <GitCompare className="w-8 h-8 text-purple-400 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-white">Compare Snapshots</h3>
        <p className="text-xs text-neutral-400 mt-1 mb-4">
          You need at least 2 snapshots to compare follower changes and identify who unfollowed you over time.
        </p>
        <div className="p-3.5 rounded-lg bg-[#181422] border border-[#2B2038] text-xs text-neutral-300 text-left">
          <p className="font-semibold text-purple-200 mb-1">How Snapshots Work</p>
          <p className="text-neutral-400 leading-relaxed">
            Upload your Instagram export periodically. FollowLens compares the snapshots and shows who unfollowed you and who followed you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector Card */}
      <div className="p-5 rounded-xl bg-[#131117] border border-[#211C28]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#201A28]">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-400" />
              <span>Snapshot Comparison Engine</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select two snapshots to uncover unfollowers and new audience gains between dates
            </p>
          </div>

          {comparison && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyList}
                disabled={activeList.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1B1624] hover:bg-[#251D30] text-pink-300 border border-[#2F213E] disabled:opacity-40 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-pink-400" />}
                <span>Copy Current ({activeList.length})</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1B1624] hover:bg-[#251D30] text-purple-300 border border-[#2F213E] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-purple-400" />
                <span>Export Report</span>
              </button>
            </div>
          )}
        </div>

        {/* Snapshot Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 items-center">
          <div className="p-3.5 rounded-lg bg-[#0D0B12] border border-[#201A28]">
            <label className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider block mb-1.5">
              1. Baseline Snapshot (Older)
            </label>
            <select
              value={snapAId}
              onChange={(e) => setSnapAId(e.target.value)}
              className="w-full text-xs bg-[#16121E] text-white border border-[#2B2038] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {new Date(s.timestamp).toLocaleDateString()} ({s.stats.totalFollowers} followers)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0D0B12] border border-[#201A28]">
            <label className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider block mb-1.5">
              2. Target Snapshot (Newer)
            </label>
            <select
              value={snapBId}
              onChange={(e) => setSnapBId(e.target.value)}
              className="w-full text-xs bg-[#16121E] text-white border border-[#2B2038] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} — {new Date(s.timestamp).toLocaleDateString()} ({s.stats.totalFollowers} followers)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Highlights: Dedicated pink and purple component cards */}
        {comparison && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-[#201A28]">
            {/* Lost: Solid Pink */}
            <button
              onClick={() => setActiveView('lost')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                activeView === 'lost'
                  ? 'bg-[#22131F] border-pink-700'
                  : 'bg-[#0D0B12] border-[#201A28] hover:border-pink-900'
              }`}
            >
              <span className="text-[11px] text-pink-400 font-medium block mb-1">Lost Followers</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                -{comparison.lostFollowers.length}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Unfollowed you</span>
            </button>

            {/* New: Solid Purple */}
            <button
              onClick={() => setActiveView('new')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                activeView === 'new'
                  ? 'bg-[#1C1428] border-purple-700'
                  : 'bg-[#0D0B12] border-[#201A28] hover:border-purple-900'
              }`}
            >
              <span className="text-[11px] text-purple-300 font-medium block mb-1">New Followers</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                +{comparison.newFollowers.length}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Started following</span>
            </button>

            {/* Unfollowed by you */}
            <button
              onClick={() => setActiveView('unfollowedByYou')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                activeView === 'unfollowedByYou'
                  ? 'bg-[#181522] border-neutral-600'
                  : 'bg-[#0D0B12] border-[#201A28] hover:border-neutral-700'
              }`}
            >
              <span className="text-[11px] text-neutral-300 font-medium block mb-1">You Unfollowed</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {comparison.unfollowedByYou.length}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Accounts you dropped</span>
            </button>

            {/* Net Gain */}
            <div className="p-3 rounded-lg bg-[#0D0B12] border border-[#201A28]">
              <span className="text-[11px] text-pink-400 font-medium block mb-1">Net Change</span>
              <span className={`text-xl font-bold font-mono tabular-nums ${comparison.netChange >= 0 ? 'text-pink-400' : 'text-purple-400'}`}>
                {comparison.netChange >= 0 ? `+${comparison.netChange}` : comparison.netChange}
              </span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Between snapshots</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Detail List */}
      {comparison && (
        <div className="rounded-xl bg-[#131117] border border-[#211C28] overflow-hidden">
          <div className="px-4 py-2.5 bg-[#0D0B12] border-b border-[#201A28] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white">
              {activeView === 'lost' && 'Accounts That Unfollowed You'}
              {activeView === 'new' && 'Accounts That Recently Followed You'}
              {activeView === 'unfollowedByYou' && 'Accounts You Stopped Following'}
              {activeView === 'newFollowing' && 'Accounts You Recently Followed'}
            </h3>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              {activeList.length} total
            </span>
          </div>

          {activeList.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No accounts in this category between the two selected snapshots.
            </div>
          ) : (
            <div className="divide-y divide-[#1F1926]">
              {activeList.map((user) => {
                const isWhitelisted = whitelistSet.has(user.username.toLowerCase());

                return (
                  <div
                    key={user.username}
                    className="p-3 flex items-center justify-between hover:bg-[#191522] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Solid purple avatar */}
                      <div className="w-7 h-7 rounded bg-purple-900 border border-purple-700/40 flex items-center justify-center font-semibold text-purple-200 text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <a
                          href={user.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:text-pink-300 transition-colors block"
                        >
                          @{user.username}
                        </a>
                        {user.name && (
                          <span className="text-[11px] text-neutral-400 block">{user.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleWhitelist(user.username)}
                        className={`p-1.5 rounded border transition-colors ${
                          isWhitelisted
                            ? 'bg-pink-950/40 border-pink-700/50 text-pink-300'
                            : 'bg-[#1B1624] border-[#2B2038] text-neutral-400 hover:text-pink-200'
                        }`}
                        title={isWhitelisted ? 'Whitelisted' : 'Add to whitelist'}
                      >
                        <Shield className="w-3 h-3" />
                      </button>
                      <a
                        href={user.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded border border-[#2B2038] bg-[#1B1624] text-neutral-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
