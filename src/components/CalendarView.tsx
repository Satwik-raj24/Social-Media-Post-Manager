import React, { useState, useMemo, useCallback } from 'react';
import { Post } from '../types/post';
import { PlatformIcon } from './SocialIcons';

interface CalendarViewProps {
  scheduledPosts: Post[];
  onSelectEvent: (post: Post) => void;
  onSelectDate: (dateIso: string) => void;
  selectedDateIso?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarViewComponent: React.FC<CalendarViewProps> = ({
  scheduledPosts,
  onSelectEvent,
  onSelectDate,
  selectedDateIso,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { firstDayIndex, daysInMonth } = useMemo(() => {
    return {
      firstDayIndex: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate(),
    };
  }, [year, month]);

  const pad = (num: number) => String(num).padStart(2, '0');

  const postsByDateMap = useMemo(() => {
    const map: Record<string, Post[]> = {};
    scheduledPosts.forEach((post) => {
      if (post.scheduledAt) {
        const d = new Date(post.scheduledAt);
        const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(post);
      }
    });
    return map;
  }, [scheduledPosts]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>
            Scheduling Calendar ({scheduledPosts.length} Scheduled)
          </h2>
        </div>

        <div className="calendar-nav-controls">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleToday}>
            Today
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
            Previous
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: '130px', textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
            Next
          </button>
        </div>
      </div>

      <div className="calendar-grid-header">
        {WEEKDAY_NAMES.map((day) => (
          <div key={day} className="weekday-cell">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid-body">
        {Array.from({ length: firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className="calendar-day-cell empty" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
          const isToday = dateStr === todayStr;
          const isSelected = Boolean(selectedDateIso && selectedDateIso.startsWith(dateStr));
          const postsForDay = postsByDateMap[dateStr] || [];

          return (
            <div
              key={dayNum}
              className={`calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected-date' : ''}`}
              onClick={() => {
                const timeString = `${dateStr}T09:00`;
                onSelectDate(timeString);
              }}
              title={`Click date to schedule a post for ${dateStr}`}
            >
              <div className="day-number">
                <span className="num-text">{dayNum}</span>
                {postsForDay.length > 0 && (
                  <span className="day-count-badge">{postsForDay.length}</span>
                )}
                <span className="schedule-hover-btn">+ Schedule</span>
              </div>

              <div className="day-events-container">
                {postsForDay.map((post) => {
                  const eventTime = new Date(post.scheduledAt!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={post.id}
                      className="calendar-event-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(post);
                      }}
                      title={`Click to edit scheduled post for ${eventTime}`}
                    >
                      <span className="event-time">{eventTime}</span>
                      <span className="event-platforms" style={{ display: 'inline-flex', gap: '2px' }}>
                        {post.platforms.map((p) => (
                          <PlatformIcon key={p} platform={p} size={11} />
                        ))}
                      </span>
                      <span className="event-title-snippet">{post.content}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CalendarView = React.memo(CalendarViewComponent);
