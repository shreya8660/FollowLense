import React from 'react';
import { Users, UserCheck, HeartHandshake, UserX, UserPlus, UserMinus, ArrowRight } from 'lucide-react';
import { SnapshotStats, ActiveTab } from '../../types';

interface StatCardsProps {
  stats: SnapshotStats | undefined;
  newFollowersCount: number;
  lostFollowersCount: number;
  onSelectTab: (tab: ActiveTab) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  stats,
  newFollowersCount,
  lostFollowersCount,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'all-followers' as ActiveTab,
      title: 'Total Followers',
      value: stats?.totalFollowers ?? 0,
      icon: Users,
      iconBg: 'bg-[#1A1426] border-[#2C1D3E]',
      iconColor: 'text-purple-400',
      description: 'Followers on profile',
      trend: stats?.ratio ? `${stats.ratio.toFixed(2)} ratio` : null,
      trendColor: 'text-purple-400',
      componentTheme: 'purple' as const,
    },
    {
      id: 'all-following' as ActiveTab,
      title: 'Total Following',
      value: stats?.totalFollowing ?? 0,
      icon: UserCheck,
      iconBg: 'bg-[#1A1426] border-[#2C1D3E]',
      iconColor: 'text-purple-300',
      description: 'Accounts followed',
      trend: null,
      trendColor: 'text-neutral-400',
      componentTheme: 'purple' as const,
    },
    {
      id: 'mutual' as ActiveTab,
      title: 'Mutual Followers',
      value: stats?.mutualFollowers ?? 0,
      icon: HeartHandshake,
      iconBg: 'bg-[#22131F] border-[#381D33]',
      iconColor: 'text-pink-400',
      description: 'Follow each other',
      trend: stats?.totalFollowers
        ? `${Math.round((stats.mutualFollowers / stats.totalFollowers) * 100)}% reciprocal`
        : null,
      trendColor: 'text-pink-400',
      componentTheme: 'pink' as const,
    },
    {
      id: 'not-following-back' as ActiveTab,
      title: "Don't Follow You Back",
      value: stats?.notFollowingBack ?? 0,
      icon: UserX,
      iconBg: 'bg-[#22131F] border-[#381D33]',
      iconColor: 'text-pink-400',
      description: 'Unreciprocated follows',
      trend: 'Unfollow targets',
      trendColor: 'text-pink-400 font-medium',
      componentTheme: 'pink' as const,
    },
    {
      id: 'new-followers' as ActiveTab,
      title: 'New Followers',
      value: newFollowersCount,
      icon: UserPlus,
      iconBg: 'bg-[#1A1426] border-[#2C1D3E]',
      iconColor: 'text-purple-400',
      description: 'Gained since last snapshot',
      trend: newFollowersCount > 0 ? `+${newFollowersCount} new` : 'No new joins',
      trendColor: 'text-purple-300',
      componentTheme: 'purple' as const,
    },
    {
      id: 'lost-followers' as ActiveTab,
      title: 'Lost Followers',
      value: lostFollowersCount,
      icon: UserMinus,
      iconBg: 'bg-[#22131F] border-[#381D33]',
      iconColor: 'text-pink-400',
      description: 'Unfollowed since last export',
      trend: lostFollowersCount > 0 ? `-${lostFollowersCount} lost` : 'Zero lost',
      trendColor: 'text-pink-400',
      componentTheme: 'pink' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPink = card.componentTheme === 'pink';

        return (
          <button
            key={card.title}
            onClick={() => onSelectTab(card.id)}
            className={`group text-left p-4 rounded-xl bg-[#131117] border transition-colors flex flex-col justify-between ${
              isPink
                ? 'border-[#281824] hover:border-pink-800'
                : 'border-[#221C2B] hover:border-purple-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium transition-colors truncate ${
                  isPink ? 'text-neutral-400 group-hover:text-pink-200' : 'text-neutral-400 group-hover:text-purple-200'
                }`}>
                  {card.title}
                </span>
                <div className={`p-1 rounded-md border ${card.iconBg} ${card.iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {card.value.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1C1724] flex items-center justify-between text-[11px]">
              <span className={`truncate max-w-[110px] ${card.trendColor || 'text-neutral-500'}`} title={card.description}>
                {card.trend || card.description}
              </span>

              <span className={`transition-colors flex items-center gap-0.5 shrink-0 ${
                isPink ? 'text-neutral-500 group-hover:text-pink-300' : 'text-neutral-500 group-hover:text-purple-300'
              }`}>
                <span>View</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
