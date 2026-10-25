import React from 'react';
import {
  LayoutDashboard,
  UserX,
  UserMinus,
  UserPlus,
  Users,
  HeartHandshake,
  ShieldCheck,
  GitCompare,
  FileText,
  Sparkles,
  Camera,
  X,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab, Snapshot } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentSnapshot: Snapshot | null;
  snapshots: Snapshot[];
  onSelectSnapshot: (id: string) => void;
  onLoadDemoData: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  lostCount: number;
  newCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentSnapshot,
  snapshots,
  onSelectSnapshot,
  onLoadDemoData,
  mobileOpen,
  onCloseMobile,
  lostCount,
  newCount,
}) => {
  const { stats } = currentSnapshot || {};

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: any;
    count?: number;
    highlight?: boolean;
    colorTheme: 'purple' | 'pink';
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navItems: NavGroup[] = [
    {
      group: 'Analytics',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, colorTheme: 'purple' },
        { id: 'compare', label: 'Compare Snapshots', icon: GitCompare, colorTheme: 'purple' },
      ],
    },
    {
      group: 'Audience Insights',
      items: [
        {
          id: 'not-following-back',
          label: "Don't Follow Back",
          icon: UserX,
          count: stats?.notFollowingBack,
          highlight: true,
          colorTheme: 'pink',
        },
        {
          id: 'lost-followers',
          label: 'Lost Followers',
          icon: UserMinus,
          count: lostCount > 0 ? lostCount : undefined,
          colorTheme: 'pink',
        },
        {
          id: 'new-followers',
          label: 'New Followers',
          icon: UserPlus,
          count: newCount > 0 ? newCount : undefined,
          colorTheme: 'purple',
        },
        {
          id: 'mutual',
          label: 'Mutual Followers',
          icon: HeartHandshake,
          count: stats?.mutualFollowers,
          colorTheme: 'pink',
        },
        {
          id: 'fans',
          label: "Fans (Not Following)",
          icon: Users,
          count: stats?.fans,
          colorTheme: 'purple',
        },
      ],
    },
    {
      group: 'Account & Lists',
      items: [
        { id: 'all-following', label: 'All Following', icon: ChevronRight, count: stats?.totalFollowing, colorTheme: 'purple' },
        { id: 'all-followers', label: 'All Followers', icon: ChevronRight, count: stats?.totalFollowers, colorTheme: 'purple' },
        { id: 'whitelist', label: 'Protected Whitelist', icon: ShieldCheck, colorTheme: 'pink' },
        { id: 'export-guide', label: 'Download Guide', icon: FileText, colorTheme: 'purple' },
      ],
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0D0B12] border-r border-[#201A28] w-64 select-none">
      {/* Brand Header with Solid Purple icon badge */}
      <div className="p-4 flex items-center justify-between border-b border-[#201A28]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center text-white">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white block leading-tight">
              Follow<span className="text-pink-400">Lens</span>
            </span>
            <span className="text-[10px] tracking-wider text-neutral-400 font-medium">INSTAGRAM TRACKER</span>
          </div>
        </div>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-neutral-400 hover:text-white rounded hover:bg-white/[0.05]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Snapshot Selector (Solid Purple component) */}
      <div className="p-3 mx-3 mt-3 rounded-lg bg-[#14111C] border border-[#241E30]">
        <label className="text-[10px] uppercase font-semibold text-purple-300 tracking-wider block mb-1">
          Active Snapshot
        </label>
        {snapshots.length > 0 ? (
          <select
            value={currentSnapshot?.id || ''}
            onChange={(e) => onSelectSnapshot(e.target.value)}
            className="w-full text-xs bg-[#0D0B12] text-neutral-200 border border-[#282136] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-purple-500 transition-colors"
          >
            {snapshots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({new Date(s.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={onLoadDemoData}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium text-purple-300 bg-[#1A1324] border border-[#2F1F40] rounded-md hover:bg-[#221832] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Load Sample Data</span>
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                const isPinkComponent = item.colorTheme === 'pink';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? isPinkComponent
                          ? 'bg-[#20121C] text-pink-200 font-semibold border-l-2 border-pink-500'
                          : 'bg-[#1C1428] text-purple-200 font-semibold border-l-2 border-purple-500'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#14111C]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive
                            ? isPinkComponent
                              ? 'text-pink-400'
                              : 'text-purple-400'
                            : isPinkComponent
                            ? 'text-pink-400/70'
                            : 'text-purple-400/70'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span
                        className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded ${
                          isActive
                            ? isPinkComponent
                              ? 'bg-pink-900/40 text-pink-200'
                              : 'bg-purple-900/40 text-purple-200'
                            : isPinkComponent
                            ? 'bg-pink-950/40 text-pink-300'
                            : 'bg-purple-950/40 text-purple-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Demo Reset Button */}
      <div className="p-3 border-t border-[#201A28] bg-[#0D0B12]">
        <button
          onClick={onLoadDemoData}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-neutral-400 hover:text-purple-300 rounded-md hover:bg-[#14111C] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Reset Demo Data</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">2 Snaps</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-40">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#0D0B12] h-full shadow-2xl z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
