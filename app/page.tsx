import Link from "next/link";
import Image from "next/image";
import { Calendar, Mail, MapPin, Music, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import UpcomingEvents from "@/components/upcoming-events";
import MusicPlayer from "@/components/music-player";
import EditableContent from "@/components/admin/EditableContent";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Link href="/" className="font-serif text-xl font-bold">
            <EditableContent defaultContent="Perri Lo" />
          </Link>
          <nav className="ml-auto flex gap-6">
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#cv" className="text-sm font-medium hover:underline underline-offset-4">
              CV
            </Link>
            <Link href="#gallery" className="text-sm font-medium hover:underline underline-offset-4">
              Gallery
            </Link>
            <Link href="#recordings" className="text-sm font-medium hover:underline underline-offset-4">
              Recordings
            </Link>
            <Link href="#events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[80vh] w-full">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Perri Lo performing at Carnegie Hall"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-center">
              <EditableContent defaultContent="Perri Lo" />
            </h1>
            <p className="text-xl md:text-2xl mt-4 text-center max-w-2xl">
              <EditableContent defaultContent="Classical Pianist & Composer" />
            </p>
            <Button className="mt-8" size="lg">
              Listen to Latest Recordings
            </Button>
          </div>
        </section>

        <section id="about" className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Biography</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center md:justify-end">
                <Image
                  src="/placeholder.svg?height=600&width=400"
                  alt="Perri Lo portrait"
                  width={400}
                  height={600}
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="space-y-4">
                <p>
                  <EditableContent
                    defaultContent="Perri Lo is an internationally acclaimed pianist known for his profound interpretations of
                    classical repertoire and innovative approach to contemporary works. Born in Vienna, Austria, Alexander
                    began his piano studies at the age of four and gave his first public performance at seven."
                  />
                </p>
                <p>
                  <EditableContent
                    defaultContent="A graduate of the prestigious Juilliard School in New York, Alexander has performed with major
                    orchestras worldwide, including the Vienna Philharmonic, London Symphony Orchestra, and New York
                    Philharmonic. His recordings of Chopin&apos;s complete works have received numerous awards and critical
                    acclaim."
                  />
                </p>
                <p>
                  <EditableContent
                    defaultContent="Beyond his performance career, Alexander is dedicated to music education and regularly gives
                    masterclasses at conservatories around the world. He is currently a professor of piano at the Royal
                    Academy of Music in London."
                  />
                </p>
                <Button variant="outline">Read Full Biography</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="cv" className="py-16 bg-muted">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Curriculum Vitae</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold mb-4">Education</h3>
                <ul className="space-y-4">
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Doctor of Musical Arts</div>
                    <div>The Juilliard School, New York</div>
                    <div className="text-sm text-muted-foreground">2010-2014</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Master of Music</div>
                    <div>Royal College of Music, London</div>
                    <div className="text-sm text-muted-foreground">2008-2010</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Bachelor of Music</div>
                    <div>Vienna Conservatory</div>
                    <div className="text-sm text-muted-foreground">2004-2008</div>
                  </li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Awards & Honors</h3>
                <ul className="space-y-4">
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">International Chopin Piano Competition</div>
                    <div>First Prize</div>
                    <div className="text-sm text-muted-foreground">2018</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Van Cliburn International Piano Competition</div>
                    <div>Silver Medal</div>
                    <div className="text-sm text-muted-foreground">2017</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Grammy Award</div>
                    <div>Best Classical Solo Performance</div>
                    <div className="text-sm text-muted-foreground">2016</div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Performance Highlights</h3>
                <ul className="space-y-4">
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Carnegie Hall Recital Series</div>
                    <div>New York, USA</div>
                    <div className="text-sm text-muted-foreground">2022</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">BBC Proms with London Symphony Orchestra</div>
                    <div>London, UK</div>
                    <div className="text-sm text-muted-foreground">2021</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Vienna Musikverein</div>
                    <div>Vienna, Austria</div>
                    <div className="text-sm text-muted-foreground">2020</div>
                  </li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Teaching Positions</h3>
                <ul className="space-y-4">
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Professor of Piano</div>
                    <div>Royal Academy of Music, London</div>
                    <div className="text-sm text-muted-foreground">2018-Present</div>
                  </li>
                  <li className="border-l-2 pl-4 py-2">
                    <div className="font-bold">Visiting Professor</div>
                    <div>Shanghai Conservatory of Music</div>
                    <div className="text-sm text-muted-foreground">2016-2018</div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Button>Download Complete CV</Button>
            </div>
          </div>
        </section>

        <section id="gallery" className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={`/placeholder.svg?height=400&width=400&text=Photo ${i + 1}`}
                    alt={`Perri Lo performance photo ${i + 1}`}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline">View Full Gallery</Button>
            </div>
          </div>
        </section>

        <section id="recordings" className="py-16 bg-muted">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Recordings & Videos</h2>

            <h3 className="text-xl font-bold mb-4">Latest Recordings</h3>
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

            <h3 className="text-xl font-bold mb-4">Featured Videos</h3>
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
        </section>

        <section id="events" className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
            <UpcomingEvents />
            <div className="mt-8 text-center">
              <Button variant="outline">View All Events</Button>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 bg-muted">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold mb-8 text-center">Contact</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
                <p className="mb-6">
                  For booking inquiries, press, or general questions, please use the contact form or reach out directly
                  using the information below.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>contact@alexanderreed.com</span>
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
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="font-serif text-lg font-bold">
            <EditableContent defaultContent="Perri Lo" />
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Perri Lo. All rights reserved.
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:underline underline-offset-4">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>

      {/* Admin Mode Indicator */}
      <div id="admin-indicator" className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-md z-50 hidden shadow-lg">
        <div className="font-bold mb-1">Admin Mode Active</div>
        <div className="text-sm">Click on any highlighted text to edit.</div>
        <div className="text-sm mt-1">Type &quot;secretadmin&quot; again to exit.</div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              const indicator = document.getElementById('admin-indicator');
              if (indicator.classList.contains('hidden')) {
                indicator.classList.remove('hidden');
              } else {
                indicator.classList.add('hidden');
              }
            }
          });
        `
      }} />
    </div>
  );
}
