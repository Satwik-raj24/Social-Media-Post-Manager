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

  it('triggers onSelectDate when clicking on a date cell', () => {
    const onSelectDate = vi.fn();
    render(
      <CalendarView
        scheduledPosts={[]}
        onSelectEvent={vi.fn()}
        onSelectDate={onSelectDate}
      />
    );

    const dayTen = screen.getByText('10');
    fireEvent.click(dayTen.closest('.calendar-day-cell') || dayTen);

    expect(onSelectDate).toHaveBeenCalled();
    const calledArg = onSelectDate.mock.calls[0][0];
    expect(calledArg).toContain('T09:00');
  });
});
