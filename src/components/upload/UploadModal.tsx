import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileArchive,
  FileCode,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import {
  parseInstagramZip,
  parseInstagramJson,
  parseInstagramHtml,
  calculateSnapshotStats,
} from '../../services/instagramParser';
import { InstagramUser, Snapshot } from '../../types';
import { useToast } from '../../context/ToastContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSnapshotCreated: (snapshot: Snapshot) => void;
  onOpenGuide: () => void;
  onLoadDemo: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSnapshotCreated,
  onOpenGuide,
  onLoadDemo,
}) => {
  const { showToast } = useToast();

  const [mode, setMode] = useState<'zip' | 'individual'>('zip');
  const [snapshotLabel, setSnapshotLabel] = useState(
    `Export ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [followingFile, setFollowingFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const followersInputRef = useRef<HTMLInputElement>(null);
  const followingInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleZipFile = async (file: File) => {
    setIsProcessing(true);
    try {
      showToast('info', 'Analyzing Archive', 'Unpacking followers and following data...');
      const result = await parseInstagramZip(file);

      const newSnapshot: Snapshot = {
        id: `snapshot-${Date.now()}`,
        label: snapshotLabel.trim() || `Export ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        followers: result.followers,
        following: result.following,
        stats: result.stats,
      };

      onSnapshotCreated(newSnapshot);
      showToast(
        'success',
        'Instagram Export Processed!',
        `Loaded ${result.followers.length.toLocaleString()} followers & ${result.following.length.toLocaleString()} following.`
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Import Failed', err.message || 'Please check that this is a valid Instagram data export ZIP.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIndividualSubmit = async () => {
    if (!followersFile || !followingFile) {
      showToast('warning', 'Missing Files', 'Please select both your Followers file and your Following file.');
      return;
    }

    setIsProcessing(true);
    try {
      const followersText = await followersFile.text();
      const followingText = await followingFile.text();

      let followers: InstagramUser[] = [];
      let following: InstagramUser[] = [];

      if (followersFile.name.endsWith('.json')) {
        followers = parseInstagramJson(followersText);
      } else {
        followers = parseInstagramHtml(followersText);
      }

      if (followingFile.name.endsWith('.json')) {
        following = parseInstagramJson(followingText);
      } else {
        following = parseInstagramHtml(followingText);
      }

      if (followers.length === 0 && following.length === 0) {
        throw new Error('No valid Instagram accounts found in the selected files.');
      }

      const stats = calculateSnapshotStats(followers, following);

      const newSnapshot: Snapshot = {
        id: `snapshot-${Date.now()}`,
        label: snapshotLabel.trim() || `Export ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        followers,
        following,
        stats,
      };

      onSnapshotCreated(newSnapshot);
      showToast(
        'success',
        'Snapshot Created!',
        `Successfully imported ${followers.length} followers and ${following.length} following.`
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('error', 'File Parse Error', err.message || 'Could not parse the selected files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        handleZipFile(file);
      } else if (file.name.includes('follower')) {
        setFollowersFile(file);
        setMode('individual');
        showToast('info', 'Followers file detected', 'Now please select your following file.');
      } else if (file.name.includes('following')) {
        setFollowingFile(file);
        setMode('individual');
        showToast('info', 'Following file detected', 'Now please select your followers file.');
      } else {
        showToast('warning', 'Unsupported File', 'Please upload an Instagram export ZIP, JSON, or HTML file.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-[#14111C] border border-[#241E30] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#201A28] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center text-white">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Import Instagram Data</h3>
              <p className="text-[11px] text-neutral-400">Upload your Meta export (JSON or HTML)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1E1828] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Snapshot Name / Label
            </label>
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="e.g. October 2026 Audit"
              className="w-full text-xs bg-[#0D0B12] text-white border border-[#282036] rounded-md px-3 py-1.5 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0D0B12] border border-[#201A28]">
            <button
              onClick={() => setMode('zip')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'zip'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Full ZIP Archive</span>
            </button>
            <button
              onClick={() => setMode('individual')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                mode === 'individual'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Separate JSON / HTML</span>
            </button>
          </div>

          {/* ZIP Drag & Drop Zone */}
          {mode === 'zip' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-lg p-7 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-[#1D1426]'
                  : 'border-[#2F243E] hover:border-purple-500 bg-[#0D0B12]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleZipFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-10 h-10 rounded-md bg-[#1B1624] border border-[#2E203C] flex items-center justify-center mx-auto mb-2.5 text-purple-400">
                <FileArchive className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-white">
                Drop your Instagram <span className="text-purple-400">.zip</span> export here
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">or click to browse your computer</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div
                onClick={() => followersInputRef.current?.click()}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                  followersFile
                    ? 'border-purple-700/60 bg-[#1B1326]'
                    : 'border-[#282036] bg-[#0D0B12] hover:border-purple-600'
                }`}
              >
                <input
                  ref={followersInputRef}
                  type="file"
                  accept=".json,.html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFollowersFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${followersFile ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-white">
                      {followersFile ? followersFile.name : 'Select followers_1.json or followers.html'}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {followersFile ? `${(followersFile.size / 1024).toFixed(1)} KB` : 'Followers file'}
                    </p>
                  </div>
                </div>
                {followersFile && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>

              <div
                onClick={() => followingInputRef.current?.click()}
                className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                  followingFile
                    ? 'border-purple-700/60 bg-[#1B1326]'
                    : 'border-[#282036] bg-[#0D0B12] hover:border-purple-600'
                }`}
              >
                <input
                  ref={followingInputRef}
                  type="file"
                  accept=".json,.html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFollowingFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${followingFile ? 'text-purple-400' : 'text-neutral-400'}`} />
                  <div>
                    <p className="text-xs font-medium text-white">
                      {followingFile ? followingFile.name : 'Select following.json or following.html'}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {followingFile ? `${(followingFile.size / 1024).toFixed(1)} KB` : 'Following file'}
                    </p>
                  </div>
                </div>
                {followingFile && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </div>

              <button
                onClick={handleIndividualSubmit}
                disabled={!followersFile || !followingFile || isProcessing}
                className="w-full py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md disabled:opacity-40 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Analyze Followers & Following'}
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-[#201A28] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Don't have your Instagram export yet?</span>
            <button
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="text-pink-400 hover:text-pink-300 font-medium inline-flex items-center gap-1 text-xs"
            >
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0D0B12] border-t border-[#201A28] flex items-center justify-between text-xs text-neutral-400">
          <button
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
            className="text-neutral-400 hover:text-purple-300 inline-flex items-center gap-1.5 text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>How to export data</span>
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
