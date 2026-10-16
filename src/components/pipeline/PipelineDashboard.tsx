import React, { useState } from 'react';
import { PipelineDeal, ScheduleReminder, PipelineStage } from '../../types';
import { PipelineStats } from './PipelineStats';
import { KanbanBoard } from './KanbanBoard';
import { DealsTableView } from './DealsTableView';
import { LayoutGrid, Table, Plus, RefreshCw } from 'lucide-react';

interface PipelineDashboardProps {
  deals: PipelineDeal[];
  reminders: ScheduleReminder[];
  onSelectDeal: (deal: PipelineDeal) => void;
  onMoveStage: (dealId: string, direction: 'next' | 'prev') => void;
  onUpdateStage: (dealId: string, newStage: PipelineStage) => void;
  onQuickSchedule: (deal: PipelineDeal) => void;
  onQuickReminder: (deal: PipelineDeal) => void;
  onAddNewDeal: (defaultStage?: PipelineStage) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const PipelineDashboard: React.FC<PipelineDashboardProps> = ({
  deals,
  reminders,
  onSelectDeal,
  onMoveStage,
  onUpdateStage,
  onQuickSchedule,
  onQuickReminder,
  onAddNewDeal,
  onTriggerSync,
  isSyncing,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      {/* Pipeline Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-display">
              <span>Deal Pipeline CRM</span>
              <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md">
                Q4 2026
              </span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{deals.length} active opportunities</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Bidirectional Android sync active</span>
            </div>
          </div>
        </div>

        {/* View Switcher and Action Button */}
        <div className="flex items-center gap-2">
          {/* Segmented View Mode Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => onAddNewDeal('lead')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <PipelineStats deals={deals} reminders={reminders} />

      {/* Main Board / Table Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            deals={deals}
            onSelectDeal={onSelectDeal}
            onMoveStage={onMoveStage}
            onQuickSchedule={onQuickSchedule}
            onQuickReminder={onQuickReminder}
            onAddNewToStage={onAddNewDeal}
          />
        ) : (
          <DealsTableView
            deals={deals}
            onSelectDeal={onSelectDeal}
            onUpdateStage={onUpdateStage}
            onQuickSchedule={onQuickSchedule}
            onQuickReminder={onQuickReminder}
          />
        )}
      </div>
    </div>
  );
};
