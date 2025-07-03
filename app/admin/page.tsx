"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { auth, db, storage } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp, deleteField } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { format } from 'date-fns';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically load QuillEditor to avoid SSR issues with window.
const QuillEditor = dynamic<{ value: any; onChange: (delta: any) => void; }>(
    () => import("@/components/quill-editor"),
    { ssr: false }
);

interface Delta {
    ops: any[];
}

interface AdminEvent {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    description: string;
    link?: string;
    datetime: Timestamp;
    endDatetime?: Timestamp;
    endDate?: string;
    times: string[];
    datetimes: Timestamp[];
    dates: string[];
}

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [delta, setDelta] = useState<Delta | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [rebuilding, setRebuilding] = useState(false);
    const [rebuildStatus, setRebuildStatus] = useState<'idle' | 'success'>('idle');

    // CV state
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [cvUploadStatus, setCvUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [cvDownloadUrl, setCvDownloadUrl] = useState<string>('');

    // Gallery state
    const [galleryImages, setGalleryImages] = useState<{ url: string, ref: any; }[]>([]);
    const [imageFiles, setImageFiles] = useState<FileList | null>(null);
    const [galleryUploadStatus, setGalleryUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    // Events state
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [editingEvent, setEditingEvent] = useState<Partial<AdminEvent> | null>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    // Track auth state
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return unsub;
    }, []);

    // Fetch existing bio once authenticated
    const fetchBio = useCallback(async () => {
        if (!user) return;
        try {
            const ref = doc(db, "content", "bio");
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data() as { delta?: Delta; };
                if (data.delta) {
                    setDelta(data.delta as Delta);
                } else {
                    setDelta({ ops: [{ insert: "" }] });
                }
            } else {
                setDelta({ ops: [{ insert: "" }] });
            }
        } catch (err) {
            console.error("Failed to fetch bio content", err);
        }
    }, [user]);

    // Fetch existing events once authenticated
    const fetchEvents = useCallback(async () => {
        if (!user) return;
        try {
            const eventsCollection = collection(db, "events");
            const snapshot = await getDocs(eventsCollection);
            const eventsData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as AdminEvent))
                .sort((a, b) => {
                    const aFirstDate = a.datetimes?.[0];
                    const bFirstDate = b.datetimes?.[0];

                    if (aFirstDate && bFirstDate) {
                        return aFirstDate.toMillis() - bFirstDate.toMillis();
                    }
                    // Sort events without dates to the end
                    if (aFirstDate) return -1;
                    if (bFirstDate) return 1;
                    return 0;
                });
            setEvents(eventsData);
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    }, [user]);

    const fetchGalleryImages = async () => {
        const listRef = ref(storage, 'gallery');
        try {
            const res = await listAll(listRef);
            const imagePromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return { url, ref: itemRef };
            });
            const images = await Promise.all(imagePromises);
            setGalleryImages(images);
        } catch (error) {
            console.error("Failed to fetch gallery images", error);
        }
    };

    const fetchCvDownloadUrl = async () => {
        try {
            const cvRef = ref(storage, 'cv/PerriLoCV.pdf');
            const url = await getDownloadURL(cvRef);
            setCvDownloadUrl(url);
        } catch (error) {
            console.warn("CV not found or access error. Upload one to enable the download link.", error);
            setCvDownloadUrl('');
        }
    };

    useEffect(() => {
        fetchBio();
        fetchEvents();
        fetchCvDownloadUrl();
        fetchGalleryImages();
    }, [fetchBio, fetchEvents]);

    // Handle login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError(null);
            setEmail("");
            setPassword("");
        } catch (err: any) {
            setError(err.message);
        }
    };

    // Save bio to Firestore
    const handleSave = async () => {
        if (!delta) return;
        setSaving(true);
        try {
            const ref = doc(db, "content", "bio");
            // Firestore rejects custom class instances, so store a plain JSON representation
            const plainDelta = JSON.parse(JSON.stringify(delta));
            await setDoc(ref, { delta: plainDelta }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setSaving(false);
        }
    };

    const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editingEvent) return;
        const { name, value } = e.target;
        setEditingEvent({ ...editingEvent, [name]: value });
    };

    const handleDateChange = (index: number, value: string) => {
        if (!editingEvent?.dates) return;
        const newDates = [...editingEvent.dates];
        newDates[index] = value;
        setEditingEvent({ ...editingEvent, dates: newDates });
    };

    const addDateInput = () => {
        if (!editingEvent) return;
        setEditingEvent({ ...editingEvent, dates: [...(editingEvent.dates || []), ''] });
    };

    const removeDateInput = (index: number) => {
        if (!editingEvent?.dates) return;
        const newDates = editingEvent.dates.filter((_, i) => i !== index);
        setEditingEvent({ ...editingEvent, dates: newDates });
    };

    const handleTimeChange = (index: number, value: string) => {
        if (!editingEvent?.times) return;
        const newTimes = [...editingEvent.times];
        newTimes[index] = value;
        setEditingEvent({ ...editingEvent, times: newTimes });
    };

    const addTimeInput = () => {
        if (!editingEvent) return;
        setEditingEvent({ ...editingEvent, times: [...(editingEvent.times || []), ''] });
    };

    const removeTimeInput = (index: number) => {
        if (!editingEvent?.times) return;
        const newTimes = editingEvent.times.filter((_, i) => i !== index);
        setEditingEvent({ ...editingEvent, times: newTimes });
    };

    const handleSaveEvent = async () => {
        if (!editingEvent || !editingEvent.dates || editingEvent.dates.length === 0) {
            console.error("No dates provided for the event.");
            return;
        }

        const { id, dates, ...eventData } = editingEvent;

        const datetimes = dates
            .filter(date => date) // Filter out empty strings
            .map(date => Timestamp.fromDate(new Date(`${date}T00:00:00`)))
            .sort((a, b) => a.toMillis() - b.toMillis());

        // Remove duplicates
        const uniqueDatetimes = datetimes.filter((dt, index, self) =>
            index === self.findIndex((t) => (t.seconds === dt.seconds && t.nanoseconds === dt.nanoseconds))
        );

        const dataToSave: any = { ...eventData, datetimes: uniqueDatetimes };

        // Clean up obsolete fields before saving
        delete dataToSave.date;
        delete dataToSave.datetime;
        delete dataToSave.endDate;
        delete dataToSave.endDatetime;

        try {
            if (id) {
                // Update existing event
                const eventRef = doc(db, "events", id);
                await updateDoc(eventRef, dataToSave);
            } else {
                // Add new event
                await addDoc(collection(db, "events"), { ...dataToSave, createdAt: serverTimestamp() });
            }
            fetchEvents();
            setIsEventModalOpen(false);
            setEditingEvent(null);
        } catch (err) {
            console.error("Failed to save event", err);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteDoc(doc(db, "events", eventId));
                fetchEvents();
            } catch (err) {
                console.error("Failed to delete event", err);
            }
        }
    };

    const triggerRebuild = async () => {
        setRebuilding(true);
        setRebuildStatus('idle');
        try {
            await fetch(process.env.NEXT_PUBLIC_REBUILD_URL!, {
                method: 'POST',
            });
            setRebuildStatus('success');
            setTimeout(() => setRebuildStatus('idle'), 3000);
        } catch (err) {
            console.error("Failed to trigger rebuild", err);
        } finally {
            setRebuilding(false);
        }
    };

    const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleCvUpload = async () => {
        if (!cvFile) return;
        setCvUploadStatus('uploading');
        try {
            const cvRef = ref(storage, 'cv/PerriLoCV.pdf');
            await uploadBytes(cvRef, cvFile);
            setCvUploadStatus('success');
            fetchCvDownloadUrl(); // Refresh URL after upload
            setTimeout(() => setCvUploadStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to upload CV", error);
            setCvUploadStatus('error');
        }
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(e.target.files);
        }
    };

    const handleImageUpload = async () => {
        if (!imageFiles) return;
        setGalleryUploadStatus('uploading');
        try {
            const uploadPromises = Array.from(imageFiles).map(file => {
                const imageRef = ref(storage, `gallery/${file.name}`);
                return uploadBytes(imageRef, file);
            });
            await Promise.all(uploadPromises);
            setGalleryUploadStatus('success');
            fetchGalleryImages(); // Refresh gallery
            setImageFiles(null);
            setTimeout(() => setGalleryUploadStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to upload images", error);
            setGalleryUploadStatus('error');
        }
    };

    const handleImageDelete = async (imageRef: any) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await deleteObject(imageRef);
            fetchGalleryImages(); // Refresh gallery
        } catch (error) {
            console.error("Failed to delete image", error);
        }
    };

    // ----------- UI RENDERING -------------
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <form
                    onSubmit={handleLogin}
                    className="bg-background p-6 rounded-lg border w-full max-w-sm space-y-4"
                >
                    <h1 className="text-lg font-bold text-center">Admin Login</h1>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </div>
        );
    }

    // Authenticated view
    return (
        <div className="min-h-screen p-6 flex flex-col">
            <div className="flex-grow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <Button variant="outline" onClick={() => signOut(auth)}>
                        Logout
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bio Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {delta && (
                                <div className="my-6">
                                    <QuillEditor
                                        value={delta as any}
                                        onChange={(d: any) => setDelta(d as Delta)}
                                    />
                                </div>
                            )}
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : saved ? "Saved!" : "Save Bio"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* CV Uploader */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage CV</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Input type="file" accept=".pdf" onChange={handleCvFileChange} />
                                <Button onClick={handleCvUpload} disabled={!cvFile || cvUploadStatus === 'uploading'}>
                                    {cvUploadStatus === 'uploading' ? 'Uploading...' : 'Upload New CV'}
                                </Button>
                                {cvUploadStatus === 'success' && <p className="text-green-500">CV uploaded successfully!</p>}
                                {cvUploadStatus === 'error' && <p className="text-red-500">Upload failed. Please try again.</p>}

                                {cvDownloadUrl && (
                                    <div className="pt-4">
                                        <a href={cvDownloadUrl} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline">View Current CV</Button>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Events Manager */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Upcoming Events</span>
                                <Button onClick={() => { setEditingEvent({ dates: [''], times: [''] }); setIsEventModalOpen(true); }}>Add Event</Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {events.map(event => (
                                    <div key={event.id} className="flex items-center justify-between p-2 border rounded-md">
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.datetimes && event.datetimes.length > 0 ? new Date(event.datetimes[0].seconds * 1000).toLocaleDateString() : 'No date'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => {
                                                const eventToEdit = {
                                                    ...event,
                                                    dates: event.datetimes && event.datetimes.length > 0 ? event.datetimes.map(dt => format(dt.toDate(), 'yyyy-MM-dd')) : [''],
                                                    times: event.times && event.times.length > 0 ? event.times : [''],
                                                };
                                                setEditingEvent(eventToEdit);
                                                setIsEventModalOpen(true);
                                            }}>Edit</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && <p>No upcoming events.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gallery Manager Card */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Upload New Images</h3>
                                        <Input type="file" multiple accept="image/*" onChange={handleImageFileChange} />
                                        <Button onClick={handleImageUpload} disabled={!imageFiles || galleryUploadStatus === 'uploading'} className="mt-2">
                                            {galleryUploadStatus === 'uploading' ? 'Uploading...' : 'Upload Images'}
                                        </Button>
                                        {galleryUploadStatus === 'success' && <p className="text-green-500 mt-2">Images uploaded successfully!</p>}
                                        {galleryUploadStatus === 'error' && <p className="text-red-500 mt-2">Upload failed. Please try again.</p>}
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="text-lg font-semibold mb-2">Current Gallery</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {galleryImages.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <Image src={image.url} alt={`Gallery image ${index + 1}`} width={200} height={200} className="object-cover rounded-md w-full h-full" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="destructive" size="sm" onClick={() => handleImageDelete(image.ref)}>Delete</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {galleryImages.length === 0 && <p>No images in the gallery.</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Event Edit/Add Modal */}
            {isEventModalOpen && editingEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>{editingEvent.id ? 'Edit Event' : 'Add New Event'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[80vh] overflow-y-auto">
                            <Input name="title" placeholder="Event Title" value={editingEvent.title || ''} onChange={handleEventFormChange} />

                            <div>
                                <label className="text-sm font-medium">Dates</label>
                                <div className="space-y-2 mt-2">
                                    {editingEvent.dates?.map((date, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                type="date"
                                                value={date}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                                className="w-full"
                                            />
                                            <Button variant="destructive" size="sm" onClick={() => removeDateInput(index)}>Remove</Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addDateInput}>Add Date</Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Showtimes</label>
                                <div className="space-y-2 mt-2">
                                    {editingEvent.times?.map((time, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={time}
                                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                                className="w-full"
                                            />
                                            <Button variant="destructive" size="sm" onClick={() => removeTimeInput(index)}>Remove</Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" size="sm" onClick={addTimeInput}>Add Time</Button>
                                </div>
                            </div>

                            <Input name="venue" placeholder="Venue" value={editingEvent.venue || ''} onChange={handleEventFormChange} />
                            <Input name="location" placeholder="Location" value={editingEvent.location || ''} onChange={handleEventFormChange} />
                            <Textarea name="description" placeholder="Description" value={editingEvent.description || ''} onChange={handleEventFormChange} />
                            <Input name="link" placeholder="Link (optional)" value={editingEvent.link || ''} onChange={handleEventFormChange} />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}>Cancel</Button>
                                <Button onClick={handleSaveEvent}>Save Event</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="py-8 mt-8 border-t flex justify-center">
                <Button onClick={triggerRebuild} className="px-20 py-6" disabled={rebuilding} >
                    {rebuilding ? "Rebuilding..." : rebuildStatus === 'success' ? "Triggered!" : "Re-build Site"}
                </Button>
            </div>
        </div>
    );
} 