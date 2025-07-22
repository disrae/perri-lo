"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import DOMPurify from "isomorphic-dompurify";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { app } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import UpcomingEvents from "@/components/upcoming-events";
import GalleryModal from "@/components/gallery-modal";
import { Event } from "@/lib/types";

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

interface HomeClientProps {
    bioHtml: string;
    events: Event[];
}

interface GalleryImage {
    id: number;
    src: string;
    alt: string;
}

export default function HomeClient({ bioHtml, events }: HomeClientProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // Fetch dynamic content from Firebase
    useEffect(() => {
        const fetchCvUrl = async () => {
            try {
                const storage = getStorage(app);
                const cvRef = ref(storage, 'cv/PerriLoCV.pdf');
                const url = await getDownloadURL(cvRef);
                setCvUrl(url);
            } catch (error) {
                console.error("Could not fetch CV URL:", error);
            }
        };

        const fetchGalleryImages = async () => {
            try {
                const storage = getStorage(app);
                const listRef = ref(storage, 'gallery');
                const res = await listAll(listRef);
                const imagePromises = res.items.map(async (itemRef, index) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        id: index,
                        src: url,
                        alt: `Perri Lo performance photo ${index + 1}`
                    };
                });
                const images = await Promise.all(imagePromises);
                setGalleryImages(images);
            } catch (error) {
                console.error("Failed to fetch gallery images", error);
            }
        };

        fetchCvUrl();
        fetchGalleryImages();
    }, []);

    // React Hook Form setup
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: ''
        }
    });

    // Form submission handler
    const onSubmit = async (data: any) => {
        setFormStatus('submitting');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            setFormStatus('success');
            reset(); // Clear form fields

            // Reset success message after 5 seconds
            setTimeout(() => {
                setFormStatus('idle');
            }, 5000);
        } catch (error) {
            console.error('Error sending message:', error);
            setFormStatus('error');
        }
    };

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
    // const galleryImages = Array.from({ length: 8 }).map((_, index) => ({
    //     id: index,
    //     src: `/gallery/Image ${index + 1}.jpg`,
    //     alt: `Perri Lo performance photo ${index + 1}`
    // }));

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
                        <Link href="/"
                            className="font-cinzel text-4xl font-normal tracking-[0.1em] text-foreground hover:text-foreground/80 transition-colors">
                            Perri Lo
                        </Link>
                        <span className="text-xs text-muted-foreground">Pianist - Opera Coach - Producer</span>
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
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(bioHtml) }}
                            />
                            {cvUrl && (
                                <a href={cvUrl} target="_blank" rel="noopener noreferrer" download>
                                    <Button variant="outline" className="mt-4">Download CV</Button>
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <section id="gallery" className="py-16 bg-muted">
                    <div className="container">
                        <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Gallery</h2>
                        {galleryImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {galleryImages.slice(0, 8).map((image, index) => (
                                    <div key={image.id} className="relative aspect-square cursor-pointer overflow-hidden rounded-lg group" onClick={() => openGalleryModal(index)}>
                                        <Image
                                            src={image.src}
                                            alt={image.alt}
                                            fill
                                            className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>The gallery is currently empty. Please check back later!</p>
                        )}
                    </div>
                </section>

                <GalleryModal
                    isOpen={galleryModalOpen}
                    onClose={closeGalleryModal}
                    images={galleryImages}
                    initialIndex={selectedImageIndex}
                />

                <style jsx global>
                    {hideScrollbarStyle}
                </style>

                <section id="events" className="py-16 bg-muted">
                    <div className="container">
                        <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Upcoming Events</h2>
                        <UpcomingEvents events={events} />
                    </div>
                </section>

                <section id="contact" className="py-16 bg-muted">
                    <div className="container">
                        <h2 className="font-serif text-3xl font-bold mb-8 tracking-tight">Contact</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4 font-serif">Get in Touch</h3>
                                <p className="mb-6 font-sans">
                                    For coachings, booking inquiries, or general questions, please use the contact form or reach out directly using the information below.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Mail className="h-5 w-5 mr-3" />
                                        <a href="mailto:info@perrilo.com" className="hover:underline">info@perrilo.com</a>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <Link
                                        href="https://www.facebook.com/perri.lo.pianist"
                                        target="_blank"
                                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                    >
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
                                            className="h-4 w-4"
                                        >
                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                        </svg>
                                        <span className="sr-only">Facebook</span>
                                    </Link>
                                    <Link
                                        href="https://www.instagram.com/perri.lo"
                                        target="_blank"
                                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                    >
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
                                            className="h-4 w-4"
                                        >
                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                        </svg>
                                        <span className="sr-only">Instagram</span>
                                    </Link>
                                    <Link
                                        href="https://www.youtube.com/@perrilo2420"
                                        target="_blank"
                                        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                    >
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
                                            className="h-4 w-4"
                                        >
                                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                                            <path d="m10 15 5-3-5-3z" />
                                        </svg>
                                        <span className="sr-only">YouTube</span>
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-background p-6 rounded-lg shadow-sm">
                                    {formStatus === 'success' && (
                                        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
                                            Your message has been sent successfully! We'll get back to you soon.
                                        </div>
                                    )}

                                    {formStatus === 'error' && (
                                        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                                            There was an error sending your message. Please try again later.
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : ''}`}
                                                placeholder="Your name"
                                                {...register('name', { required: 'Name is required' })}
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-xs mt-1">{errors.name.message?.toString()}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : ''}`}
                                                placeholder="Your email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-xs mt-1">{errors.email.message?.toString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Subject"
                                            {...register('subject')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">
                                            Message
                                        </label>

                                        <textarea
                                            id="message"
                                            className={`w-full p-2 border rounded-md min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                                            placeholder="Your message"
                                            {...register('message', { required: 'Message is required' })}
                                        />
                                        {errors.message && (
                                            <p className="text-red-500 text-xs mt-1">{errors.message.message?.toString()}</p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={formStatus === 'submitting'}
                                    >
                                        {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                                    </Button>
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