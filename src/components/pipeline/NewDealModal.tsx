import React, { useState } from 'react';
import { PipelineDeal, PipelineStage, Priority } from '../../types';
import { X, Calendar, Bell } from 'lucide-react';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStage?: PipelineStage;
  onSubmit: (
    deal: Omit<PipelineDeal, 'id' | 'createdAt' | 'lastUpdated'>,
    options: {
      autoScheduleCall: boolean;
      callTime: string;
      autoReminder: boolean;
    }
  ) => void;
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  defaultStage = 'lead',
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [value, setValue] = useState(50000);
  const [probability, setProbability] = useState(25);
  const [stage, setStage] = useState<PipelineStage>(defaultStage);
  const [priority, setPriority] = useState<Priority>('medium');
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-11-30');
  const [assignedRep, setAssignedRep] = useState('Sarah Lin');
  const [notes, setNotes] = useState('');
  const [nextAction, setNextAction] = useState('Initial discovery call');
  const [autoScheduleCall, setAutoScheduleCall] = useState(true);
  const [callTime, setCallTime] = useState('11:00');
  const [autoReminder, setAutoReminder] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    onSubmit(
      {
        title: title.trim(),
        company: company.trim(),
        contactName: contactName.trim() || 'Key Decision Maker',
        contactEmail: contactEmail.trim() || 'contact@' + company.toLowerCase().replace(/[^a-z]/g, '') + '.com',
        contactPhone,
        value: Number(value) || 0,
        probability: Number(probability) || 20,
        stage,
        priority,
        expectedCloseDate,
        assignedRep,
        notes,
        nextAction,
        nextActionDate: '2026-10-16',
        tags: ['New Inbound'],
      },
      {
        autoScheduleCall,
        callTime,
        autoReminder,
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div>
            <h3 className="text-base font-semibold text-white">Create New Opportunity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Add to pipeline & sync with Android companion</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise Cloud ERP Migration"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Deal Value ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PipelineStage)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="lead">1. Discovery</option>
                <option value="qualified">2. Qualified</option>
                <option value="proposal">3. Proposal</option>
                <option value="negotiation">4. Negotiation</option>
                <option value="won">5. Won</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Win Prob %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Next Action</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Schedule discovery presentation"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Android Companion Auto-Sync Options */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
            <span className="text-slate-300 font-semibold block text-xs">
              Android Companion Auto-Sync
            </span>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScheduleCall}
                onChange={(e) => setAutoScheduleCall(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Put kickoff meeting on Android Calendar today at:</span>
                <input
                  type="time"
                  disabled={!autoScheduleCall}
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-white text-xs disabled:opacity-40"
                />
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReminder}
                onChange={(e) => setAutoReminder(e.target.checked)}
                className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-0"
              />
              <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Set Android notification reminder 30 min before call</span>
              </div>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
