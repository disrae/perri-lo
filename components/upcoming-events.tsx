"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Sample events data
const events = [
  {
    id: 1,
    title: "Decoys: A Concert About Birds",
    date: "June 27, 2025",
    time: "7:30 PM",
    venue: "Martha Lou Henley Rehearsal Hall",
    location: "1955 McLean Drive, Vancouver, BC",
    description: "A special concert featuring music inspired by our feathered friends.",
    link: "https://www.eventbrite.ca/e/decoys-a-concert-about-birds-tickets-1378222553759?aff=oddtdtcreator"
  },
];

export default function UpcomingEvents() {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const hasMultipleEvents = events.length > 1;

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
                <div className="font-medium">{selectedEvent.date}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedEvent.time}
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

            <div className="pt-2">
              <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  Visit Official Website <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
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
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
