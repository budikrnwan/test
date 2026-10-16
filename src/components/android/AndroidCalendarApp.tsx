import React, { useState } from 'react';
import { CalendarEvent, ScheduleReminder, PipelineDeal, SyncLogItem } from '../../types';
import {
  Calendar,
  Bell,
  Activity,
  Plus,
  ExternalLink,
  Download,
  CheckCircle2,
  Clock,
  MapPin,
  Volume2,
  CalendarCheck,
  Building,
  RotateCw
} from 'lucide-react';
import { getGoogleCalendarUrl, downloadICalFile, formatFriendlyDate, formatTime12h } from '../../utils/calendarExport';
import { playAndroidChime, playReminderAlarm } from '../../utils/audio';

interface AndroidCalendarAppProps {
  events: CalendarEvent[];
  reminders: ScheduleReminder[];
  deals: PipelineDeal[];
  syncLogs: SyncLogItem[];
  onOpenPutSchedule: () => void;
  onToggleCompleteEvent: (eventId: string) => void;
  onToggleCompleteReminder: (reminderId: string) => void;
  onSnoozeReminder: (reminderId: string, minutes: number) => void;
  onDeleteReminder: (reminderId: string) => void;
  onSelectDealFromAndroid?: (dealId: string) => void;
}

export const AndroidCalendarApp: React.FC<AndroidCalendarAppProps> = ({
  events,
  reminders,
  deals,
  syncLogs,
  onOpenPutSchedule,
  onToggleCompleteEvent,
  onToggleCompleteReminder,
  onSnoozeReminder,
  onDeleteReminder,
  onSelectDealFromAndroid,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'reminders' | 'sync'>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-16');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // Days for the horizontal date scroller (centered around 2026-10-16)
  const scrollerDays = [
    { label: 'Wed', num: '14', full: '2026-10-14' },
    { label: 'Thu', num: '15', full: '2026-10-15' },
    { label: 'Fri', num: '16', full: '2026-10-16', isToday: true },
    { label: 'Sat', num: '17', full: '2026-10-17' },
    { label: 'Sun', num: '18', full: '2026-10-18' },
    { label: 'Mon', num: '19', full: '2026-10-19' },
    { label: 'Tue', num: '20', full: '2026-10-20' },
  ];

  // Filter events for selected day, or show all if today has none
  const filteredEvents = events.filter((e) => e.date === selectedDate);
  const otherUpcomingEvents = events.filter((e) => e.date !== selectedDate);

  const pendingReminders = reminders.filter((r) => !r.completed);
  const completedReminders = reminders.filter((r) => r.completed);

  const displayedReminders =
    reminderFilter === 'pending'
      ? pendingReminders
      : reminderFilter === 'completed'
      ? completedReminders
      : reminders;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative select-none">
      {/* Top Android Material 3 App Bar */}
      <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            31
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
              <span>Google Calendar</span>
              <span className="text-[10px] text-emerald-400 font-mono font-normal bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                Live Sync
              </span>
            </h1>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>October 2026</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">San Francisco (PDT)</span>
            </div>
          </div>
        </div>

        {/* Audio Alarm Test Trigger */}
        <button
          onClick={() => {
            playAndroidChime();
          }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-800 transition-colors"
          title="Test Android Notification Chime"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Date Scroller (Material Calendar Strip) */}
      {activeTab === 'agenda' && (
        <div className="px-3 py-2 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto shrink-0 flex items-center gap-1.5 scrollbar-none">
          {scrollerDays.map((d) => {
            const isSelected = selectedDate === d.full;
            const hasEvents = events.some((e) => e.date === d.full);

            return (
              <button
                key={d.full}
                onClick={() => setSelectedDate(d.full)}
                className={`flex-1 min-w-[48px] py-2 px-1 flex flex-col items-center justify-center rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">{d.label}</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums mt-0.5 ${
                    isSelected ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {d.num}
                </span>
                {hasEvents && (
                  <span
                    className={`w-1 h-1 rounded-full mt-1 ${
                      isSelected ? 'bg-white' : 'bg-emerald-400'
                    }`}
                  ></span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Tab Content Viewport */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        {/* TAB 1: AGENDA & TIME SLOTS */}
        {activeTab === 'agenda' && (
          <div className="space-y-3">
            {/* Header for Day */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-300">
                {selectedDate === '2026-10-16' ? "Today's Schedule" : formatFriendlyDate(selectedDate)}
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                {filteredEvents.length} events
              </span>
            </div>

            {/* Events for this day */}
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`bg-slate-900/80 border rounded-2xl p-3.5 transition-all relative ${
                    evt.completed
                      ? 'border-slate-800 opacity-60'
                      : 'border-slate-800/90 hover:border-emerald-500/40'
                  }`}
                >
                  {/* Time row & Type */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono tabular-nums font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {formatTime12h(evt.startTime)} – {formatTime12h(evt.endTime)}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleCompleteEvent(evt.id)}
                      className={`min-h-[32px] px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors ${
                        evt.completed
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{evt.completed ? 'Done' : 'Mark Done'}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      evt.completed ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {evt.title}
                  </h3>

                  {/* Linked Pipeline Deal Indicator */}
                  {evt.dealTitle && (
                    <div className="mb-2">
                      <button
                        onClick={() => evt.dealId && onSelectDealFromAndroid?.(evt.dealId)}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/40 border border-indigo-500/20 px-2 py-0.5 rounded-lg transition-colors text-left"
                      >
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[260px]">Deal: {evt.dealTitle}</span>
                      </button>
                    </div>
                  )}

                  {/* Location & Attendee */}
                  <div className="space-y-1 text-[11px] text-slate-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    {evt.attendeeName && (
                      <div className="text-slate-400">
                        Attendee: <span className="text-slate-200">{evt.attendeeName}</span>
                      </div>
                    )}
                  </div>

                  {/* External Actions (Google Calendar Link & .ics download) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[36px] flex items-center justify-center gap-1.5 text-[11px] font-medium text-blue-300 bg-blue-950/40 hover:bg-blue-600 hover:text-white border border-blue-500/30 rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in Google Cal</span>
                    </a>

                    <button
                      onClick={() => downloadICalFile(evt)}
                      className="min-h-[36px] px-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                      title="Download .ics for Android"
                    >
                      <Download className="w-3 h-3" />
                      <span>.ics</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No events scheduled for this day.</p>
                <button
                  onClick={onOpenPutSchedule}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                >
                  + Put Schedule Now
                </button>
              </div>
            )}

            {/* Other upcoming events preview */}
            {otherUpcomingEvents.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-400 px-1 mb-2">
                  Other Upcoming Schedules
                </div>
                <div className="space-y-2">
                  {otherUpcomingEvents.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedDate(e.date)}
                      className="p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-white truncate max-w-[210px]">
                          {e.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatFriendlyDate(e.date)} · {formatTime12h(e.startTime)}
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded">
                        View
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REMINDERS & ALARMS */}
        {activeTab === 'reminders' && (
          <div className="space-y-3">
            {/* Filter Pill Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {(['pending', 'all', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReminderFilter(f)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    reminderFilter === f
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'pending' ? `Pending (${pendingReminders.length})` : f}
                </button>
              ))}
            </div>

            {/* Reminders list */}
            {displayedReminders.length > 0 ? (
              displayedReminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`bg-slate-900/80 border rounded-2xl p-3.5 transition-all ${
                    rem.completed
                      ? 'border-slate-800/50 opacity-60'
                      : 'border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox trigger */}
                    <button
                      onClick={() => onToggleCompleteReminder(rem.id)}
                      className={`min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 -m-2 ${
                        rem.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-amber-400'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          rem.completed
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'border-slate-600 hover:border-amber-400'
                        }`}
                      >
                        {rem.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] uppercase font-semibold tracking-wider ${
                            rem.priority === 'urgent'
                              ? 'text-rose-400'
                              : rem.priority === 'high'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {rem.priority} priority
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-400">
                          {rem.dueTime}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-semibold mt-0.5 ${
                          rem.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {rem.title}
                      </h4>

                      {rem.dealTitle && (
                        <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[200px]">Deal: {rem.dealTitle}</span>
                        </div>
                      )}

                      {rem.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">{rem.notes}</p>
                      )}

                      {/* Snooze & Alarm test buttons */}
                      {!rem.completed && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] text-slate-500">Snooze:</span>
                          <button
                            onClick={() => onSnoozeReminder(rem.id, 15)}
                            className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                          >
                            +15m
                          </button>
                          <button
                            onClick={() => onSnoozeReminder(rem.id, 60)}
                            className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                          >
                            +1h
                          </button>
                          <button
                            onClick={() => onSnoozeReminder(rem.id, 1440)}
                            className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                          >
                            +1d
                          </button>

                          <button
                            onClick={() => playReminderAlarm()}
                            className="ml-auto text-amber-400 hover:text-amber-300 p-1 rounded"
                            title="Test alarm sound"
                          >
                            <Bell className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No reminders in this view.</p>
                <button
                  onClick={onOpenPutSchedule}
                  className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors"
                >
                  + Add Android Reminder
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SYNC HUB & AUDIT LOG */}
        {activeTab === 'sync' && (
          <div className="space-y-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Live Companion Bridge</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Actions taken in either the Pipeline Management CRM or this Android device are
                instantly mirrored in real-time.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-400 px-1">Sync Activity Log</div>

            <div className="space-y-2">
              {syncLogs.slice(0, 15).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span
                      className={`font-semibold uppercase tracking-wider ${
                        log.source === 'pipeline' ? 'text-indigo-400' : 'text-emerald-400'
                      }`}
                    >
                      {log.source === 'pipeline' ? 'Pipeline CRM' : 'Android OS'}
                    </span>
                    <span className="font-mono tabular-nums">{log.timestamp}</span>
                  </div>
                  <div className="font-medium text-white">{log.action}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (Android FAB) */}
      <button
        onClick={onOpenPutSchedule}
        className="absolute right-4 bottom-16 min-h-[52px] min-w-[52px] bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-950/80 flex items-center justify-center transition-all z-20"
        title="Put Calendar Schedule or Reminder"
      >
        <Plus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
      </button>

      {/* Android Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-3 items-center z-10 px-2">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'agenda' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            activeTab === 'reminders' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {pendingReminders.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {pendingReminders.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Reminders</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'sync' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">Sync Hub</span>
        </button>
      </div>
    </div>
  );
};
