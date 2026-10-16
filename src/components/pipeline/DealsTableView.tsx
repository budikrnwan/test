import React, { useState } from 'react';
import { PipelineDeal, PipelineStage } from '../../types';
import { Calendar, Bell, Search, ArrowUpDown } from 'lucide-react';

interface DealsTableViewProps {
  deals: PipelineDeal[];
  onSelectDeal: (deal: PipelineDeal) => void;
  onUpdateStage: (dealId: string, newStage: PipelineStage) => void;
  onQuickSchedule: (deal: PipelineDeal) => void;
  onQuickReminder: (deal: PipelineDeal) => void;
}

const STAGE_LABELS: Record<PipelineStage, string> = {
  lead: '1. Discovery',
  qualified: '2. Qualified',
  proposal: '3. Proposal',
  negotiation: '4. Negotiation',
  won: '5. Closed Won',
  lost: 'Closed Lost',
};

export const DealsTableView: React.FC<DealsTableViewProps> = ({
  deals,
  onSelectDeal,
  onUpdateStage,
  onQuickSchedule,
  onQuickReminder,
}) => {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'value' | 'probability' | 'title'>('value');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredDeals = deals
    .filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.company.toLowerCase().includes(search.toLowerCase()) ||
        d.contactName.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === 'all' || d.stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortField === 'value') {
        return sortAsc ? a.value - b.value : b.value - a.value;
      }
      if (sortField === 'probability') {
        return sortAsc ? a.probability - b.probability : b.probability - a.probability;
      }
      return sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    });

  const toggleSort = (field: 'value' | 'probability' | 'title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 bg-slate-900 overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals, company, contact..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs / Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-lg border border-slate-700/60 overflow-x-auto">
          {['all', 'lead', 'qualified', 'proposal', 'negotiation', 'won'].map((s) => (
            <button
              key={s}
              onClick={() => setStageFilter(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                stageFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Stages' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* High-density Table */}
      <div className="flex-1 bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/60 text-slate-400 select-none">
                <th className="py-2.5 px-3 font-medium">
                  <button
                    onClick={() => toggleSort('title')}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span>Deal & Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium">Stage</th>
                <th className="py-2.5 px-3 font-medium text-right">
                  <button
                    onClick={() => toggleSort('value')}
                    className="flex items-center gap-1 ml-auto hover:text-white"
                  >
                    <span>Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium text-right">
                  <button
                    onClick={() => toggleSort('probability')}
                    className="flex items-center gap-1 ml-auto hover:text-white"
                  >
                    <span>Win %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium">Contact</th>
                <th className="py-2.5 px-3 font-medium">Next Action</th>
                <th className="py-2.5 px-3 font-medium text-center">Android Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal.id}
                  className="hover:bg-slate-800/50 transition-colors group"
                >
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onSelectDeal(deal)}
                      className="font-medium text-white hover:text-indigo-400 text-left transition-colors font-sans block"
                    >
                      {deal.title}
                    </button>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {deal.company}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={deal.stage}
                      onChange={(e) => onUpdateStage(deal.id, e.target.value as PipelineStage)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="lead">1. Discovery</option>
                      <option value="qualified">2. Qualified</option>
                      <option value="proposal">3. Proposal</option>
                      <option value="negotiation">4. Negotiation</option>
                      <option value="won">5. Won</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-white">
                    ${deal.value.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                    {deal.probability}%
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div>{deal.contactName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {deal.contactEmail}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {deal.nextAction ? (
                      <div>
                        <div className="text-slate-200 truncate max-w-[180px]">{deal.nextAction}</div>
                        {deal.nextActionDate && (
                          <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                            {deal.nextActionDate}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No pending action</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onQuickSchedule(deal)}
                        className="p-1.5 text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-600/60 border border-emerald-500/30 rounded-md transition-colors"
                        title="Put schedule on Android Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onQuickReminder(deal)}
                        className="p-1.5 text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-600/60 border border-amber-500/30 rounded-md transition-colors"
                        title="Set reminder on Android Device"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No deals match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
