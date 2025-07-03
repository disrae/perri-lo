"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import type { Delta } from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
    value: Delta;
    onChange: (delta: Delta) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<Quill | null>(null);

    // Initialise Quill once
    useEffect(() => {
        if (!containerRef.current) return;
        if (quillRef.current) return; // already initialised

        quillRef.current = new Quill(containerRef.current, {
            theme: "snow",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                ],
            },
        });

        // Set initial contents
        quillRef.current.setContents(value);

        // Listen for changes
        quillRef.current.on("text-change", () => {
            const delta = quillRef.current!.getContents() as Delta;
            onChange(delta);
        });
    }, [value, onChange]);

    // Update editor if external value changes
    useEffect(() => {
        if (!quillRef.current) return;
        const current = quillRef.current.getContents();
        if (JSON.stringify(current) === JSON.stringify(value)) return;
        quillRef.current.setContents(value);
    }, [value]);

    return <div ref={containerRef} />;
} 