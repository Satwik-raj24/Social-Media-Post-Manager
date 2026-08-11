import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../components/CalendarView';

import { Post } from '../types/post';

describe('CalendarView Component', () => {
  const futureDate = new Date();
  futureDate.setDate(15); // 15th of current month
  const scheduledTimeIso = futureDate.toISOString();

  const sampleScheduledPost: Post = {
    id: 'sched_1',
    content: 'Scheduled event test post',
    platforms: ['twitter'],
    createdAt: new Date().toISOString(),
    scheduledAt: scheduledTimeIso,
    status: 'scheduled',
  };

  it('renders calendar title and scheduled post event pill', () => {
    render(
      <CalendarView
        scheduledPosts={[sampleScheduledPost]}
        onSelectEvent={vi.fn()}
        onSelectDate={vi.fn()}
      />
    );

    expect(screen.getByText(/Scheduling Calendar/i)).toBeInTheDocument();
    expect(screen.getByText('Scheduled event test post')).toBeInTheDocument();
  });

  it('triggers onSelectEvent when clicking on a scheduled post pill', () => {
    const onSelectEvent = vi.fn();
    render(
      <CalendarView
        scheduledPosts={[sampleScheduledPost]}
        onSelectEvent={onSelectEvent}
        onSelectDate={vi.fn()}
      />
    );

    const eventPill = screen.getByText('Scheduled event test post');
    fireEvent.click(eventPill);

    expect(onSelectEvent).toHaveBeenCalledWith(sampleScheduledPost);
  });

  it('triggers onSelectDate when clicking on a future date cell', () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarView
        scheduledPosts={[]}
        onSelectEvent={vi.fn()}
        onSelectDate={onSelectDate}
      />
    );

    // Day 28 is guaranteed to be a future date in current month (or today/future)
    const futureDayNum = 28;
    const dayElement = screen.getByText(String(futureDayNum));
    fireEvent.click(dayElement.closest('.calendar-day-cell') || dayElement);

    expect(onSelectDate).toHaveBeenCalled();
    const calledArg = onSelectDate.mock.calls[0][0];
    expect(calledArg).toContain('T09:00');
  });

  it('does NOT trigger onSelectDate when clicking on a past date cell', () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarView
        scheduledPosts={[]}
        onSelectEvent={vi.fn()}
        onSelectDate={onSelectDate}
      />
    );

    // Day 1 of current month is in the past (since today is Aug 11 2026)
    const dayOne = screen.getByText('1');
    fireEvent.click(dayOne.closest('.calendar-day-cell') || dayOne);

    expect(onSelectDate).not.toHaveBeenCalled();
  });
});
