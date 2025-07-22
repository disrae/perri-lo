export interface Event {
    id: string;
    title: string;
    venue: string;
    location: string;
    description: string;
    link?: string;
    datetimes: Date[];
    times: string[];
}

export interface GalleryImage {
    id: string;
    imageUrl: string;
    imagePath: string;
    caption: string;
    altText: string;
    order: number;
    createdAt: Date;
} 