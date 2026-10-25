import React, { useState, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Shield,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ArrowUpDown,
  UserX,
} from 'lucide-react';
import { InstagramUser, ActiveTab } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AccountsTableProps {
  users: InstagramUser[];
  title: string;
  subtitle: string;
  activeTab: ActiveTab;
  whitelistSet: Set<string>;
  onToggleWhitelist: (username: string) => void;
  isLoading?: boolean;
}

type SortField = 'date' | 'username';
type SortOrder = 'asc' | 'desc';

export const AccountsTable: React.FC<AccountsTableProps> = ({
  users,
  title,
  subtitle,
  activeTab,
  whitelistSet,
  onToggleWhitelist,
  isLoading = false,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [hideWhitelisted, setHideWhitelisted] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set());
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const processedUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) => u.username.toLowerCase().includes(q) || (u.name && u.name.toLowerCase().includes(q))
      );
    }

    if (hideWhitelisted) {
      result = result.filter((u) => !whitelistSet.has(u.username.toLowerCase()));
    }

    result.sort((a, b) => {
      if (sortField === 'username') {
        const comp = a.username.localeCompare(b.username);
        return sortOrder === 'asc' ? comp : -comp;
      } else {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
    });

    return result;
  }, [users, searchQuery, hideWhitelisted, sortField, sortOrder, whitelistSet]);

  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, page, pageSize]);

  const isAllSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUsernames.has(u.username));

  const handleSelectAll = () => {
    const updated = new Set(selectedUsernames);
    if (isAllSelected) {
      paginatedUsers.forEach((u) => updated.delete(u.username));
    } else {
      paginatedUsers.forEach((u) => updated.add(u.username));
    }
    setSelectedUsernames(updated);
  };

  const handleToggleSelect = (username: string) => {
    const updated = new Set(selectedUsernames);
    if (updated.has(username)) {
      updated.delete(username);
    } else {
      updated.add(username);
    }
    setSelectedUsernames(updated);
  };

  const handleCopySelected = (format: 'comma' | 'newline' | 'at') => {
    const targetList =
      selectedUsernames.size > 0
        ? Array.from(selectedUsernames)
        : paginatedUsers.map((u) => u.username);

    if (targetList.length === 0) {
      showToast('warning', 'No accounts selected', 'Select at least one account to copy.');
      return;
    }

    let text = '';
    if (format === 'at') {
      text = targetList.map((u) => `@${u}`).join(' ');
    } else if (format === 'newline') {
      text = targetList.join('\n');
    } else {
      text = targetList.join(', ');
    }

    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    showToast('success', 'Copied to Clipboard', `Copied ${targetList.length} username${targetList.length > 1 ? 's' : ''}`);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const handleExportCSV = () => {
    if (processedUsers.length === 0) {
      showToast('warning', 'No data to export');
      return;
    }

    const headers = ['Username', 'Name', 'Instagram URL', 'Timestamp', 'Date Added', 'Whitelisted'];
    const rows = processedUsers.map((u) => [
      u.username,
      u.name ? `"${u.name.replace(/"/g, '""')}"` : '',
      u.profileUrl,
      u.timestamp,
      new Date(u.timestamp).toISOString(),
      whitelistSet.has(u.username.toLowerCase()) ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `followlens_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('success', 'CSV Exported', `Downloaded ${processedUsers.length} records`);
  };

  return (
    <div className="rounded-xl bg-[#131117] border border-[#211C28] overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="p-4 border-b border-[#201A28] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
            <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded bg-pink-950/50 text-pink-300 border border-pink-800/50 font-medium">
              {processedUsers.length.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Action Buttons: Solid Pink for Copy, Solid Purple for Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleCopySelected('at')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-colors whitespace-nowrap shadow-sm"
            title="Copy handles with @ symbol"
          >
            {copiedBatch ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{selectedUsernames.size > 0 ? `Copy Selected (${selectedUsernames.size})` : 'Copy Handles'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1B1526] hover:bg-[#251D33] text-purple-200 border border-purple-800/40 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 bg-[#0D0B12] border-b border-[#201A28] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-400/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by username or name..."
            className="w-full pl-8.5 pr-4 py-1.5 text-xs bg-[#16121E] text-white placeholder-neutral-500 border border-[#2B2038] rounded-md focus:outline-none focus:border-pink-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === 'not-following-back' && (
            <label className="flex items-center gap-1.5 text-xs text-pink-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideWhitelisted}
                onChange={(e) => setHideWhitelisted(e.target.checked)}
                className="rounded bg-[#16121E] border-pink-900 text-pink-600 focus:ring-0"
              />
              <span>Hide Whitelisted</span>
            </label>
          )}

          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <ArrowUpDown className="w-3 h-3 text-purple-400" />
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(f);
                setSortOrder(o);
              }}
              className="bg-[#16121E] text-purple-200 border border-[#2B2038] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="username-asc">Username A-Z</option>
              <option value="username-desc">Username Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading accounts...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#1B1624] border border-[#2B2038] flex items-center justify-center mx-auto mb-3 text-neutral-500">
              <UserX className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-semibold text-white">No accounts found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No accounts matched "${searchQuery}".`
                : 'There are no accounts in this list category for the active snapshot.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#201A28] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-[#0D0B12]">
                <th className="py-2.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded bg-[#16121E] border-pink-900 text-pink-600 focus:ring-0"
                    aria-label="Select all accounts on page"
                  />
                </th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Detected</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1926] text-xs">
              {paginatedUsers.map((user) => {
                const isWhitelisted = whitelistSet.has(user.username.toLowerCase());
                const isSelected = selectedUsernames.has(user.username);
                const dateStr = user.timestamp
                  ? new Date(user.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—';

                const initial = user.username.charAt(0).toUpperCase();

                return (
                  <tr
                    key={user.username}
                    className={`transition-colors hover:bg-[#191522] ${
                      isSelected ? 'bg-[#21162B]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(user.username)}
                        className="rounded bg-[#16121E] border-pink-900 text-pink-600 focus:ring-0"
                        aria-label={`Select ${user.username}`}
                      />
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {/* Solid purple avatar badge */}
                        <div className="w-7 h-7 rounded bg-purple-900 border border-purple-700/40 flex items-center justify-center font-semibold text-purple-200 text-xs shrink-0 select-none">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <a
                            href={user.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-white hover:text-pink-300 transition-colors truncate block"
                          >
                            @{user.username}
                          </a>
                          {user.name && (
                            <span className="text-[11px] text-neutral-400 truncate block">
                              {user.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-neutral-400 font-mono tabular-nums whitespace-nowrap">
                      {dateStr}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {isWhitelisted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-pink-400">
                            <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                            <span>Protected</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-500">Standard</span>
                        )}
                        {user.notes && (
                          <span className="text-[11px] text-neutral-400">· {user.notes}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => onToggleWhitelist(user.username)}
                          title={isWhitelisted ? 'Remove protection' : 'Protect / Whitelist account'}
                          className={`p-1.5 rounded border transition-colors ${
                            isWhitelisted
                              ? 'bg-pink-950/40 border-pink-700/50 text-pink-300'
                              : 'bg-[#1B1624] border-[#2B2038] text-neutral-400 hover:text-pink-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                        </button>

                        <a
                          href={user.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded border border-[#2B2038] bg-[#1B1624] text-neutral-400 hover:text-white transition-colors"
                          title="Open Instagram profile"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-[#201A28] bg-[#0D0B12] flex items-center justify-between text-xs text-neutral-400">
          <span className="font-mono tabular-nums">
            Page {page} of {totalPages} ({processedUsers.length} total)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-[#16121E] border border-[#2B2038] text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#221830] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-[#16121E] border border-[#2B2038] text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#221830] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
