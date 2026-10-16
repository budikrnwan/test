import React from 'react';
import { PipelineDeal } from '../../types';
import { Calendar, Bell, ChevronRight, ChevronLeft, Building, User } from 'lucide-react';

interface KanbanCardProps {
  deal: PipelineDeal;
  onSelect: (deal: PipelineDeal) => void;
  onMoveStage: (dealId: string, direction: 'next' | 'prev') => void;
  onQuickSchedule: (deal: PipelineDeal) => void;
  onQuickReminder: (deal: PipelineDeal) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  deal,
  onSelect,
  onMoveStage,
  onQuickSchedule,
  onQuickReminder,
}) => {
  const getPriorityStyle = (priority: PipelineDeal['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-blue-300';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="group relative bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-3.5 transition-all shadow-sm hover:shadow-md">
      {/* Top row: Company and Priority text */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate max-w-[170px]">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{deal.company}</span>
        </span>
        <span className={`text-[11px] uppercase tracking-wider ${getPriorityStyle(deal.priority)}`}>
          {deal.priority}
        </span>
      </div>

      {/* Deal Title */}
      <h4
        onClick={() => onSelect(deal)}
        className="text-sm font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors leading-snug line-clamp-2 mb-2"
        title={deal.title}
      >
        {deal.title}
      </h4>

      {/* Value & Probability row */}
      <div className="flex items-center justify-between text-xs py-1.5 border-y border-slate-700/50 mb-2.5">
        <span className="font-mono tabular-nums text-base font-bold text-white">
          ${deal.value.toLocaleString()}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <span>Win prob:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-200">
            {deal.probability}%
          </span>
        </div>
      </div>

      {/* Next Action notice if available */}
      {deal.nextAction && (
        <div className="bg-slate-900/60 rounded-lg p-2 mb-2.5 border border-slate-700/40 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-0.5">
            <span className="font-medium text-slate-300">Next Action</span>
            {deal.nextActionDate && (
              <span className="font-mono tabular-nums text-slate-400">
                {deal.nextActionDate}
              </span>
            )}
          </div>
          <p className="text-slate-200 truncate">{deal.nextAction}</p>
        </div>
      )}

      {/* Contact unboxed metadata */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{deal.contactName}</span>
        </div>
        <span>Rep: {deal.assignedRep}</span>
      </div>

      {/* Action Footers: Schedule on Android + Reminder + Stage Shifts */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
        {/* Quick Android sync actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickSchedule(deal);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-600/60 border border-emerald-500/30 rounded-md transition-colors"
            title="Put schedule on Android Calendar"
          >
            <Calendar className="w-3 h-3" />
            <span>Calendar</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickReminder(deal);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-600/60 border border-amber-500/30 rounded-md transition-colors"
            title="Set reminder on Android Device"
          >
            <Bell className="w-3 h-3" />
            <span>Remind</span>
          </button>
        </div>

        {/* Stage advance / retreat controls */}
        <div className="flex items-center gap-1">
          {deal.stage !== 'lead' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage(deal.id, 'prev');
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              title="Move to previous stage"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {deal.stage !== 'won' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStage(deal.id, 'next');
              }}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              title="Advance to next stage"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
