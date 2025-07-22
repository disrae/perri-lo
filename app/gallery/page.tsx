"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import GalleryModal from "@/components/gallery-modal";
import { getGalleryImages } from "@/lib/gallery";
import { GalleryImage } from "@/lib/types";

export default function GalleryPage() {
    const [galleryModalOpen, setGalleryModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const images = await getGalleryImages();
                console.log("📸 Gallery page - Fetched images:", images);
                console.log("🎬 Gallery page - Videos found:", images.filter(img => img.type === 'video'));
                setGalleryImages(images);
            } catch (error) {
                console.error("Failed to fetch gallery images", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

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
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {galleryImages.map((image, index) => (
                            <div
                                key={image.id}
                                className="aspect-square relative overflow-hidden rounded-lg cursor-pointer group"
                                onClick={() => openGalleryModal(index)}
                            >
                                {!image.type || image.type === 'image' ? (
                                    <Image
                                        src={image.imageUrl}
                                        alt={image.altText}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="relative w-full h-full">
                                        <video
                                            src={image.imageUrl}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            muted
                                            onLoadedData={(e) => {
                                                const video = e.target as HTMLVideoElement;
                                                video.currentTime = 1; // Show frame at 1 second as thumbnail
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                                                <div className="w-0 h-0 border-l-[8px] border-l-black border-y-[6px] border-y-transparent ml-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <p className="text-white text-sm font-medium">{image.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Gallery Modal using the reusable component */}
            <GalleryModal
                isOpen={galleryModalOpen}
                onClose={closeGalleryModal}
                images={galleryImages.map(img => ({
                    id: img.id,
                    src: img.imageUrl,
                    alt: img.altText,
                    caption: img.caption,
                    type: img.type,
                    mimeType: img.mimeType
                }))}
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