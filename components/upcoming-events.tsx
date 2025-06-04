"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample events data
const events = [
  {
    id: 1,
    title: "Solo Recital: Chopin & Liszt",
    date: "June 15, 2023",
    time: "7:30 PM",
    venue: "Carnegie Hall",
    location: "New York, NY",
    description: "An evening of romantic masterpieces featuring works by Chopin and Liszt.",
  },
  {
    id: 2,
    title: "London Symphony Orchestra",
    date: "July 8, 2023",
    time: "8:00 PM",
    venue: "Barbican Centre",
    location: "London, UK",
    description: "Performing Rachmaninoff's Piano Concerto No. 3 with the London Symphony Orchestra.",
  },
  {
    id: 3,
    title: "Vienna Philharmonic",
    date: "August 22, 2023",
    time: "7:00 PM",
    venue: "Musikverein",
    location: "Vienna, Austria",
    description: "Beethoven's Emperor Concerto with the Vienna Philharmonic.",
  },
  {
    id: 4,
    title: "Berlin Recital Series",
    date: "September 10, 2023",
    time: "6:30 PM",
    venue: "Berlin Philharmonie",
    location: "Berlin, Germany",
    description: "A program of Bach, Mozart, and contemporary works.",
  },
]

export default function UpcomingEvents() {
  const [selectedEvent, setSelectedEvent] = useState(events[0])

  const handlePrevEvent = () => {
    const currentIndex = events.findIndex((event) => event.id === selectedEvent.id)
    const prevIndex = (currentIndex - 1 + events.length) % events.length
    setSelectedEvent(events[prevIndex])
  }

  const handleNextEvent = () => {
    const currentIndex = events.findIndex((event) => event.id === selectedEvent.id)
    const nextIndex = (currentIndex + 1) % events.length
    setSelectedEvent(events[nextIndex])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="icon" onClick={handlePrevEvent}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous event</span>
            </Button>
            <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
            <Button variant="outline" size="icon" onClick={handleNextEvent}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next event</span>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{selectedEvent.date}</div>
                  <div className="text-sm text-muted-foreground">{selectedEvent.time}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{selectedEvent.venue}</div>
                  <div className="text-sm text-muted-foreground">{selectedEvent.location}</div>
                </div>
              </div>

              <p className="text-sm">{selectedEvent.description}</p>

              <div className="flex gap-3 pt-2">
                <Button>Book Tickets</Button>
                <Button variant="outline">Add to Calendar</Button>
              </div>
            </div>

            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={`/placeholder.svg?height=300&width=500&text=${selectedEvent.venue}`}
                alt={selectedEvent.venue}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">All Upcoming Events</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedEvent.id === event.id ? "bg-primary/10 border border-primary/20" : "bg-card hover:bg-muted"
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="font-medium">{event.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.venue}, {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
