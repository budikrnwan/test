import React from 'react';
import { ScheduleReminder } from '../../types';
import { X, Bell, Clock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { playReminderAlarm } from '../../utils/audio';

interface AndroidNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: ScheduleReminder[];
  onCompleteReminder: (id: string) => void;
  onSnoozeReminder: (id: string, minutes: number) => void;
}

export const AndroidNotificationDrawer: React.FC<AndroidNotificationDrawerProps> = ({
  isOpen,
  onClose,
  reminders,
  onCompleteReminder,
  onSnoozeReminder,
}) => {
  if (!isOpen) return null;

  const activeReminders = reminders.filter((r) => !r.completed);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-slide-down select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Android Notifications
          </span>
          <span className="font-mono tabular-nums text-xs text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 rounded">
            {activeReminders.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {activeReminders.length > 0 ? (
          activeReminders.map((rem) => (
            <div
              key={rem.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Google Calendar & Reminder
                </span>
                <span className="font-mono tabular-nums">{rem.dueTime}</span>
              </div>

              <div className="text-xs font-semibold text-white mb-0.5">{rem.title}</div>
              {rem.dealTitle && (
                <div className="text-[11px] text-indigo-300 mb-2">
                  Linked Deal: {rem.dealTitle}
                </div>
              )}

              {/* Action Buttons inside notification */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onCompleteReminder(rem.id);
                  }}
                  className="flex-1 py-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Done</span>
                </button>

                <button
                  onClick={() => onSnoozeReminder(rem.id, 15)}
                  className="px-3 py-1.5 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>Snooze 15m</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs">No pending notifications</p>
          </div>
        )}
      </div>

      {/* Swipe up close handle */}
      <button
        onClick={onClose}
        className="pt-2 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ChevronDown className="w-4 h-4 rotate-180" />
        <span className="text-[10px]">Swipe or tap to dismiss</span>
      </button>
    </div>
  );
};
