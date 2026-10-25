import React from 'react';
import { X, ShieldCheck, ArrowRight, ExternalLink, Download } from 'lucide-react';

interface InstagramGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
}

export const InstagramGuideModal: React.FC<InstagramGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Open Meta Accounts Center',
      desc: 'In Instagram, go to Profile → Settings & Activity → Accounts Center.',
    },
    {
      step: '02',
      title: 'Select "Your Information and Permissions"',
      desc: 'Choose "Download your information", then "Download or transfer information".',
    },
    {
      step: '03',
      title: 'Choose "Some of your information"',
      desc: 'Check only "Followers and following" for rapid export creation (typically 2–5 minutes).',
    },
    {
      step: '04',
      title: 'Set Format & Request Download',
      desc: 'Select "Download to device", Date Range: "All time", and Format: JSON or HTML. Click "Create files".',
    },
    {
      step: '05',
      title: 'Download & Drop ZIP into FollowLens',
      desc: 'Download the completed ZIP from Meta and drop it into FollowLens.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-lg bg-[#14111C] border border-[#241E30] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#201A28] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-purple-600 flex items-center justify-center text-white">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                How to Export Your Instagram Data
              </h3>
              <p className="text-[11px] text-neutral-400">Safe, official Meta data export</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1E1828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-lg bg-[#1C1224] border border-[#301C3D] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-medium text-pink-200 mb-0.5">100% Account Safe & Password-Free</p>
              <p className="text-neutral-400 leading-relaxed text-[11px]">
                FollowLens never asks for your Instagram login or password. By parsing your official Meta data export, your account is completely safe from third-party bans.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#0D0B12] border border-[#201A28]"
              >
                <span className="font-mono text-xs font-semibold text-pink-400 bg-[#1A1324] border border-[#322046] w-6 h-6 rounded flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <div>
                  <h4 className="text-xs font-medium text-white">{s.title}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#0D0B12] border border-[#201A28] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Open Meta Accounts Center directly:</span>
            <a
              href="https://accountscenter.instagram.com/info_and_permissions/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A1424] hover:bg-[#251B33] text-pink-300 border border-[#2F213E] transition-colors text-xs"
            >
              <span>Meta Center</span>
              <ExternalLink className="w-3 h-3 text-pink-400" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0D0B12] border-t border-[#201A28] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white px-2.5 py-1"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors"
          >
            <span>Ready to Upload</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
