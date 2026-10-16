import { CalendarEvent } from '../types';

/**
 * Formats date and time into Google Calendar / iCal UTC format (YYYYMMDDTHHmmssZ)
 */
function toICalDate(dateStr: string, timeStr: string): string {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  const d = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
  
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Generates an open-in Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = toICalDate(event.date, event.startTime);
  const end = toICalDate(event.date, event.endTime);
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nLinked Pipeline Deal: ${event.dealTitle || 'None'}\nAttendee: ${event.attendeeName || 'N/A'} (${event.attendeeEmail || ''})`
  );
  const location = encodeURIComponent(event.location || 'Google Meet');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

/**
 * Downloads a standard .ics (iCalendar) file compatible with Android, Google Calendar, iOS, Outlook
 */
export function downloadICalFile(event: CalendarEvent): void {
  const start = toICalDate(event.date, event.startTime);
  const end = toICalDate(event.date, event.endTime);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nexus CRM//Android Calendar Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@nexus-crm.internal`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')} (Deal: ${event.dealTitle || 'N/A'})`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${event.reminderMinutesBefore || 15}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${event.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a date string (YYYY-MM-DD) to a human-readable format
 */
export function formatFriendlyDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats time 24h (14:30) to 12h (2:30 PM)
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}
