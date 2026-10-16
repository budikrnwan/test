export type PipelineStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type Priority = 'low' | 'medium' | 'normal' | 'high' | 'urgent';

export interface PipelineDeal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  stage: PipelineStage;
  value: number;
  probability: number; // 0 - 100
  expectedCloseDate: string; // YYYY-MM-DD
  priority: Priority;
  tags: string[];
  notes: string;
  assignedRep: string;
  nextAction?: string;
  nextActionDate?: string; // YYYY-MM-DD
  createdAt: string;
  lastUpdated: string;
}

export type EventType = 'client_meeting' | 'demo' | 'proposal_review' | 'contract_signing' | 'follow_up' | 'internal_sync';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: string;
  type: EventType;
  dealId?: string; // linked to pipeline deal
  dealTitle?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  completed: boolean;
  reminderMinutesBefore: number;
}

export type ReminderCategory = 'call' | 'email' | 'quote' | 'follow_up' | 'contract' | 'task';

export interface ScheduleReminder {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:MM
  priority: Priority;
  category: ReminderCategory;
  dealId?: string;
  dealTitle?: string;
  completed: boolean;
  snoozedUntil?: string; // ISO string
  notes?: string;
}

export interface SyncLogItem {
  id: string;
  timestamp: string;
  source: 'pipeline' | 'android';
  action: string;
  target: string;
  details: string;
}

export type ActiveWorkspaceView = 'dual' | 'pipeline' | 'android';
