import React from 'react';
import { PipelineDeal, PipelineStage } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  deals: PipelineDeal[];
  onSelectDeal: (deal: PipelineDeal) => void;
  onMoveStage: (dealId: string, direction: 'next' | 'prev') => void;
  onQuickSchedule: (deal: PipelineDeal) => void;
  onQuickReminder: (deal: PipelineDeal) => void;
  onAddNewToStage: (stage: PipelineStage) => void;
}

const STAGES: { id: PipelineStage; title: string; color: string }[] = [
  { id: 'lead', title: '1. Discovery & Lead', color: 'bg-slate-400' },
  { id: 'qualified', title: '2. Technical Qualified', color: 'bg-blue-400' },
  { id: 'proposal', title: '3. Proposal & Review', color: 'bg-indigo-400' },
  { id: 'negotiation', title: '4. Legal & Terms', color: 'bg-amber-400' },
  { id: 'won', title: '5. Closed Won', color: 'bg-emerald-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deals,
  onSelectDeal,
  onMoveStage,
  onQuickSchedule,
  onQuickReminder,
  onAddNewToStage,
}) => {
  return (
    <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start min-h-[500px]">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.id);
        return (
          <KanbanColumn
            key={stage.id}
            stageId={stage.id}
            title={stage.title}
            stageColor={stage.color}
            deals={stageDeals}
            onSelectDeal={onSelectDeal}
            onMoveStage={onMoveStage}
            onQuickSchedule={onQuickSchedule}
            onQuickReminder={onQuickReminder}
            onAddNewToStage={onAddNewToStage}
          />
        );
      })}
    </div>
  );
};
