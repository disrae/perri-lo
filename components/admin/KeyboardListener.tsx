"use client";

import { useEffect } from "react";
import { useAdmin } from "./AdminContext";

export default function KeyboardListener() {
    const { handleKeyPress } = useAdmin();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore special keys like Shift, Ctrl, Alt, etc.
            // Only process alphanumeric keys and symbols (basically anything that produces a character)
            if (e.key.length === 1) {
                console.log("KeyboardListener detected key:", e.key);
                handleKeyPress(e.key);
            }
        };

        // Add global keyboard listener
        window.addEventListener("keydown", handleKeyDown);
        console.log("KeyboardListener mounted, listening for keys");

        // Clean up on unmount
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            console.log("KeyboardListener unmounted");
        };
    }, [handleKeyPress]);

    // This component doesn't render anything visible
    return null;
} 