import React from 'react';
import { PipelineDeal, PipelineStage } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  stageId: PipelineStage;
  title: string;
  stageColor: string;
  deals: PipelineDeal[];
  onSelectDeal: (deal: PipelineDeal) => void;
  onMoveStage: (dealId: string, direction: 'next' | 'prev') => void;
  onQuickSchedule: (deal: PipelineDeal) => void;
  onQuickReminder: (deal: PipelineDeal) => void;
  onAddNewToStage: (stage: PipelineStage) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stageId,
  title,
  stageColor,
  deals,
  onSelectDeal,
  onMoveStage,
  onQuickSchedule,
  onQuickReminder,
  onAddNewToStage,
}) => {
  const stageTotal = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full bg-slate-900/70 border border-slate-800 rounded-2xl flex-1 shrink-0 overflow-hidden">
      {/* Column Header */}
      <div className="p-3.5 bg-slate-800/40 border-b border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${stageColor}`}></span>
            <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            {deals.length}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Stage total:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-200">
            ${stageTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[350px]">
        {deals.map((deal) => (
          <KanbanCard
            key={deal.id}
            deal={deal}
            onSelect={onSelectDeal}
            onMoveStage={onMoveStage}
            onQuickSchedule={onQuickSchedule}
            onQuickReminder={onQuickReminder}
          />
        ))}

        {deals.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs text-slate-500">No deals in this stage</p>
            <button
              onClick={() => onAddNewToStage(stageId)}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              + Add deal here
            </button>
          </div>
        )}
      </div>

      {/* Add Deal Button at bottom */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/50">
        <button
          onClick={() => onAddNewToStage(stageId)}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Deal to {title}</span>
        </button>
      </div>
    </div>
  );
};
