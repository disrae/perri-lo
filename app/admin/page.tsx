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
import { addGalleryImage, getGalleryImages, updateGalleryImage, deleteGalleryImage, updateGalleryOrder } from "@/lib/gallery";
import { GalleryImage } from "@/lib/types";
import { format } from 'date-fns';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import {
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Dynamically load QuillEditor to avoid SSR issues with window.
const QuillEditor = dynamic<{ value: any; onChange: (delta: any) => void; }>(
    () => import("@/components/quill-editor"),
    { ssr: false }
);

// Sortable Gallery Item Component
interface SortableGalleryItemProps {
    image: GalleryImage;
    onEdit: (id: string, caption: string) => void;
    onDelete: (id: string) => void;
}

function SortableGalleryItem({ image, onEdit, onDelete }: SortableGalleryItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group bg-white border rounded-lg p-3 shadow-sm"
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded cursor-grab active:cursor-grabbing hover:bg-white"
            >
                <GripVertical className="h-4 w-4 text-gray-500" />
            </div>

            <div className="flex gap-3">
                {/* Image Preview */}
                <div className="relative w-16 h-16 flex-shrink-0">
                    {!image.type || image.type === 'image' ? (
                        <Image
                            src={image.imageUrl}
                            alt={image.altText}
                            fill
                            className="object-cover rounded"
                        />
                    ) : (
                        <div className="relative w-full h-full bg-gray-100 rounded overflow-hidden">
                            <video
                                src={image.imageUrl}
                                className="w-full h-full object-cover"
                                muted
                                preload="metadata"
                                playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-l-[4px] border-l-black border-y-[3px] border-y-transparent ml-0.5"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {image.type === 'video' ? '🎬' : '📷'} {image.altText}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {image.caption || 'No caption'}
                    </p>
                    <div className="flex gap-2 mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(image.id, image.caption)}
                            className="text-xs h-6"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(image.id)}
                            className="text-xs h-6"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [galleryUploadStatus, setGalleryUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [pendingImages, setPendingImages] = useState<Array<{ file: File, caption: string, altText: string; }>>([]);
    const [editingImageId, setEditingImageId] = useState<string | null>(null);
    const [editingCaption, setEditingCaption] = useState('');

    // Reordering state
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [reorderImages, setReorderImages] = useState<GalleryImage[]>([]);
    const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

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
        try {
            const images = await getGalleryImages();
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
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error("Not authenticated!");
            }

            await fetch('/api/rebuild', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRebuildStatus('success');
            setTimeout(() => setRebuildStatus('idle'), 3000);
        } catch (err) {
            console.error("Failed to trigger rebuild", err);
            // Optionally, provide more specific feedback to the user
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
            const files = Array.from(e.target.files);
            const pendingImagesData = files.map(file => ({
                file,
                caption: '',
                altText: `Gallery image - ${file.name}`
            }));
            setPendingImages(pendingImagesData);
        }
    };

    const updatePendingImageCaption = (index: number, caption: string) => {
        setPendingImages(prev => prev.map((item, i) =>
            i === index ? { ...item, caption } : item
        ));
    };

    const handleImageUpload = async () => {
        if (pendingImages.length === 0) return;
        setGalleryUploadStatus('uploading');

        try {
            for (let i = 0; i < pendingImages.length; i++) {
                const { file, caption, altText } = pendingImages[i];

                // Upload to Firebase Storage
                const imageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(imageRef, file);
                const imageUrl = await getDownloadURL(snapshot.ref);

                // Save metadata to Firestore
                await addGalleryImage({
                    imageUrl,
                    imagePath: snapshot.ref.fullPath,
                    caption,
                    altText,
                    order: galleryImages.length + i,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    mimeType: file.type
                });
            }

            setGalleryUploadStatus('success');
            setPendingImages([]);
            fetchGalleryImages(); // Refresh gallery
            setTimeout(() => setGalleryUploadStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to upload images", error);
            setGalleryUploadStatus('error');
        }
    };

    const handleImageDelete = async (imageId: string) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            const image = galleryImages.find(img => img.id === imageId);
            if (image) {
                // Delete from Storage
                const imageRef = ref(storage, image.imagePath);
                await deleteObject(imageRef);

                // Delete from Firestore
                await deleteGalleryImage(imageId);

                fetchGalleryImages(); // Refresh gallery
            }
        } catch (error) {
            console.error("Failed to delete image", error);
        }
    };

    const startEditingCaption = (imageId: string, currentCaption: string) => {
        setEditingImageId(imageId);
        setEditingCaption(currentCaption);
    };

    const saveCaption = async (imageId: string) => {
        try {
            await updateGalleryImage(imageId, { caption: editingCaption });
            setEditingImageId(null);
            setEditingCaption('');
            fetchGalleryImages(); // Refresh gallery
        } catch (error) {
            console.error("Failed to update caption", error);
        }
    };

    const cancelEdit = () => {
        setEditingImageId(null);
        setEditingCaption('');
    };

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Reordering functions
    const enterReorderMode = () => {
        setIsReorderMode(true);
        setReorderImages([...galleryImages]);
    };

    const exitReorderMode = () => {
        setIsReorderMode(false);
        setReorderImages([]);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setReorderImages((images) => {
                const oldIndex = images.findIndex((img) => img.id === active.id);
                const newIndex = images.findIndex((img) => img.id === over?.id);

                return arrayMove(images, oldIndex, newIndex);
            });
        }
    };

    const saveNewOrder = async () => {
        setIsUpdatingOrder(true);
        try {
            const imageIds = reorderImages.map(img => img.id);
            await updateGalleryOrder(imageIds);

            // Update the main gallery images with new order
            const updatedImages = reorderImages.map((img, index) => ({
                ...img,
                order: index
            }));
            setGalleryImages(updatedImages);

            exitReorderMode();
        } catch (error) {
            console.error("Failed to update gallery order", error);
        } finally {
            setIsUpdatingOrder(false);
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
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <Button variant="outline" onClick={() => signOut(auth)}>
                        Logout
                    </Button>
                </div>

                {/* --- Static Content Section --- */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Site Content</h2>
                    <p className="text-muted-foreground mb-6">
                        Changes made in this section require you to press the "Re-build Site" button to make them visible on the live website and will go live within 2 minutes.
                    </p>
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

                        {/* Events Manager */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>Upcoming Events</span>
                                    <Button onClick={() => { setEditingEvent({ dates: [''], times: [''] }); setIsEventModalOpen(true); }}>Add Event</Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
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
                    </div>
                    {/* Rebuild Site Card */}
                    <div className="mt-8">
                        <Card className="bg-muted border-primary/20">
                            <CardHeader>
                                <CardTitle>Re-build Site</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Click this button <strong>after</strong> you have finished making all your changes to the "Bio" or "Upcoming Events" sections. This will publish your changes to the live website. You only need to do this once when you are done editing.
                                </p>
                                <Button onClick={triggerRebuild} className="px-10 py-5" disabled={rebuilding} >
                                    {rebuilding ? "Rebuilding..." : rebuildStatus === 'success' ? "Triggered!" : "Re-build Site"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* --- Dynamic Content Section --- */}
                <div>
                    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Live Assets</h2>
                    <p className="text-muted-foreground mb-6">
                        Changes to the CV and Gallery are live <strong>immediately</strong> and do not require a site re-build.
                    </p>
                    <div className="space-y-8">
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

                        {/* Gallery Manager Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Upload New Images & Videos</h3>
                                        <Input type="file" multiple accept="image/*,video/*" onChange={handleImageFileChange} />

                                        {pendingImages.length > 0 && (
                                            <div className="mt-4 space-y-4">
                                                <h4 className="font-medium">Add captions for your files:</h4>
                                                {pendingImages.map((image, index) => (
                                                    <div key={index} className="border p-3 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">
                                                                {image.file.type.startsWith('image/') ? '📷' : '🎬'}
                                                            </span>
                                                            <span className="text-sm text-gray-600">{image.file.name}</span>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Enter caption for this file..."
                                                            value={image.caption}
                                                            onChange={(e) => updatePendingImageCaption(index, e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleImageUpload}
                                            disabled={pendingImages.length === 0 || galleryUploadStatus === 'uploading'}
                                            className="mt-2"
                                        >
                                            {galleryUploadStatus === 'uploading' ? 'Uploading...' : 'Upload Files'}
                                        </Button>
                                        {galleryUploadStatus === 'success' && <p className="text-green-500 mt-2">Files uploaded successfully!</p>}
                                        {galleryUploadStatus === 'error' && <p className="text-red-500 mt-2">Upload failed. Please try again.</p>}
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">Current Gallery</h3>
                                            {galleryImages.length > 1 && (
                                                <Button
                                                    variant="outline"
                                                    onClick={isReorderMode ? exitReorderMode : enterReorderMode}
                                                    disabled={isUpdatingOrder}
                                                >
                                                    {isReorderMode ? 'Cancel Reorder' : 'Reorder Gallery'}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Reorder Mode */}
                                        {isReorderMode ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-800 mb-3">
                                                        <strong>Reorder Mode:</strong> Drag and drop items to reorder them.
                                                        Use the grip handle (⋮⋮) to drag items.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={saveNewOrder}
                                                            disabled={isUpdatingOrder}
                                                            size="sm"
                                                        >
                                                            {isUpdatingOrder ? 'Saving...' : 'Save New Order'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={exitReorderMode}
                                                            disabled={isUpdatingOrder}
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>

                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={reorderImages.map(img => img.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="space-y-2">
                                                            {reorderImages.map((image) => (
                                                                <SortableGalleryItem
                                                                    key={image.id}
                                                                    image={image}
                                                                    onEdit={startEditingCaption}
                                                                    onDelete={handleImageDelete}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            </div>
                                        ) : (
                                            /* Normal Gallery View */
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {galleryImages.map((image) => (
                                                    <div key={image.id} className="relative group space-y-2">
                                                        <div className="relative aspect-square">
                                                            {!image.type || image.type === 'image' ? (
                                                                <Image src={image.imageUrl} alt={image.altText} fill className="object-cover rounded-md" />
                                                            ) : (
                                                                <div className="relative w-full h-full bg-gray-100 rounded-md overflow-hidden">
                                                                    <video
                                                                        src={image.imageUrl}
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
                                                                        onError={() => {
                                                                            // Handle video loading errors gracefully
                                                                            console.debug('Video thumbnail loading failed');
                                                                        }}
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                                        <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                                                                            <div className="w-0 h-0 border-l-[8px] border-l-black border-y-[6px] border-y-transparent ml-1"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                                <Button variant="secondary" size="sm" onClick={() => startEditingCaption(image.id, image.caption)}>Edit</Button>
                                                                <Button variant="destructive" size="sm" onClick={() => handleImageDelete(image.id)}>Delete</Button>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                                                            {editingImageId === image.id ? (
                                                                <div className="space-y-2">
                                                                    <Textarea
                                                                        value={editingCaption}
                                                                        onChange={(e) => setEditingCaption(e.target.value)}
                                                                        placeholder="Enter caption..."
                                                                        className="min-h-[80px]"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <Button size="sm" onClick={() => saveCaption(image.id)}>Save</Button>
                                                                        <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="truncate" title={image.caption}>{image.caption || 'No caption'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {galleryImages.length === 0 && <p>No images in the gallery.</p>}
                                            </div>
                                        )}
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
        </div>
    );
} 