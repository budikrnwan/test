import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  PipelineDeal,
  CalendarEvent,
  ScheduleReminder,
  SyncLogItem,
  ActiveWorkspaceView,
  PipelineStage,
} from './types';
import { INITIAL_DEALS, INITIAL_EVENTS, INITIAL_REMINDERS } from './utils/mockData';
import { playDealWonCelebration, playAndroidChime, playReminderAlarm } from './utils/audio';

import { WorkspaceHeader } from './components/workspace/WorkspaceHeader';
import { SyncToast } from './components/workspace/SyncToast';
import { PipelineDashboard } from './components/pipeline/PipelineDashboard';
import { DealDetailModal } from './components/pipeline/DealDetailModal';
import { NewDealModal } from './components/pipeline/NewDealModal';
import { AndroidDeviceFrame } from './components/android/AndroidDeviceFrame';
import { AndroidCalendarApp } from './components/android/AndroidCalendarApp';
import { PutScheduleModal } from './components/android/PutScheduleModal';
import { AndroidNotificationDrawer } from './components/android/AndroidNotificationDrawer';

const STAGES_ORDER: PipelineStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won'];

export default function App() {
  const [deals, setDeals] = useState<PipelineDeal[]>(INITIAL_DEALS);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [reminders, setReminders] = useState<ScheduleReminder[]>(INITIAL_REMINDERS);
  const [activeView, setActiveView] = useState<ActiveWorkspaceView>('dual');

  // Modals & Panels state
  const [selectedDealForDetail, setSelectedDealForDetail] = useState<PipelineDeal | null>(null);
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [newDealDefaultStage, setNewDealDefaultStage] = useState<PipelineStage>('lead');

  const [isPutScheduleModalOpen, setIsPutScheduleModalOpen] = useState(false);
  const [preselectedDealId, setPreselectedDealId] = useState<string | undefined>(undefined);
  const [scheduleModalMode, setScheduleModalMode] = useState<'schedule' | 'reminder'>('schedule');

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [activeToast, setActiveToast] = useState<SyncLogItem | null>(null);

  // Sync Activity Audit Log
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([
    {
      id: 'log-1',
      timestamp: '10:42 AM',
      source: 'android',
      action: 'Calendar Synced',
      target: 'Google Calendar API',
      details: '5 upcoming events synced with Android system schedule',
    },
    {
      id: 'log-2',
      timestamp: '10:35 AM',
      source: 'pipeline',
      action: 'Deal Advanced',
      target: 'Apex Freight Systems',
      details: 'Stage shifted to Legal & Negotiation ($145,000)',
    },
  ]);

  const addSyncLog = (source: 'pipeline' | 'android', action: string, details: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: SyncLogItem = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      source,
      action,
      target: 'Sync Engine',
      details,
    };
    setSyncLogs((prev) => [newLog, ...prev]);
    setActiveToast(newLog);
    setLastSyncTime(timeStr);

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newLog.id ? null : current));
    }, 4500);
  };

  // Trigger manual sync
  const handleTriggerSync = () => {
    setIsSyncing(true);
    playAndroidChime();
    setTimeout(() => {
      setIsSyncing(false);
      addSyncLog('android', 'Manual Sync Completed', 'Refreshed all calendar items and reminders.');
    }, 700);
  };

  // Pipeline stage movement
  const handleMoveStage = (dealId: string, direction: 'next' | 'prev') => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== dealId) return deal;
        const currentIndex = STAGES_ORDER.indexOf(deal.stage);
        if (currentIndex === -1) return deal;

        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0 || nextIndex >= STAGES_ORDER.length) return deal;

        const newStage = STAGES_ORDER[nextIndex];
        const newProb =
          newStage === 'won'
            ? 100
            : newStage === 'negotiation'
            ? 85
            : newStage === 'proposal'
            ? 65
            : newStage === 'qualified'
            ? 45
            : 25;

        if (newStage === 'won') {
          playDealWonCelebration();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // fallback
          }
        }

        addSyncLog(
          'pipeline',
          `Deal Moved to ${newStage.toUpperCase()}`,
          `${deal.company} (${deal.title}) shifted to ${newStage}.`
        );

        return {
          ...deal,
          stage: newStage,
          probability: newProb,
          lastUpdated: '2026-10-16',
        };
      })
    );
  };

  const handleUpdateStage = (dealId: string, newStage: PipelineStage) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        if (newStage === 'won') {
          playDealWonCelebration();
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {
            // fallback
          }
        }
        addSyncLog(
          'pipeline',
          `Stage Updated`,
          `${d.company} updated to stage ${newStage}.`
        );
        return {
          ...d,
          stage: newStage,
          probability: newStage === 'won' ? 100 : d.probability,
          lastUpdated: '2026-10-16',
        };
      })
    );
  };

  // Quick action from Deal Card
  const handleQuickScheduleFromDeal = (deal: PipelineDeal) => {
    setPreselectedDealId(deal.id);
    setScheduleModalMode('schedule');
    setIsPutScheduleModalOpen(true);
  };

  const handleQuickReminderFromDeal = (deal: PipelineDeal) => {
    setPreselectedDealId(deal.id);
    setScheduleModalMode('reminder');
    setIsPutScheduleModalOpen(true);
  };

  // Add new deal
  const handleAddNewDeal = (
    dealData: Omit<PipelineDeal, 'id' | 'createdAt' | 'lastUpdated'>,
    options: { autoScheduleCall: boolean; callTime: string; autoReminder: boolean }
  ) => {
    const newDealId = `deal-${Date.now()}`;
    const newDeal: PipelineDeal = {
      ...dealData,
      id: newDealId,
      createdAt: '2026-10-16',
      lastUpdated: '2026-10-16',
    };

    setDeals((prev) => [newDeal, ...prev]);
    addSyncLog(
      'pipeline',
      'New Opportunity Created',
      `${newDeal.company} ($${newDeal.value.toLocaleString()}) added to pipeline.`
    );

    // Auto schedule kickoff call on Android if requested
    if (options.autoScheduleCall) {
      const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: `Kickoff & Discovery: ${newDeal.company}`,
        description: `Introductory qualification with ${newDeal.contactName}`,
        date: '2026-10-16',
        startTime: options.callTime,
        endTime: `${Number(options.callTime.split(':')[0]) + 1}:${options.callTime.split(':')[1]}`,
        location: 'Google Meet',
        type: 'client_meeting',
        dealId: newDealId,
        dealTitle: newDeal.title,
        attendeeName: newDeal.contactName,
        attendeeEmail: newDeal.contactEmail,
        completed: false,
        reminderMinutesBefore: 15,
      };
      setEvents((prev) => [newEvent, ...prev]);
      addSyncLog(
        'android',
        'Auto Scheduled on Android',
        `Kickoff meeting for ${newDeal.company} put on Android Calendar at ${options.callTime}.`
      );
    }

    if (options.autoReminder) {
      const newReminder: ScheduleReminder = {
        id: `rem-${Date.now()}`,
        title: `Prepare briefing notes for ${newDeal.company}`,
        dueDate: '2026-10-16',
        dueTime: options.callTime,
        priority: 'high',
        category: 'follow_up',
        dealId: newDealId,
        dealTitle: newDeal.title,
        completed: false,
      };
      setReminders((prev) => [newReminder, ...prev]);
    }
  };

  // Add Calendar Event
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setEvents((prev) => [newEvent, ...prev]);

    // If event is linked to a deal, update the deal's next action
    if (eventData.dealId) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === eventData.dealId
            ? {
                ...d,
                nextAction: eventData.title,
                nextActionDate: eventData.date,
                lastUpdated: '2026-10-16',
              }
            : d
        )
      );
    }

    addSyncLog(
      'android',
      'Calendar Schedule Put',
      `"${eventData.title}" scheduled for ${eventData.date} at ${eventData.startTime}.`
    );
  };

  // Add Reminder
  const handleAddReminder = (reminderData: Omit<ScheduleReminder, 'id'>) => {
    const newReminder: ScheduleReminder = {
      ...reminderData,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [newReminder, ...prev]);

    addSyncLog(
      'android',
      'Android Reminder Created',
      `Alarm set for "${reminderData.title}" at ${reminderData.dueTime}.`
    );
  };

  // Toggle complete event
  const handleToggleCompleteEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const newStatus = !e.completed;
        if (newStatus) playAndroidChime();
        addSyncLog(
          'android',
          newStatus ? 'Meeting Completed' : 'Meeting Reopened',
          `"${e.title}" marked as ${newStatus ? 'completed' : 'pending'}.`
        );
        return { ...e, completed: newStatus };
      })
    );
  };

  // Toggle complete reminder
  const handleToggleCompleteReminder = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== reminderId) return r;
        const newStatus = !r.completed;
        if (newStatus) playAndroidChime();
        addSyncLog(
          'android',
          newStatus ? 'Reminder Done' : 'Reminder Reopened',
          `"${r.title}" completed.`
        );
        return { ...r, completed: newStatus };
      })
    );
  };

  // Snooze reminder
  const handleSnoozeReminder = (reminderId: string, minutes: number) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== reminderId) return r;
        playAndroidChime();
        addSyncLog('android', 'Reminder Snoozed', `Snoozed "${r.title}" by ${minutes} minutes.`);
        return {
          ...r,
          snoozedUntil: new Date(Date.now() + minutes * 60000).toISOString(),
        };
      })
    );
  };

  // Update Deal details
  const handleUpdateDeal = (updatedDeal: PipelineDeal) => {
    setDeals((prev) => prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    addSyncLog('pipeline', 'Deal Details Updated', `Saved changes to ${updatedDeal.company}.`);
  };

  // Advance to Won from modal
  const handleAdvanceToWon = (dealId: string) => {
    handleMoveStage(dealId, 'next');
  };

  // Filter linked items for current selected deal
  const currentLinkedEvents = selectedDealForDetail
    ? events.filter((e) => e.dealId === selectedDealForDetail.id)
    : [];

  const currentLinkedReminders = selectedDealForDetail
    ? reminders.filter((r) => r.dealId === selectedDealForDetail.id)
    : [];

  const activeRemindersCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Workspace Header */}
      <WorkspaceHeader
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewDeal={() => {
          setNewDealDefaultStage('lead');
          setIsNewDealModalOpen(true);
        }}
        onOpenNewSchedule={() => {
          setPreselectedDealId(undefined);
          setScheduleModalMode('schedule');
          setIsPutScheduleModalOpen(true);
        }}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* VIEW 1: DUAL APP MODE (Side-by-Side Live Synchronization) */}
        {activeView === 'dual' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Pipeline Management CRM */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
              <PipelineDashboard
                deals={deals}
                reminders={reminders}
                onSelectDeal={(deal) => setSelectedDealForDetail(deal)}
                onMoveStage={handleMoveStage}
                onUpdateStage={handleUpdateStage}
                onQuickSchedule={handleQuickScheduleFromDeal}
                onQuickReminder={handleQuickReminderFromDeal}
                onAddNewDeal={(stage) => {
                  setNewDealDefaultStage(stage || 'lead');
                  setIsNewDealModalOpen(true);
                }}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
            </div>

            {/* Right Column: Android Calendar Schedule & Reminder Companion */}
            <div className="w-full lg:w-[440px] xl:w-[480px] bg-slate-900/60 p-4 lg:p-6 flex items-center justify-center overflow-y-auto shrink-0 border-l border-slate-800/80">
              <AndroidDeviceFrame
                activeRemindersCount={activeRemindersCount}
                onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
                showPhoneChassis={true}
              >
                <AndroidCalendarApp
                  events={events}
                  reminders={reminders}
                  deals={deals}
                  syncLogs={syncLogs}
                  onOpenPutSchedule={() => {
                    setPreselectedDealId(undefined);
                    setScheduleModalMode('schedule');
                    setIsPutScheduleModalOpen(true);
                  }}
                  onToggleCompleteEvent={handleToggleCompleteEvent}
                  onToggleCompleteReminder={handleToggleCompleteReminder}
                  onSnoozeReminder={handleSnoozeReminder}
                  onDeleteReminder={(id) => setReminders((prev) => prev.filter((r) => r.id !== id))}
                  onSelectDealFromAndroid={(dealId) => {
                    const match = deals.find((d) => d.id === dealId);
                    if (match) setSelectedDealForDetail(match);
                  }}
                />

                <AndroidNotificationDrawer
                  isOpen={isNotificationDrawerOpen}
                  onClose={() => setIsNotificationDrawerOpen(false)}
                  reminders={reminders}
                  onCompleteReminder={handleToggleCompleteReminder}
                  onSnoozeReminder={handleSnoozeReminder}
                />
              </AndroidDeviceFrame>
            </div>
          </div>
        )}

        {/* VIEW 2: FULLSCREEN PIPELINE MANAGEMENT */}
        {activeView === 'pipeline' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <PipelineDashboard
              deals={deals}
              reminders={reminders}
              onSelectDeal={(deal) => setSelectedDealForDetail(deal)}
              onMoveStage={handleMoveStage}
              onUpdateStage={handleUpdateStage}
              onQuickSchedule={handleQuickScheduleFromDeal}
              onQuickReminder={handleQuickReminderFromDeal}
              onAddNewDeal={(stage) => {
                setNewDealDefaultStage(stage || 'lead');
                setIsNewDealModalOpen(true);
              }}
              onTriggerSync={handleTriggerSync}
              isSyncing={isSyncing}
            />
          </div>
        )}

        {/* VIEW 3: FULLSCREEN ANDROID COMPANION APP */}
        {activeView === 'android' && (
          <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-slate-900/70 overflow-y-auto">
            <AndroidDeviceFrame
              activeRemindersCount={activeRemindersCount}
              onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
              showPhoneChassis={true}
            >
              <AndroidCalendarApp
                events={events}
                reminders={reminders}
                deals={deals}
                syncLogs={syncLogs}
                onOpenPutSchedule={() => {
                  setPreselectedDealId(undefined);
                  setScheduleModalMode('schedule');
                  setIsPutScheduleModalOpen(true);
                }}
                onToggleCompleteEvent={handleToggleCompleteEvent}
                onToggleCompleteReminder={handleToggleCompleteReminder}
                onSnoozeReminder={handleSnoozeReminder}
                onDeleteReminder={(id) => setReminders((prev) => prev.filter((r) => r.id !== id))}
                onSelectDealFromAndroid={(dealId) => {
                  const match = deals.find((d) => d.id === dealId);
                  if (match) setSelectedDealForDetail(match);
                }}
              />

              <AndroidNotificationDrawer
                isOpen={isNotificationDrawerOpen}
                onClose={() => setIsNotificationDrawerOpen(false)}
                reminders={reminders}
                onCompleteReminder={handleToggleCompleteReminder}
                onSnoozeReminder={handleSnoozeReminder}
              />
            </AndroidDeviceFrame>
          </div>
        )}
      </main>

      {/* Floating Sync Toast Notification */}
      <SyncToast toast={activeToast} onDismiss={() => setActiveToast(null)} />

      {/* MODAL 1: Deal Detail & Linked Android Schedule Modal */}
      <DealDetailModal
        deal={selectedDealForDetail}
        onClose={() => setSelectedDealForDetail(null)}
        onUpdateDeal={handleUpdateDeal}
        linkedEvents={currentLinkedEvents}
        linkedReminders={currentLinkedReminders}
        onOpenScheduleForDeal={(deal) => {
          setPreselectedDealId(deal.id);
          setScheduleModalMode('schedule');
          setIsPutScheduleModalOpen(true);
        }}
        onOpenReminderForDeal={(deal) => {
          setPreselectedDealId(deal.id);
          setScheduleModalMode('reminder');
          setIsPutScheduleModalOpen(true);
        }}
        onAdvanceToWon={handleAdvanceToWon}
      />

      {/* MODAL 2: Create New Deal Opportunity */}
      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        defaultStage={newDealDefaultStage}
        onSubmit={handleAddNewDeal}
      />

      {/* MODAL 3: Put Calendar Schedule & Set Reminder */}
      <PutScheduleModal
        isOpen={isPutScheduleModalOpen}
        onClose={() => setIsPutScheduleModalOpen(false)}
        deals={deals}
        preselectedDealId={preselectedDealId}
        initialMode={scheduleModalMode}
        onAddEvent={handleAddEvent}
        onAddReminder={handleAddReminder}
      />
    </div>
  );
}
