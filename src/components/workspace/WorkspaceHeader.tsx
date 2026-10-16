import React from 'react';
import { ActiveWorkspaceView } from '../../types';
import { Columns3, Smartphone, SplitSquareVertical, RefreshCw, Plus } from 'lucide-react';

interface WorkspaceHeaderProps {
  activeView: ActiveWorkspaceView;
  setActiveView: (view: ActiveWorkspaceView) => void;
  onOpenNewDeal: () => void;
  onOpenNewSchedule: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  activeView,
  setActiveView,
  onOpenNewDeal,
  onOpenNewSchedule,
  onTriggerSync,
  isSyncing,
  lastSyncTime,
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="#home" className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm inline-block"></span>
          <span>Nexus Pipeline</span>
          <span className="text-slate-500 font-normal">/</span>
          <span className="text-emerald-400 font-semibold">Android Companion</span>
        </a>
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 ml-2">
          <span>Synced</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums text-slate-300">{lastSyncTime}</span>
        </div>
      </div>

      {/* Zone 2: View switch navigation controls */}
      <nav className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs font-medium">
        <button
          onClick={() => setActiveView('dual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'dual'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Side-by-side view of Pipeline CRM and Android Companion"
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>Dual App View</span>
        </button>

        <button
          onClick={() => setActiveView('pipeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'pipeline'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Fullscreen Deal Pipeline Management CRM"
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Pipeline CRM</span>
        </button>

        <button
          onClick={() => setActiveView('android')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'android'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
          title="Fullscreen Android Calendar & Reminder App"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Companion</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          title="Trigger instant bidirectional sync between CRM and Android"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">Sync Now</span>
        </button>

        <button
          onClick={onOpenNewSchedule}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Put new calendar schedule or reminder"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Put Schedule</span>
        </button>

        <button
          onClick={onOpenNewDeal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Create a new pipeline deal"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Deal</span>
        </button>
      </div>
    </header>
  );
};
