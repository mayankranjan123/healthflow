import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle, Clock, XCircle, AlertCircle, Info } from 'lucide-react';
import { DoctorCalendarAppointment } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface WeeklyCalendarProps {
  appointments: DoctorCalendarAppointment[];
  onAddAppointment: (newApp: Omit<DoctorCalendarAppointment, 'id'>) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  appointments,
  onAddAppointment,
}) => {
  // Initialize to the week of Oct 23, 2023 to match the screenshot perfectly
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return getStartOfWeek(new Date());
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedViewAppointment, setSelectedViewAppointment] = useState<DoctorCalendarAppointment | null>(null);

  const calendarBodyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const startOfCurrentWeek = getStartOfWeek(new Date());
    if (isSameDay(currentWeekStart, startOfCurrentWeek)) {
      setTimeout(() => {
        if (calendarBodyRef.current) {
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();
          const totalMin = hours * 60 + minutes;

          const totalHours = 24;
          const scrollHeight = calendarBodyRef.current.scrollHeight;
          const percentage = totalMin / (totalHours * 60);
          const targetScrollTop = scrollHeight * percentage - (calendarBodyRef.current.clientHeight / 2);

          calendarBodyRef.current.scrollTop = Math.max(0, targetScrollTop);
        }
      }, 100);
    }
  }, [currentWeekStart]);

  const [newBooking, setNewBooking] = useState({
    patientName: '',
    patientNumber: '',
    date: formatDateString(new Date()),
    startTime: '10:00',
    duration: '60',
    status: 'CONFIRMED' as const,
    reason: '',
  });

  // Hour height in rem
  const hourHeight = 5.5; // matches 88px approx
  const hoursList = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00',
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00', '23:00'
  ];

  // Helper to add/subtract days
  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Get week dates (Monday to Sunday)
  const getWeekDates = (start: Date): Date[] => {
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleGoToToday = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  // Check if dates are same day
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Format week range label (e.g. "Oct 23 - Oct 29, 2023")
  const formatWeekRange = (dates: Date[]): string => {
    if (dates.length === 0) return '';
    const start = dates[0];
    const end = dates[6];

    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  // Helper to get total minutes from 00:00 (Midnight)
  const getMinutesFromMidnight = (timeStr: string): number => {
    const clean = timeStr.trim().toUpperCase();
    const is12Hour = clean.includes('AM') || clean.includes('PM');
    const timePart = clean.replace(/[AP]M/, '').trim();
    const [hStr, mStr] = timePart.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);

    if (is12Hour) {
      const isPm = clean.includes('PM');
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
    }

    return h * 60 + m;
  };

  // Parse duration of appointments
  const getAppointmentPlacement = (app: DoctorCalendarAppointment) => {
    const startMin = getMinutesFromMidnight(app.startTime);
    let durationMin = 60;

    if (app.endTime) {
      const endMin = getMinutesFromMidnight(app.endTime);
      if (endMin > startMin) {
        durationMin = endMin - startMin;
      }
    }

    // Top position in rem (minutes / 60 * hourHeight)
    const topRem = (startMin / 60) * hourHeight;
    // Height in rem (durationMin / 60 * hourHeight)
    const heightRem = (durationMin / 60) * hourHeight;

    return { top: `${topRem}rem`, height: `${heightRem}rem` };
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate end time
    const startMin = getMinutesFromMidnight(newBooking.startTime); // Absolute minutes
    const durNum = parseInt(newBooking.duration, 10);
    const endMinTotal = startMin + durNum;

    const formatTime = (totalMin: number): string => {
      let h = Math.floor(totalMin / 60) % 24;
      const m = totalMin % 60;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(h)}:${pad(m)}`;
    };

    const endTimeStr = formatTime(endMinTotal);

    onAddAppointment({
      patientName: newBooking.patientName,
      patientNumber: newBooking.patientNumber || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newBooking.date,
      startTime: newBooking.startTime,
      endTime: endTimeStr,
      status: newBooking.status,
      reason: newBooking.reason,
    });

    setIsBookingOpen(false);
    setNewBooking({
      patientName: '',
      patientNumber: '',
      date: formatDateString(new Date()),
      startTime: '10:00',
      duration: '60',
      status: 'CONFIRMED',
      reason: '',
    });
  };

  // Separate appointments in this week (excluding CANCELLED appointments from calendar grid)
  const getAppointmentsByDay = (dateStr: string) => {
    return appointments.filter((app) => app.date === dateStr && app.status !== 'CANCELLED');
  };

  // Determine appointment status styling
  const getAppointmentStyles = (status: DoctorCalendarAppointment['status']) => {
    switch (status) {
      case 'DONE':
        return {
          card: 'bg-[#F1F5F9] border-l-4 border-slate-400 hover:bg-slate-200 text-slate-800',
          badge: 'bg-slate-200 text-slate-700',
          detail: 'text-slate-500 font-mono text-[11px]',
          title: 'text-xs font-bold text-slate-800',
          desc: 'text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight',
        };
      case 'CANCELLED':
        return {
          card: 'bg-[#FEF2F2] border-l-4 border-red-400 hover:bg-red-100 text-red-800',
          badge: 'bg-red-200 text-red-700',
          detail: 'text-red-500 font-mono text-[11px]',
          title: 'text-xs font-bold text-red-800',
          desc: 'text-[10px] text-red-500 line-clamp-2 mt-1 leading-tight',
        };
      case 'LIVE':
        return {
          card: 'bg-[#1E40AF] hover:bg-blue-900 text-white border-l-4 border-blue-400 shadow-md ring-2 ring-blue-400/50',
          badge: 'bg-sky-400/30 text-sky-200 border border-sky-400/50 font-extrabold',
          detail: 'text-sky-200 font-mono text-[11px]',
          title: 'text-xs font-bold text-white',
          desc: 'text-[10px] text-sky-100 line-clamp-2 mt-1 leading-normal',
        };
      case 'CONFIRMED':
        return {
          card: 'bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-green-100 text-green-800',
          badge: 'bg-[#DCFCE7] text-green-700',
          detail: 'text-green-600 font-mono text-[11px]',
          title: 'text-xs font-bold text-slate-800',
          desc: 'text-[10px] text-slate-500 line-clamp-2 mt-1 leading-tight',
        };
      case 'UPCOMING':
      default:
        return {
          card: 'bg-[#2563EB] hover:bg-blue-700 text-white border-l-4 border-blue-300 shadow-sm',
          badge: 'bg-blue-500 text-blue-100 border border-blue-400',
          detail: 'text-blue-100 font-mono text-[11px]',
          title: 'text-xs font-bold text-white',
          desc: 'text-[10px] text-blue-500 line-clamp-2 mt-1 leading-tight',
        };
    }
  };

  // Determine if we should show the red current-time marker
  const getRedLineTop = (): number => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMin = hours * 60 + minutes;
    return Math.max(0, Math.min(24 * hourHeight, (totalMin / 60) * hourHeight));
  };
  const redLineTop = getRedLineTop();

  const todayStr = formatDateString(new Date());

  // Flatten appointments for the upcoming list and history lists
  const upcomingAppointments = appointments
    .filter(a => (a.status === 'UPCOMING' || a.status === 'CONFIRMED' || a.status === 'LIVE') && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || getMinutesFromMidnight(a.startTime) - getMinutesFromMidnight(b.startTime));

  const historyAppointments = appointments
    .filter(a => a.status === 'DONE' || a.status === 'CANCELLED' || ((a.status === 'UPCOMING' || a.status === 'CONFIRMED' || a.status === 'LIVE') && a.date < todayStr))
    .sort((a, b) => b.date.localeCompare(a.date) || getMinutesFromMidnight(b.startTime) - getMinutesFromMidnight(a.startTime));

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Week switcher */}
          <button
            id="prev-week"
            onClick={handlePrevWeek}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 min-w-[170px] text-center">
            {formatWeekRange(weekDates)}
          </div>

          <button
            id="next-week"
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            id="today-week"
            onClick={handleGoToToday}
            className="ml-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-500">
            <span className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">Day</span>
            <span className="px-3 py-1.5 rounded-md bg-white text-blue-600 shadow-xs cursor-default">Week</span>
            <span className="px-3 py-1.5 rounded-md text-slate-400 cursor-not-allowed">Month</span>
          </div>

          {/* <Button
            id="book-appointment-btn"
            onClick={() => setIsBookingOpen(true)}
            size="sm"
            className="shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Book Slot</span>
          </Button> */}
        </div>
      </div>

      {/* Main Weekly Grid Canvas */}
      <div className="bg-white border border-slate-150 rounded-xl shadow-xs overflow-hidden">
        {/* Calendar Grid Container */}
        <div className="overflow-x-auto">
          <div ref={calendarBodyRef} className="min-w-[950px] max-h-[600px] overflow-y-auto select-none">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-slate-150 bg-slate-50 sticky top-0 z-30">
              {/* Corner spacer */}
              <div className="border-r border-slate-150 py-3.5" />

              {weekDates.map((date, index) => {
                const isToday = isSameDay(date, new Date());
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const dayNum = date.getDate();

                return (
                  <div
                    key={index}
                    className={`text-center py-3 border-r border-slate-150 last:border-r-0 flex flex-col justify-center items-center ${isToday ? 'bg-blue-50/50' : ''
                      }`}
                  >
                    <span className={`text-[10px] font-bold tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                      {dayName}
                    </span>
                    <span className={`text-xl font-extrabold mt-1 leading-none ${isToday ? 'text-blue-600 bg-blue-100/50 w-8 h-8 rounded-full flex items-center justify-center' : 'text-slate-800'
                      }`}>
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timelines and Columns Body */}
            <div className="relative grid grid-cols-8" style={{ height: `${hoursList.length * hourHeight}rem` }}>

              {/* Hour Grid Lines Background */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {hoursList.map((_, i) => (
                  <div key={i} className="border-b border-slate-100 last:border-b-0" style={{ height: `${hourHeight}rem` }} />
                ))}
              </div>

              {/* Time Slots Column */}
              <div className="border-r border-slate-150 bg-slate-50/50 flex flex-col text-[11px] font-bold text-slate-500 pr-3 font-mono">
                {hoursList.map((hour, i) => (
                  <div
                    key={i}
                    className="flex justify-end pt-2 border-r border-slate-100"
                    style={{ height: `${hourHeight}rem` }}
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDates.map((date, dayIndex) => {
                const dateStr = formatDateString(date);
                const dayApps = getAppointmentsByDay(dateStr);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={dayIndex}
                    className={`relative border-r border-slate-150 last:border-r-0 h-full ${isToday ? 'bg-blue-50/10' : ''
                      }`}
                  >
                    {/* Vertical guideline */}
                    <div className="absolute inset-y-0 left-0 border-l border-slate-100 pointer-events-none" />

                    {/* Render Appointment Cards absolutely placed */}
                    {dayApps.map((app) => {
                      const placement = getAppointmentPlacement(app);
                      const styles = getAppointmentStyles(app.status);

                      return (
                        <div
                          id={`app-card-${app.id}`}
                          key={app.id}
                          onClick={() => setSelectedViewAppointment(app)}
                          style={{
                            position: 'absolute',
                            top: placement.top,
                            height: placement.height,
                            left: '4px',
                            right: '4px',
                          }}
                          className={`rounded-xl p-2 border transition-all duration-200 z-10 flex flex-col justify-between group overflow-hidden cursor-pointer ${styles.card}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={styles.title} title={app.patientName}>
                                {app.patientName}
                              </span>

                              {/* Tiny Custom Capsule Status */}
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-extrabold uppercase shrink-0 ${styles.badge}`}>
                                {app.status}
                              </span>
                            </div>

                            {/* Duration text */}
                            <span className={`block mt-0.5 ${styles.detail}`}>
                              {app.startTime} {app.endTime ? ` - ${app.endTime}` : ''}
                            </span>

                            {/* Reason Description */}
                            {app.reason && (
                              <p className={styles.desc} title={app.reason}>
                                {app.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* TODAY'S RED LINE MARKER */}
                    {isToday && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{ top: `${redLineTop}rem` }}
                      >
                        {/* Red Dot on Left */}
                        <div className="w-2 h-2 rounded-full bg-red-600 -ml-1 shrink-0" />
                        {/* Line itself */}
                        <div className="w-full h-0.5 bg-red-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment History & Upcoming Lists Side-by-Side (Matches requested: Show appointment history and upcoming appointments) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments list */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-500" />
              <span>Upcoming Appointments ({upcomingAppointments.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Chronological order</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {upcomingAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-sm">No upcoming appointments scheduled</p>
              </div>
            ) : (
              upcomingAppointments.map((app) => (
                <div
                  id={`upcoming-list-item-${app.id}`}
                  key={app.id}
                  onClick={() => setSelectedViewAppointment(app)}
                  className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{app.patientName}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-150 px-1.5 py-0.5 rounded font-mono">
                        {app.patientNumber || 'PT-XXXX'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {new Date(app.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{app.startTime}</span>
                    </p>
                    {app.reason && <p className="text-xs text-slate-500 line-clamp-1 italic">{app.reason}</p>}
                  </div>

                  <Badge variant={app.status === 'LIVE' ? 'warning' : 'info'}>
                    {app.status === 'LIVE' ? 'Live Consult' : 'Confirmed'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointment History list */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-slate-500" />
              <span>Appointment History ({historyAppointments.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recent sessions</span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {historyAppointments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Info className="w-8 h-8 text-slate-300" />
                <p className="text-sm">No historical records available</p>
              </div>
            ) : (
              historyAppointments.map((app) => (
                <div
                  id={`history-list-item-${app.id}`}
                  key={app.id}
                  onClick={() => setSelectedViewAppointment(app)}
                  className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{app.patientName}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-150 px-1.5 py-0.5 rounded font-mono">
                        {app.patientNumber || 'PT-XXXX'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                        {new Date(app.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{app.startTime}</span>
                    </p>
                    {app.reason && <p className="text-xs text-slate-500 line-clamp-1 italic">{app.reason}</p>}
                    {app.notes && (
                      <div className="mt-1.5 bg-slate-100 p-2 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                        <strong>Clinical Notes:</strong> {app.notes}
                      </div>
                    )}
                  </div>

                  <Badge variant={app.status === 'DONE' ? 'success' : 'danger'}>
                    {app.status === 'DONE' ? 'Completed' : 'Cancelled'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      <Modal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title="Schedule New Appointment Slot"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Input
            id="book-patient-name"
            label="Patient Full Name"
            placeholder="e.g. Michael Chang"
            value={newBooking.patientName}
            onChange={(val) => setNewBooking({ ...newBooking, patientName: val.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="book-patient-id"
              label="Patient ID (Optional)"
              placeholder="e.g. PT-3092"
              value={newBooking.patientNumber}
              onChange={(val) => setNewBooking({ ...newBooking, patientNumber: val.target.value })}
            />
            <Input
              id="book-date"
              label="Date"
              type="date"
              value={newBooking.date}
              onChange={(val) => setNewBooking({ ...newBooking, date: val.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              id="book-time"
              label="Start Time"
              value={newBooking.startTime}
              onChange={(val) => setNewBooking({ ...newBooking, startTime: val.target.value })}
              options={[
                { value: '09:00', label: '09:00' },
                { value: '10:00', label: '10:00' },
                { value: '11:00', label: '11:00' },
                { value: '12:00', label: '12:00' },
                { value: '13:00', label: '13:00' },
                { value: '14:00', label: '14:00' },
                { value: '15:00', label: '15:00' },
                { value: '16:00', label: '16:00' },
              ]}
            />

            <Select
              id="book-duration"
              label="Duration"
              value={newBooking.duration}
              onChange={(val) => setNewBooking({ ...newBooking, duration: val.target.value })}
              options={[
                { value: '30', label: '30 mins' },
                { value: '45', label: '45 mins' },
                { value: '60', label: '1 hour' },
                { value: '90', label: '1.5 hours' },
                { value: '120', label: '2 hours' },
              ]}
            />

            <Select
              id="book-status"
              label="Status"
              value={newBooking.status}
              onChange={(val) => setNewBooking({ ...newBooking, status: val.target.value as any })}
              options={[
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'LIVE', label: 'Live Session' },
              ]}
            />
          </div>

          <Input
            id="book-reason"
            label="Consultation Reason"
            placeholder="e.g. Heart rate analysis or medication audit..."
            value={newBooking.reason}
            onChange={(val) => setNewBooking({ ...newBooking, reason: val.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Appointment Details Modal */}
      <Modal
        isOpen={selectedViewAppointment !== null}
        onClose={() => setSelectedViewAppointment(null)}
        title={
          <div className="flex items-center gap-2.5 text-slate-800">
            <Clock className="w-5 h-5 text-brand-primary" />
            <span className="font-display font-semibold text-lg">Appointment Details</span>
          </div>
        }
      >
        {selectedViewAppointment && (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-slate-800">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-sm">
                  {selectedViewAppointment.date} <span className="text-slate-300 font-normal mx-1.5">•</span> {selectedViewAppointment.startTime}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>{selectedViewAppointment.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Patient Name
              </span>
              <h4 className="text-lg font-bold text-slate-800 font-display">
                {selectedViewAppointment.patientName}
              </h4>
              <p className="text-xs font-semibold text-slate-500">
                Appointment Code: {selectedViewAppointment.patientNumber}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Reason for Visit
              </span>
              <div className="bg-indigo-50/50 border-l-[3.5px] border-indigo-500 rounded-r-xl p-4">
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {selectedViewAppointment.reason || 'No reason specified'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="button"
                onClick={() => setSelectedViewAppointment(null)}
                className="bg-brand-primary hover:bg-indigo-700 text-white font-semibold text-sm px-5 h-11 rounded-lg transition-colors cursor-pointer border-0"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
