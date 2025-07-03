"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/lib/types";
import { format } from 'date-fns';

interface UpcomingEventsProps {
  events: Event[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [selectedEvent, setSelectedEvent] = useState(events.length > 0 ? events[0] : null);
  const hasMultipleEvents = events.length > 1;

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>There are no upcoming events at this time. Please check back later!</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedEvent) {
    return null;
  }

  const formatEventDates = (dates: Date[]) => {
    if (!dates || dates.length === 0) return '';

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

    const ranges: { start: Date, end: Date; }[] = [];
    let currentRange: { start: Date, end: Date; } | null = null;

    for (const date of sortedDates) {
      if (!currentRange) {
        currentRange = { start: date, end: date };
      } else {
        const nextDay = new Date(currentRange.end);
        nextDay.setDate(nextDay.getDate() + 1);

        if (
          date.getFullYear() === nextDay.getFullYear() &&
          date.getMonth() === nextDay.getMonth() &&
          date.getDate() === nextDay.getDate()
        ) {
          currentRange.end = date;
        } else {
          ranges.push(currentRange);
          currentRange = { start: date, end: date };
        }
      }
    }
    if (currentRange) {
      ranges.push(currentRange);
    }

    return ranges.map(range => {
      const { start, end } = range;

      const isSameDay = start.toDateString() === end.toDateString();

      if (isSameDay) {
        return format(start, 'MMMM d, yyyy');
      }

      const startYear = format(start, 'yyyy');
      const endYear = format(end, 'yyyy');
      const startMonth = format(start, 'MMMM');
      const endMonth = format(end, 'MMMM');
      const startDay = format(start, 'd');
      const endDay = format(end, 'd');

      if (startYear !== endYear) {
        return `${format(start, 'MMMM d, yyyy')} – ${format(end, 'MMMM d, yyyy')}`;
      }
      if (startMonth !== endMonth) {
        return `${format(start, 'MMMM d')} – ${format(end, 'MMMM d')}, ${endYear}`;
      }
      return `${startMonth} ${startDay}–${endDay}, ${startYear}`;
    }).join(' & ');
  };

  const formatShowtimes = (times: string[]) => {
    if (!times || times.length === 0) {
      return '';
    }
    return times.map(time => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'p');
    }).join(' / ');
  };

  const handlePrevEvent = () => {
    const currentIndex = events.findIndex((event) => event.id === selectedEvent.id);
    const prevIndex = (currentIndex - 1 + events.length) % events.length;
    setSelectedEvent(events[prevIndex]);
  };

  const handleNextEvent = () => {
    const currentIndex = events.findIndex((event) => event.id === selectedEvent.id);
    const nextIndex = (currentIndex + 1) % events.length;
    setSelectedEvent(events[nextIndex]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {hasMultipleEvents ? (
              <Button variant="outline" size="icon" className="shrink-0" onClick={handlePrevEvent}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous event</span>
              </Button>
            ) : (
              <div className="w-9"></div>
            )}
            <h3 className="text-xl font-bold text-center px-2 truncate">{selectedEvent.title}</h3>
            {hasMultipleEvents ? (
              <Button variant="outline" size="icon" className="shrink-0" onClick={handleNextEvent}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next event</span>
              </Button>
            ) : (
              <div className="w-9"></div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-muted p-3 rounded-md">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">{formatEventDates(selectedEvent.datetimes)}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatShowtimes(selectedEvent.times)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-muted p-3 rounded-md">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium">{selectedEvent.venue}</div>
                <div className="text-sm text-muted-foreground">{selectedEvent.location}</div>
              </div>
            </div>

            <p className="text-sm pt-2">{selectedEvent.description}</p>

            {selectedEvent.link && (
              <div className="pt-2">
                <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full flex items-center gap-2">
                    Visit Official Website <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {hasMultipleEvents && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">All Upcoming Events</h3>
          <div className="grid gap-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedEvent.id === event.id
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-card hover:bg-muted border border-border"
                  }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex flex-col gap-2">
                  <div className="font-medium text-lg">{event.title}</div>
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatEventDates(event.datetimes)}</span>
                    </div>
                  </div>
                  {event.times && event.times.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatShowtimes(event.times)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

