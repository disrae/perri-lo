"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Mail, MapPin, Music, Play, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import UpcomingEvents from "@/components/upcoming-events";
import MusicPlayer from "@/components/music-player";
import GalleryModal from "@/components/gallery-modal";

// CSS for custom scrollbar hiding
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  html {
    scroll-behavior: smooth;
  }
`;

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Smooth scroll handler
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 65; // Adjust this value to fine-tune the offset
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  // Image data for gallery
  const galleryImages = Array.from({ length: 8 }).map((_, index) => ({
    id: index,
    src: `/gallery/Image ${index + 1}${index === 3 ? '.JPG' : '.jpg'}`,
    alt: `Perri Lo performance photo ${index + 1}`
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (galleryModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [galleryModalOpen]);

  const openGalleryModal = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setGalleryModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
        <div className="container flex h-16 items-center">
          <div className="flex flex-col">
            <Link href="/" className="font-serif text-xl font-bold">
              Perri Lo
            </Link>
            <span className="text-xs text-muted-foreground">Classical Pianist & Composer</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex gap-6">
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4" onClick={(e) => handleSmoothScroll(e, 'about')}>
              About
            </Link>

            <Link href="#gallery" className="text-sm font-medium hover:underline underline-offset-4" onClick={(e) => handleSmoothScroll(e, 'gallery')}>
              Gallery
            </Link>
            <Link href="#events" className="text-sm font-medium hover:underline underline-offset-4" onClick={(e) => handleSmoothScroll(e, 'events')}>
              Events
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4" onClick={(e) => handleSmoothScroll(e, 'contact')}>
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-auto md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-background border-t">
            <nav className="container py-4 flex flex-col">
              <Link href="#about" className="py-2 text-sm font-medium" onClick={(e) => handleSmoothScroll(e, 'about')}>
                About
              </Link>

              <Link href="#gallery" className="py-2 text-sm font-medium" onClick={(e) => handleSmoothScroll(e, 'gallery')}>
                Gallery
              </Link>
              <Link href="#events" className="py-2 text-sm font-medium" onClick={(e) => handleSmoothScroll(e, 'events')}>
                Events
              </Link>
              <Link href="#contact" className="py-2 text-sm font-medium" onClick={(e) => handleSmoothScroll(e, 'contact')}>
                Contact
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">
        <section className="relative h-[80vh] w-full">
          <Image
            src="/hero.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              objectPosition: "20% center",
              objectFit: "cover"
            }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20 flex flex-col items-center justify-center text-white p-4">
            {/* <h1 className="font-serif text-4xl md:text-6xl font-bold text-center">Perri Lo</h1> */}

            {/* <Button className="mt-8" size="lg">
              Listen to Latest Recordings
            </Button> */}
          </div>
        </section>

        <section id="about" className="py-16 container">
          <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Biography</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="/bio1.jpg"
                alt="Perri Lo portrait"
                width={400}
                height={600}
                className="rounded-lg object-cover md:block hidden"
              />

              <div className="flex justify-center md:hidden">
                <Image
                  src="/bio.jpg"
                  alt="Perri Lo portrait"
                  width={400}
                  height={600}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 font-sans">
              <p>
                Perri Lo is a Vancouver-based pianist and vocal coach working in opera, chamber music, and dance.
                She has worked with opera companies across Canada including Montreal's <b>Institut Canadien d'Art Vocal</b>,
                Toronto's <b>Opera Atelier</b>, and the <b>Banff Arts Centre's Opera in the 21st Century Program</b>.
                Perri has performed and coached with local companies including <b>Vancouver Opera</b>, <b>Pacific Opera Victoria</b>,
                <b>City Opera Vancouver</b>, <b>Re:Naissance Opera</b>, <b>Burnaby Lyric Opera</b>, and <b>Sound The Alarm Music Theatre</b>
                – both in traditional and contemporary repertoire.
              </p>
              <p>
                As an active performer and recitalist, Perri has collaborated with baritone Luka Kawabata
                on a staged theatre and art song work, HAFU with City Opera Vancouver.
                She recently performed with baritone Lucia Lucas in a recital presented by
                the Trans Awareness Conference in Victoria, BC.
              </p>
              <p>
                Perri is a company pianist for <b>Ballet BC</b> and <b>Arts Umbrella Dance Company</b>,
                and enjoys creating new works with dancers and singers.
                She recently performed works by Georg Gurdjieff with Ballet BC dancers in the world premiere,
                Obsidian, choreographed by Bobbi Jene Smith and Or Schreiber.
              </p>

              <div className="pt-4 flex justify-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Download Complete CV</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="py-16 bg-muted">
          <div className="container">
            <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, i) => (
                <div
                  key={i}
                  className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openGalleryModal(i)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
            {/* <div className="mt-8 text-center">
              <Link href="/gallery">
                <Button variant="outline">View Full Gallery</Button>
              </Link>
            </div> */}
          </div>
        </section>

        {/* Gallery Modal using the reusable component */}
        <GalleryModal
          isOpen={galleryModalOpen}
          onClose={closeGalleryModal}
          images={galleryImages}
          initialIndex={selectedImageIndex}
        />

        {/* Inline styles for hiding scrollbars */}
        <style jsx global>
          {hideScrollbarStyle}
        </style>

        {/* <section id="recordings" className="py-16 bg-muted">
          <div className="container">
            <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Recordings & Videos</h2>

            <h3 className="text-xl font-bold mb-4 font-serif">Latest Recordings</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {["Chopin: Nocturnes", "Beethoven: Piano Sonatas", "Debussy: Preludes"].map((title, i) => (
                <div key={i} className="bg-background rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-video relative">
                    <Image
                      src={`/placeholder.svg?height=200&width=350&text=Album ${i + 1}`}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                    <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 rounded-full">
                      <Play className="h-4 w-4" />
                      <span className="sr-only">Play</span>
                    </Button>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-sm text-muted-foreground">Released 2023</p>
                    <div className="flex items-center mt-2">
                      <Music className="h-4 w-4 mr-2" />
                      <span className="text-sm">12 tracks</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold mb-4 font-serif">Featured Videos</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {["Carnegie Hall Recital", "Chopin Competition Performance"].map((title, i) => (
                <div key={i} className="bg-background rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-video relative">
                    <Image
                      src={`/placeholder.svg?height=300&width=600&text=Video ${i + 1}`}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="icon" variant="secondary" className="rounded-full h-12 w-12">
                        <Play className="h-6 w-6" />
                        <span className="sr-only">Play video</span>
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-sm text-muted-foreground">Recorded live, 2023</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <MusicPlayer />
            </div>
          </div>
        </section> */}

        <section id="events" className="py-16 bg-background">
          <div className="container">
            <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Upcoming Events</h2>
            <UpcomingEvents />
          </div>
        </section>

        <section id="contact" className="py-16 bg-muted">
          <div className="container">
            <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Contact</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 font-serif">Get in Touch</h3>
                <p className="mb-6 font-sans">
                  For booking inquiries, press, or general questions, please use the contact form or reach out directly
                  using the information below.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>contact@perrilo.com</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>Royal Academy of Music, London, UK</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Management: Global Artists Management</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button size="icon" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-facebook"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </Button>
                  <Button size="icon" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-instagram"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </Button>
                  <Button size="icon" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-youtube"
                    >
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <path d="m10 15 5-3-5-3z" />
                    </svg>
                    <span className="sr-only">YouTube</span>
                  </Button>
                </div>
              </div>
              <div>
                <form className="space-y-4 bg-background p-6 rounded-lg shadow-sm">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <input id="name" className="w-full p-2 border rounded-md" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-2 border rounded-md"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <input id="subject" className="w-full p-2 border rounded-md" placeholder="Subject" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="w-full p-2 border rounded-md min-h-[120px]"
                      placeholder="Your message"
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Perri Lo. All rights reserved.
          </div>

        </div>
      </footer>
    </div>
  );
}
