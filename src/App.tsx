import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  UserX,
  UserMinus,
  UserPlus,
  GitCompare,
  Upload,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { GrowthChart } from './components/dashboard/GrowthChart';
import { AccountsTable } from './components/accounts/AccountsTable';
import { SnapshotComparison } from './components/dashboard/SnapshotComparison';
import { UploadModal } from './components/upload/UploadModal';
import { InstagramGuideModal } from './components/guide/InstagramGuideModal';
import { AuthModal } from './components/auth/AuthModal';
import {
  DEMO_CURRENT_SNAPSHOT,
  DEMO_PREVIOUS_SNAPSHOT,
  DEMO_GROWTH_HISTORY,
  SAMPLE_LOST_FOLLOWERS,
  SAMPLE_NEW_FOLLOWERS,
} from './data/demoData';
import { ActiveTab, InstagramUser, Snapshot } from './types';
import { api } from './services/api';

function FollowLensApp() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    DEMO_CURRENT_SNAPSHOT,
    DEMO_PREVIOUS_SNAPSHOT,
  ]);
  const [currentSnapshotId, setCurrentSnapshotId] = useState<string>(DEMO_CURRENT_SNAPSHOT.id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [whitelist, setWhitelist] = useState<Set<string>>(
    new Set(['natgeo', 'mkbhd', 'austin_kleon', 'archdigest', 'theverge'])
  );

  const [uploadOpen, setUploadOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const [savedSnapshots, savedWhitelist] = await Promise.all([
          api.getSnapshots(),
          api.getWhitelist(),
        ]);

        if (savedSnapshots && savedSnapshots.length > 0) {
          setSnapshots(savedSnapshots);
          setCurrentSnapshotId(savedSnapshots[0].id);
        }

        if (savedWhitelist && savedWhitelist.length > 0) {
          setWhitelist(new Set(savedWhitelist.map((w) => w.username.toLowerCase())));
        }
      } catch {
        // Use client fallback
      }
    }
    loadUserData();
  }, [user]);

  const currentSnapshot = useMemo(() => {
    return snapshots.find((s) => s.id === currentSnapshotId) || snapshots[0] || null;
  }, [snapshots, currentSnapshotId]);

  const previousSnapshot = useMemo(() => {
    if (snapshots.length <= 1) return null;
    const currentIdx = snapshots.findIndex((s) => s.id === currentSnapshotId);
    if (currentIdx >= 0 && currentIdx < snapshots.length - 1) {
      return snapshots[currentIdx + 1];
    }
    return snapshots[1];
  }, [snapshots, currentSnapshotId]);

  const {
    notFollowingBackList,
    fansList,
    mutualList,
    lostFollowersList,
    newFollowersList,
    allFollowingList,
    allFollowersList,
    whitelistedAccountsList,
  } = useMemo(() => {
    if (!currentSnapshot) {
      return {
        notFollowingBackList: [],
        fansList: [],
        mutualList: [],
        lostFollowersList: [],
        newFollowersList: [],
        allFollowingList: [],
        allFollowersList: [],
        whitelistedAccountsList: [],
      };
    }

    const followersMap = new Map(
      currentSnapshot.followers.map((u) => [u.username.toLowerCase(), u])
    );
    const followingMap = new Map(
      currentSnapshot.following.map((u) => [u.username.toLowerCase(), u])
    );

    const notFollowingBack = currentSnapshot.following.filter(
      (u) => !followersMap.has(u.username.toLowerCase())
    );

    const fans = currentSnapshot.followers.filter(
      (u) => !followingMap.has(u.username.toLowerCase())
    );

    const mutual = currentSnapshot.following.filter((u) =>
      followersMap.has(u.username.toLowerCase())
    );

    let lost: InstagramUser[] = [];
    let gained: InstagramUser[] = [];

    if (previousSnapshot) {
      const prevFollowersMap = new Map(
        previousSnapshot.followers.map((u) => [u.username.toLowerCase(), u])
      );

      lost = previousSnapshot.followers.filter(
        (u) => !followersMap.has(u.username.toLowerCase())
      );

      gained = currentSnapshot.followers.filter(
        (u) => !prevFollowersMap.has(u.username.toLowerCase())
      );
    } else {
      lost = SAMPLE_LOST_FOLLOWERS;
      gained = SAMPLE_NEW_FOLLOWERS;
    }

    const allUsers = [...currentSnapshot.following, ...currentSnapshot.followers];
    const seen = new Set<string>();
    const whitelisted = allUsers.filter((u) => {
      const clean = u.username.toLowerCase();
      if (whitelist.has(clean) && !seen.has(clean)) {
        seen.add(clean);
        return true;
      }
      return false;
    });

    return {
      notFollowingBackList: notFollowingBack,
      fansList: fans,
      mutualList: mutual,
      lostFollowersList: lost,
      newFollowersList: gained,
      allFollowingList: currentSnapshot.following,
      allFollowersList: currentSnapshot.followers,
      whitelistedAccountsList: whitelisted,
    };
  }, [currentSnapshot, previousSnapshot, whitelist]);

  const handleToggleWhitelist = async (username: string) => {
    const clean = username.toLowerCase();
    const updated = new Set(whitelist);

    if (updated.has(clean)) {
      updated.delete(clean);
      showToast('info', 'Protection Removed', `@${clean} removed from protected list`);
    } else {
      updated.add(clean);
      showToast('success', 'Account Protected', `@${clean} added to protected whitelist`);
    }
    setWhitelist(updated);

    try {
      await api.toggleWhitelist(clean);
    } catch {
      // Ignored
    }
  };

  const handleSnapshotCreated = async (newSnapshot: Snapshot) => {
    setSnapshots((prev) => [newSnapshot, ...prev]);
    setCurrentSnapshotId(newSnapshot.id);

    try {
      await api.saveSnapshot(newSnapshot);
    } catch {
      // Local fallback
    }
  };

  const handleLoadDemoData = () => {
    setSnapshots([DEMO_CURRENT_SNAPSHOT, DEMO_PREVIOUS_SNAPSHOT]);
    setCurrentSnapshotId(DEMO_CURRENT_SNAPSHOT.id);
    setActiveTab('overview');
    setWhitelist(new Set(['natgeo', 'mkbhd', 'austin_kleon', 'archdigest', 'theverge']));
    showToast('success', 'Sample Data Loaded', 'Loaded 2 historical snapshots for @alex.creator');
  };

  const activeTabLabel = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'not-following-back':
        return "Don't Follow Back";
      case 'lost-followers':
        return 'Lost Followers';
      case 'new-followers':
        return 'New Followers';
      case 'mutual':
        return 'Mutual Connections';
      case 'fans':
        return 'Fans (Not Following Back)';
      case 'all-following':
        return 'All Following';
      case 'all-followers':
        return 'All Followers';
      case 'whitelist':
        return 'Protected Whitelist';
      case 'compare':
        return 'Snapshot Comparison';
      case 'export-guide':
        return 'Download Guide';
      default:
        return 'Dashboard';
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0B090E] text-[#ECECF1] flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentSnapshot={currentSnapshot}
        snapshots={snapshots}
        onSelectSnapshot={setCurrentSnapshotId}
        onLoadDemoData={handleLoadDemoData}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        lostCount={lostFollowersList.length}
        newCount={newFollowersList.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentSnapshot={currentSnapshot}
          onOpenUpload={() => setUploadOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
          onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
          activeTabLabel={activeTabLabel}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto space-y-5">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Snapshot Context Banner (Solid Purple Component) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#131117] border border-[#211C28]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                    FL
                  </div>
                  <div>
                    <h1 className="text-xs font-semibold text-white tracking-tight">
                      Follower Health & Audience Reciprocity
                    </h1>
                    <p className="text-[11px] text-neutral-400">
                      Comparing {currentSnapshot?.label || 'Current'} with previous snapshot activity
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('compare')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#1B1624] hover:bg-[#251D30] text-purple-200 border border-[#2F213E] transition-colors whitespace-nowrap"
                  >
                    <GitCompare className="w-3.5 h-3.5 text-purple-400" />
                    <span>Run Snapshot Diff</span>
                  </button>

                  <button
                    onClick={() => setUploadOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>New Snapshot</span>
                  </button>
                </div>
              </div>

              {/* 6 Core Statistics Cards */}
              <StatCards
                stats={currentSnapshot?.stats}
                newFollowersCount={newFollowersList.length}
                lostFollowersCount={lostFollowersList.length}
                onSelectTab={setActiveTab}
              />

              {/* Follower Growth Chart */}
              <GrowthChart data={DEMO_GROWTH_HISTORY} />

              {/* Spotlight Panels: Left is Dedicated Solid Pink, Right is Dedicated Solid Purple */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Spotlight 1: Unreciprocated Follows -> Dedicated Solid Pink Component */}
                <div className="p-4 rounded-xl bg-[#131117] border border-[#281824] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#241822]">
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4 text-pink-400" />
                        <h3 className="text-xs font-semibold text-white">
                          Don't Follow Back Spotlight
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('not-following-back')}
                        className="text-xs text-pink-400 hover:text-pink-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>View All ({notFollowingBackList.length})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-400 my-2.5 leading-relaxed">
                      Accounts you follow who do not follow you back. Whitelist favorite accounts to exclude them from unfollow cleanups.
                    </p>

                    <div className="divide-y divide-[#1F1926]">
                      {notFollowingBackList.slice(0, 5).map((user) => {
                        const isWhitelisted = whitelist.has(user.username.toLowerCase());

                        return (
                          <div
                            key={user.username}
                            className="py-2 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded bg-pink-900/60 border border-pink-700/40 flex items-center justify-center font-semibold text-pink-200 text-[10px] shrink-0">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <span className="font-medium text-white block truncate">
                                  @{user.username}
                                </span>
                                {user.name && (
                                  <span className="text-[10px] text-neutral-400 block truncate">
                                    {user.name}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleToggleWhitelist(user.username)}
                                className={`p-1 rounded border text-[11px] transition-colors ${
                                  isWhitelisted
                                    ? 'bg-pink-950/50 border-pink-700/60 text-pink-300'
                                    : 'bg-[#1B1624] border-[#2B2038] text-neutral-400 hover:text-pink-200'
                                }`}
                                title={isWhitelisted ? 'Whitelisted' : 'Protect / Whitelist'}
                              >
                                <Shield className="w-3 h-3" />
                              </button>
                              <a
                                href={user.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-[#1B1624] border border-[#2B2038] text-neutral-400 hover:text-white transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#241822] mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      {notFollowingBackList.filter((u) => !whitelist.has(u.username.toLowerCase())).length} unwhitelisted
                    </span>
                    <button
                      onClick={() => setActiveTab('not-following-back')}
                      className="text-pink-400 hover:text-pink-300 font-medium"
                    >
                      Audit followings →
                    </button>
                  </div>
                </div>

                {/* Spotlight 2: Recent Audience Changes -> Dedicated Solid Purple Component */}
                <div className="p-4 rounded-xl bg-[#131117] border border-[#221C2B] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#201A28]">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-semibold text-white">Recent Audience Changes</h3>
                      </div>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {previousSnapshot ? `vs ${previousSnapshot.label}` : 'Snapshot delta'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 my-3">
                      <button
                        onClick={() => setActiveTab('lost-followers')}
                        className="p-3 rounded-lg bg-[#0D0B12] border border-[#281824] hover:border-pink-800 text-left transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-pink-400 text-xs font-medium mb-1">
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Lost Followers</span>
                        </div>
                        <span className="text-xl font-bold font-mono text-white tabular-nums">
                          -{lostFollowersList.length}
                        </span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          Unfollowed since previous export
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveTab('new-followers')}
                        className="p-3 rounded-lg bg-[#0D0B12] border border-[#221C2B] hover:border-purple-800 text-left transition-colors"
                      >
                        <div className="flex items-center gap-1.5 text-purple-300 text-xs font-medium mb-1">
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>New Followers</span>
                        </div>
                        <span className="text-xl font-bold font-mono text-white tabular-nums">
                          +{newFollowersList.length}
                        </span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          Recently started following
                        </span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
                        Recent Unfollowers Preview
                      </p>
                      {lostFollowersList.slice(0, 3).map((user) => (
                        <div
                          key={user.username}
                          className="flex items-center justify-between text-xs py-1"
                        >
                          <span className="text-neutral-300 font-medium">@{user.username}</span>
                          <span className="text-pink-400 font-mono text-[11px]">Unfollowed</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#201A28] mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Net: <strong className="text-purple-300">{newFollowersList.length - lostFollowersList.length >= 0 ? `+${newFollowersList.length - lostFollowersList.length}` : newFollowersList.length - lostFollowersList.length}</strong></span>
                    <button
                      onClick={() => setActiveTab('compare')}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Compare full snapshots →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'not-following-back' && (
            <AccountsTable
              users={notFollowingBackList}
              title="Accounts That Don't Follow You Back"
              subtitle="Accounts you actively follow who have not followed you back. Whitelist favorite creators and public figures to keep your list clean."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'lost-followers' && (
            <AccountsTable
              users={lostFollowersList}
              title="Lost Followers (Unfollowed You)"
              subtitle="Accounts that were following you in your previous export but are no longer present in your current followers list."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'new-followers' && (
            <AccountsTable
              users={newFollowersList}
              title="Recently Gained Followers"
              subtitle="Accounts that started following you between your snapshot dates."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'mutual' && (
            <AccountsTable
              users={mutualList}
              title="Mutual Reciprocal Connections"
              subtitle="Accounts that you follow and who follow you back. Your core community."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'fans' && (
            <AccountsTable
              users={fansList}
              title="Fans (You Don't Follow Back)"
              subtitle="Accounts that follow you, but you currently do not follow them back."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'all-following' && (
            <AccountsTable
              users={allFollowingList}
              title="All Following Accounts"
              subtitle="The complete list of accounts you currently follow on Instagram."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'all-followers' && (
            <AccountsTable
              users={allFollowersList}
              title="All Followers"
              subtitle="The complete list of accounts currently following your Instagram profile."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'whitelist' && (
            <AccountsTable
              users={whitelistedAccountsList}
              title="Protected Accounts Whitelist"
              subtitle="Accounts marked as protected (brands, influencers, celebrities, news) that you follow intentionally without expecting a follow back."
              activeTab={activeTab}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'compare' && (
            <SnapshotComparison
              snapshots={snapshots}
              whitelistSet={whitelist}
              onToggleWhitelist={handleToggleWhitelist}
            />
          )}

          {activeTab === 'export-guide' && (
            <div className="p-6 rounded-xl bg-[#131117] border border-[#211C28] max-w-xl mx-auto space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    How FollowLens Tracks Followers Safely
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Official Meta data export — Zero passwords, Zero ban risk
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <p>
                  Most Instagram follower tracking apps ask for your password and run unauthorized scrapers in the background, which triggers security warnings, CAPTCHAs, and account suspensions from Meta.
                </p>
                <div className="p-3.5 rounded-lg bg-[#0D0B12] border border-[#201A28]">
                  <p className="font-semibold text-purple-200 mb-1 text-xs">Why FollowLens is Safe:</p>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-400 text-xs">
                    <li>Never asks for your Instagram password</li>
                    <li>No third-party login or Instagram API access</li>
                    <li>Parses your official Meta data export file (JSON or HTML)</li>
                    <li>Supports recurring snapshots to compare changes over time</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setGuideOpen(true)}
                className="w-full py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Step-by-Step Export Tutorial</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </main>
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSnapshotCreated={handleSnapshotCreated}
        onOpenGuide={() => setGuideOpen(true)}
        onLoadDemo={handleLoadDemoData}
      />

      <InstagramGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onOpenUpload={() => setUploadOpen(true)}
      />

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <FollowLensApp />
      </AuthProvider>
    </ToastProvider>
  );
}
