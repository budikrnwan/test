import React, { useState, useEffect } from 'react';
import { CalendarEvent, ScheduleReminder, PipelineDeal, Priority, EventType, ReminderCategory } from '../../types';
import { X, Calendar, Bell, Building, Video, Clock } from 'lucide-react';
import { playAndroidChime, playReminderAlarm } from '../../utils/audio';

interface PutScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: PipelineDeal[];
  preselectedDealId?: string;
  initialMode?: 'schedule' | 'reminder';
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddReminder: (reminder: Omit<ScheduleReminder, 'id'>) => void;
}

export const PutScheduleModal: React.FC<PutScheduleModalProps> = ({
  isOpen,
  onClose,
  deals,
  preselectedDealId,
  initialMode = 'schedule',
  onAddEvent,
  onAddReminder,
}) => {
  const [mode, setMode] = useState<'schedule' | 'reminder'>(initialMode);
  const [dealId, setDealId] = useState<string>(preselectedDealId || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-16');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:45');
  const [dueTime, setDueTime] = useState('13:30');
  const [location, setLocation] = useState('Google Meet');
  const [eventType, setEventType] = useState<EventType>('client_meeting');
  const [reminderCategory, setReminderCategory] = useState<ReminderCategory>('call');
  const [priority, setPriority] = useState<Priority>('high');
  const [notes, setNotes] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);

  useEffect(() => {
    if (preselectedDealId) {
      setDealId(preselectedDealId);
      const matched = deals.find((d) => d.id === preselectedDealId);
      if (matched && !title) {
        if (mode === 'schedule') {
          setTitle(`Review & Demo: ${matched.company}`);
        } else {
          setTitle(`Follow up with ${matched.contactName} (${matched.company})`);
        }
      }
    }
    setMode(initialMode);
  }, [preselectedDealId, initialMode, isOpen]);

  if (!isOpen) return null;

  const selectedDeal = deals.find((d) => d.id === dealId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (mode === 'schedule') {
      onAddEvent({
        title: title.trim(),
        description: notes.trim() || `Scheduled call for ${selectedDeal?.company || 'meeting'}.`,
        date,
        startTime,
        endTime,
        location,
        type: eventType,
        dealId: dealId || undefined,
        dealTitle: selectedDeal?.title,
        attendeeName: selectedDeal?.contactName,
        attendeeEmail: selectedDeal?.contactEmail,
        completed: false,
        reminderMinutesBefore,
      });
      playAndroidChime();
    } else {
      onAddReminder({
        title: title.trim(),
        dueDate: date,
        dueTime,
        priority,
        category: reminderCategory,
        dealId: dealId || undefined,
        dealTitle: selectedDeal?.title,
        completed: false,
        notes,
      });
      playReminderAlarm();
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Android Material Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-base font-semibold text-white font-display">
                Android Companion Scheduler
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Selector (Segmented control) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setMode('schedule')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                mode === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Put Calendar Event</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('reminder')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-colors ${
                mode === 'reminder'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Android Reminder</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              {mode === 'schedule' ? 'Event Title *' : 'Reminder Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'schedule'
                  ? 'e.g. Solution Demo & Architecture Walkthrough'
                  : 'e.g. Send revised contract draft & follow up'
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Link to Pipeline Deal */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link with Pipeline Deal</span>
            </label>
            <select
              value={dealId}
              onChange={(e) => {
                setDealId(e.target.value);
                const d = deals.find((deal) => deal.id === e.target.value);
                if (d && !title) {
                  setTitle(
                    mode === 'schedule'
                      ? `Meeting: ${d.company} - ${d.title}`
                      : `Follow-up: ${d.company}`
                  );
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">None (Personal / Standalone)</option>
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company} · {d.title} (${d.value.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Schedule specific inputs */}
          {mode === 'schedule' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location / Link</label>
                  <div className="relative">
                    <Video className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Google Meet, Zoom, or Room"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="client_meeting">Client Meeting</option>
                    <option value="demo">Product Demo</option>
                    <option value="proposal_review">Proposal Review</option>
                    <option value="contract_signing">Contract Signing</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="internal_sync">Internal Sync</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Android Notification Alarm Timing</span>
                </label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before (Recommended)</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
            </>
          )}

          {/* Reminder specific inputs */}
          {mode === 'reminder' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={reminderCategory}
                    onChange={(e) => setReminderCategory(e.target.value as ReminderCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="call">Call Client</option>
                    <option value="email">Send Email</option>
                    <option value="quote">Pricing / Quote</option>
                    <option value="contract">Contract Review</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="task">General Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Notes / Agenda</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key talking points or instructions..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          {/* Instant sync note */}
          <div className="p-3 bg-slate-800/60 rounded-xl text-[11px] text-slate-400 border border-slate-700/50">
            {selectedDeal ? (
              <span className="text-emerald-400">
                ✓ Syncs with deal &quot;{selectedDeal.title}&quot; and updates its next action date.
              </span>
            ) : (
              <span>This schedule will be added to your Android Agenda and companion reminders.</span>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-medium text-white rounded-xl transition-colors shadow-sm ${
                mode === 'schedule'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {mode === 'schedule' ? 'Put Schedule on Calendar' : 'Set Android Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
