import React from 'react';
import { SyncLogItem } from '../../types';
import { Smartphone, Columns3, CheckCircle2 } from 'lucide-react';

interface SyncToastProps {
  toast: SyncLogItem | null;
  onDismiss: () => void;
}

export const SyncToast: React.FC<SyncToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div
      onClick={onDismiss}
      className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl flex items-center gap-3 cursor-pointer hover:border-slate-600 transition-all max-w-sm animate-slide-up"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          toast.source === 'pipeline'
            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        {toast.source === 'pipeline' ? (
          <Columns3 className="w-4 h-4" />
        ) : (
          <Smartphone className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-white truncate">
          <span>{toast.action}</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Synced
          </span>
        </div>
        <p className="text-[11px] text-slate-400 truncate">{toast.details}</p>
      </div>
    </div>
  );
};
