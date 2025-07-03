"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { auth, db } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";

// Dynamically load QuillEditor to avoid SSR issues with window.
const QuillEditor = dynamic<{ value: any; onChange: (delta: any) => void; }>(
    () => import("@/components/quill-editor"),
    { ssr: false }
);

interface Delta {
    ops: any[];
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

    useEffect(() => {
        fetchBio();
    }, [fetchBio]);

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

    // ----------- UI RENDERING -------------
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <form
                    onSubmit={handleLogin}
                    className="bg-background p-6 rounded-lg border w-full max-w-sm space-y-4"
                >
                    <h1 className="text-lg font-bold text-center">Admin Login</h1>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                    <input
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
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">Edit Bio</h1>
                    <Button variant="outline" onClick={() => signOut(auth)}>
                        Logout
                    </Button>
                </div>

                {delta && (
                    <div className="my-6">
                        <QuillEditor
                            value={delta as any}
                            onChange={(d: any) => setDelta(d as Delta)}
                        />
                    </div>
                )}

                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </Button>
            </div>

            <div className="py-4 flex justify-center">
                <Button onClick={triggerRebuild} className="px-20 py-6" disabled={rebuilding} >
                    {rebuilding ? "Rebuilding..." : rebuildStatus === 'success' ? "Triggered!" : "Re-build Site"}
                </Button>
            </div>
        </div>
    );
} 