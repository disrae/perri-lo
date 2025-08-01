"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    caption?: string;
    type?: 'image' | 'video';
    mimeType?: string;
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
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
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

                            {images[selectedImage].type === 'video' ? (
                                <video
                                    src={images[selectedImage].src}
                                    className="max-w-full max-h-full object-contain"
                                    controls
                                    autoPlay
                                    muted
                                    onLoadedData={() => setImageLoading(false)}
                                    onError={() => setImageLoading(false)}
                                />
                            ) : (
                                <Image
                                    src={images[selectedImage].src}
                                    alt={images[selectedImage].alt}
                                    fill
                                    className="object-contain"
                                    onLoadingComplete={() => setImageLoading(false)}
                                    priority
                                />
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

                        <div className="flex justify-center gap-2 overflow-x-auto pb-2 pt-4 hide-scrollbar">
                            {images.map((image, i) => (
                                <div
                                    key={image.id}
                                    className={`w-16 h-16 relative overflow-hidden rounded cursor-pointer transition-all ${selectedImage === i ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                                    onClick={() => {
                                        setSelectedImage(i);
                                        setImageLoading(true);
                                    }}
                                >
                                    {image.type === 'video' ? (
                                        <div className="relative w-full h-full bg-gray-800">
                                            <video
                                                src={image.src}
                                                className="w-full h-full object-cover"
                                                muted
                                                preload="metadata"
                                                playsInline
                                                onLoadedMetadata={(e) => {
                                                    const video = e.target as HTMLVideoElement;
                                                    // Try to seek to 1 second for thumbnail
                                                    try {
                                                        if (video.duration > 1) {
                                                            video.currentTime = 1;
                                                        }
                                                    } catch (error) {
                                                        // Silently fail if seeking doesn't work (common on mobile)
                                                        console.debug('Video seeking not available');
                                                    }
                                                }}
                                                onSeeked={() => {
                                                    // Video has successfully seeked to the new time
                                                }}
                                                onError={() => {
                                                    // Handle video loading errors gracefully
                                                    console.debug('Video thumbnail loading failed');
                                                }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <div className="w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                                                    <div className="w-0 h-0 border-l-[3px] border-l-black border-y-[2px] border-y-transparent ml-0.5"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Image
                                            src={image.src}
                                            alt={`Thumbnail ${i + 1}`}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    )}
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