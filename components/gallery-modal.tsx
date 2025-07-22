"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    caption?: string;
}

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: GalleryImage[];
    initialIndex: number;
}

// CSS for custom scrollbar hiding
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default function GalleryModal({ isOpen, onClose, images, initialIndex }: GalleryModalProps) {
    const [selectedImage, setSelectedImage] = useState(initialIndex);
    const [imageLoading, setImageLoading] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);
    const touchStartXRef = useRef<number | null>(null);

    // Reset selected image when initialIndex changes
    useEffect(() => {
        setSelectedImage(initialIndex);
        setImageLoading(true);
    }, [initialIndex]);

    // Prevent scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                navigateGallery('prev');
            } else if (e.key === 'ArrowRight') {
                navigateGallery('next');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Focus modal when opened
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    // Handle touch gestures
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartXRef.current === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartXRef.current - touchEndX;

        // Swipe threshold of 50px
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left, go to next image
                navigateGallery('next');
            } else {
                // Swipe right, go to previous image
                navigateGallery('prev');
            }
        }

        touchStartXRef.current = null;
    };

    const navigateGallery = (direction: 'prev' | 'next') => {
        setImageLoading(true);
        if (direction === 'prev') {
            setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else {
            setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
                onClick={onClose}
                ref={modalRef}
                tabIndex={0}
                aria-modal="true"
                role="dialog"
                aria-label="Image Gallery"
            >
                <div
                    className="relative max-w-5xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white"
                        onClick={onClose}
                        aria-label="Close gallery"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <button
                            className="absolute left-2 z-10 bg-black/50 p-2 rounded-full text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateGallery('prev');
                            }}
                            aria-label="Previous image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            <Image
                                src={images[selectedImage].src}
                                alt={images[selectedImage].alt}
                                fill
                                className="object-contain"
                                onLoadingComplete={() => setImageLoading(false)}
                                priority
                            />

                            {/* Caption overlay at the bottom of the image */}
                            {images[selectedImage].caption && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg">
                                    <p className="text-sm leading-relaxed">{images[selectedImage].caption}</p>
                                </div>
                            )}
                        </div>

                        <button
                            className="absolute right-2 z-10 bg-black/50 p-2 rounded-full text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateGallery('next');
                            }}
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    </div>

                    <div className="absolute bottom-8 w-full px-4 max-w-3xl">
                        <div className="text-white text-center mb-2">
                            <p className="text-sm">{selectedImage + 1} / {images.length}</p>
                            {images[selectedImage].caption && (
                                <p className="text-sm mt-1">{images[selectedImage].caption}</p>
                            )}
                        </div>

                        <div className="flex justify-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {images.map((image, i) => (
                                <div
                                    key={image.id}
                                    className={`w-16 h-16 relative overflow-hidden rounded cursor-pointer transition-all ${selectedImage === i ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                                    onClick={() => {
                                        setSelectedImage(i);
                                        setImageLoading(true);
                                    }}
                                >
                                    <Image
                                        src={image.src}
                                        alt={`Thumbnail ${i + 1}`}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline styles for hiding scrollbars */}
            <style jsx global>
                {hideScrollbarStyle}
            </style>
        </>
    );
} 