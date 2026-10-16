import React, { useState } from 'react';
import { PipelineDeal, CalendarEvent, ScheduleReminder, PipelineStage } from '../../types';
import { X, Calendar, Bell, Building, Mail, Phone, ExternalLink, Plus, CheckCircle2 } from 'lucide-react';
import { getGoogleCalendarUrl, downloadICalFile, formatFriendlyDate, formatTime12h } from '../../utils/calendarExport';

interface DealDetailModalProps {
  deal: PipelineDeal | null;
  onClose: () => void;
  onUpdateDeal: (deal: PipelineDeal) => void;
  linkedEvents: CalendarEvent[];
  linkedReminders: ScheduleReminder[];
  onOpenScheduleForDeal: (deal: PipelineDeal) => void;
  onOpenReminderForDeal: (deal: PipelineDeal) => void;
  onAdvanceToWon: (dealId: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  onClose,
  onUpdateDeal,
  linkedEvents,
  linkedReminders,
  onOpenScheduleForDeal,
  onOpenReminderForDeal,
  onAdvanceToWon,
}) => {
  if (!deal) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'calendar' | 'reminders'>('details');
  const [notes, setNotes] = useState(deal.notes || '');
  const [stage, setStage] = useState<PipelineStage>(deal.stage);
  const [value, setValue] = useState(deal.value);
  const [probability, setProbability] = useState(deal.probability);
  const [nextAction, setNextAction] = useState(deal.nextAction || '');

  const handleSave = () => {
    onUpdateDeal({
      ...deal,
      stage,
      value,
      probability,
      notes,
      nextAction,
      lastUpdated: '2026-10-16',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-850">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{deal.company}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-indigo-400 font-semibold text-sm">
                  ${deal.value.toLocaleString()}
                </span>
                <span aria-hidden="true">·</span>
                <span>Rep: {deal.assignedRep}</span>
              </div>
              <h2 className="text-xl font-bold text-white font-display">{deal.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stage Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Stage:</span>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as PipelineStage)}
                className="bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-md px-2.5 py-1 focus:outline-none focus:border-indigo-500"
              >
                <option value="lead">1. Discovery & Lead</option>
                <option value="qualified">2. Technical Qualified</option>
                <option value="proposal">3. Proposal & Demo</option>
                <option value="negotiation">4. Legal & Terms</option>
                <option value="won">5. Closed Won</option>
              </select>
            </div>

            {deal.stage !== 'won' && (
              <button
                onClick={() => {
                  onAdvanceToWon(deal.id);
                  setStage('won');
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Won 🎉</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-900 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Deal Specs & Contact
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android Calendar ({linkedEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Android Reminders ({linkedReminders.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Contact Card */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
                <div className="text-slate-300 font-semibold mb-2">Primary Stakeholder</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 text-[11px]">Full Name</div>
                    <div className="text-white font-medium">{deal.contactName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Email</div>
                    <a
                      href={`mailto:${deal.contactEmail}`}
                      className="text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{deal.contactEmail}</span>
                    </a>
                  </div>
                  {deal.contactPhone && (
                    <div>
                      <div className="text-slate-400 text-[11px]">Phone</div>
                      <div className="text-slate-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{deal.contactPhone}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-slate-400 text-[11px]">Target Close</div>
                    <div className="text-slate-200 font-mono tabular-nums">
                      {deal.expectedCloseDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financials & Win Prob */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                  <label className="text-slate-400 text-[11px] block mb-1">Deal Value ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono tabular-nums text-white"
                  />
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                  <label className="text-slate-400 text-[11px] block mb-1">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono tabular-nums text-white"
                  />
                </div>
              </div>

              {/* Next Action */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
                <label className="text-slate-400 text-[11px] block mb-1">Next Step Action</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Schedule revised demo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              {/* Deal Notes */}
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Internal Pipeline Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Calendar schedules synced with Android companion device
                </span>
                <button
                  onClick={() => onOpenScheduleForDeal(deal)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-600 hover:text-white border border-emerald-500/40 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Put Schedule on Android</span>
                </button>
              </div>

              {linkedEvents.length > 0 ? (
                <div className="space-y-2.5">
                  {linkedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{evt.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-emerald-400 font-medium">
                            {formatFriendlyDate(evt.date)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-slate-300">
                            {formatTime12h(evt.startTime)} – {formatTime12h(evt.endTime)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{evt.location}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={getGoogleCalendarUrl(evt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-blue-300 bg-blue-950/40 hover:bg-blue-600/60 border border-blue-500/30 rounded-md transition-colors"
                          title="Open directly in Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>
                        <button
                          onClick={() => downloadICalFile(evt)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                          title="Download .ics for Android Calendar"
                        >
                          .ics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No calendar schedules linked yet.</p>
                  <button
                    onClick={() => onOpenScheduleForDeal(deal)}
                    className="mt-3 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    + Put your first meeting on Android
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">
                  Android notification reminders for this opportunity
                </span>
                <button
                  onClick={() => onOpenReminderForDeal(deal)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-600 hover:text-white border border-amber-500/40 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Set Android Reminder</span>
                </button>
              </div>

              {linkedReminders.length > 0 ? (
                <div className="space-y-2.5">
                  {linkedReminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rem.completed ? 'bg-slate-500' : 'bg-amber-400'
                          }`}
                        ></span>
                        <div>
                          <div
                            className={`font-medium ${
                              rem.completed ? 'line-through text-slate-500' : 'text-white'
                            }`}
                          >
                            {rem.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Due {rem.dueDate}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{rem.dueTime}</span>
                            <span aria-hidden="true">·</span>
                            <span className="uppercase text-[10px] text-amber-400">
                              {rem.priority}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        {rem.completed ? 'Completed' : 'Active Alarm'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No reminders configured for this deal.</p>
                  <button
                    onClick={() => onOpenReminderForDeal(deal)}
                    className="mt-3 text-amber-400 hover:text-amber-300 font-medium"
                  >
                    + Set Android follow-up reminder
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-800 bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
