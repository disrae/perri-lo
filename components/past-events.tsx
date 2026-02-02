"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/lib/types";
import { format } from 'date-fns';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi
} from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";

interface PastEventsProps {
  events: Event[];
}

export default function PastEvents({ events }: PastEventsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Handle horizontal scrolling and touch gestures
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement || !api) return;

    const handleWheel = (event: WheelEvent) => {
      // Check if Shift is pressed (horizontal scroll) or if it's a horizontal scroll gesture
      if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault();

        // Determine scroll direction
        const delta = event.deltaX || event.deltaY;

        if (delta > 0) {
          // Scroll right/next
          api.scrollNext();
        } else {
          // Scroll left/previous
          api.scrollPrev();
        }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchStartX.current || !touchStartY.current) return;

      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;

      const deltaX = touchStartX.current - touchEndX;
      const deltaY = touchStartY.current - touchEndY;

      // Only handle horizontal swipes that are more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        event.preventDefault();

        if (deltaX > 0) {
          // Swipe left - scroll next
          api.scrollNext();
        } else {
          // Swipe right - scroll previous
          api.scrollPrev();
        }
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
    };

    carouselElement.addEventListener('wheel', handleWheel, { passive: false });
    carouselElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    carouselElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      carouselElement.removeEventListener('wheel', handleWheel);
      carouselElement.removeEventListener('touchstart', handleTouchStart);
      carouselElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [api]);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="w-full" ref={carouselRef}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          watchDrag: true,
          watchResize: false,
          watchSlides: false,
        }}
        plugins={[]}
      >
        <CarouselContent className="sm:-ml-1">
          {events.map((event, index) => (
            <CarouselItem key={event.id} className="sm:pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 max-w-sm mx-auto">
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">{event.title}</h3>
                  <div className="space-y-1 text-xs sm:text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{format(event.datetimes[0], 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:flex -left-12" />
        <CarouselNext className="hidden lg:flex -right-12" />
      </Carousel>

      {/* Progress indicators for mobile/touch interaction */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current - 1 ? 'bg-primary w-6' : 'bg-muted hover:bg-muted-foreground/50 w-2'
            }`}
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Mobile navigation hints */}
      <div className="flex justify-center mt-2">
        <p className="text-xs text-muted-foreground text-center">
          <span className="hidden sm:inline">Drag or use horizontal scroll</span>
          <span className="sm:hidden">Swipe horizontally</span>
        </p>
      </div>
    </div>
  );
}