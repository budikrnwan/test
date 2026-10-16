import React from 'react';
import { PipelineDeal, ScheduleReminder } from '../../types';
import { DollarSign, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

interface PipelineStatsProps {
  deals: PipelineDeal[];
  reminders: ScheduleReminder[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({ deals, reminders }) => {
  // Compute metrics
  const activeDeals = deals.filter((d) => d.stage !== 'lost');
  const wonDeals = deals.filter((d) => d.stage === 'won');

  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedForecast = activeDeals.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0
  );

  const winRate =
    deals.length > 0
      ? Math.round((wonDeals.length / deals.length) * 100)
      : 0;

  const dueRemindersCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-900 border-b border-slate-800">
      {/* Stat 1: Total Pipeline */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Pipeline Value</span>
          <DollarSign className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2">
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-white">
            ${totalPipelineValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{activeDeals.length} active opportunities</span>
          </div>
        </div>
      </div>

      {/* Stat 2: Weighted Forecast */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Weighted Q4 Forecast</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-emerald-400">
            ${Math.round(weightedForecast).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Probability-adjusted value</span>
          </div>
        </div>
      </div>

      {/* Stat 3: Win Rate */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Stage Conversion Rate</span>
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
        </div>
        <div className="mt-2">
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-white">
            {winRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{wonDeals.length} deals closed won</span>
          </div>
        </div>
      </div>

      {/* Stat 4: Android Scheduled Reminders */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Android Pending Actions</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="text-xl md:text-2xl font-bold font-mono tabular-nums text-amber-300">
            {dueRemindersCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Syncing to companion device</span>
          </div>
        </div>
      </div>
    </div>
  );
};
