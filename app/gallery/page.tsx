"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import GalleryModal from "@/components/gallery-modal";

export default function GalleryPage() {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Image data - in a real app, this would come from a CMS or API
    const galleryImages = Array.from({ length: 8 }).map((_, index) => ({
        id: index,
        src: `/gallery/Image ${index + 1}.jpg`,
        alt: `Perri Lo performance photo ${index + 1}`,
        caption: `Performance at Concert Hall ${index + 1}`
    }));

    const openGalleryModal = (index: number) => {
        setSelectedImageIndex(index);
        setGalleryModalOpen(true);
    };

    const closeGalleryModal = () => {
        setGalleryModalOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>
                    <h1 className="ml-auto mr-auto font-serif text-xl font-bold">Gallery</h1>
                </div>
            </header>

            <main className="flex-1 container py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {galleryImages.map((image, index) => (
                        <div
                            key={image.id}
                            className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                            onClick={() => openGalleryModal(index)}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <p className="text-white text-sm font-medium">{image.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Gallery Modal using the reusable component */}
            <GalleryModal
                isOpen={galleryModalOpen}
                onClose={closeGalleryModal}
                images={galleryImages}
                initialIndex={selectedImageIndex}
            />

            <footer className="border-t py-6">
                <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="font-serif text-lg font-bold">Perri Lo</div>
                    <div className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Perri Lo. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
} 