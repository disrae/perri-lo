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