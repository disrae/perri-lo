"use client";

import { ReactNode, useState } from "react";
import { useAdmin } from "./AdminContext";

type EditableContentProps = {
    defaultContent: ReactNode;
    className?: string;
};

export default function EditableContent({
    defaultContent,
    className
}: EditableContentProps) {
    const { adminState } = useAdmin();
    const [content, setContent] = useState<string>(
        typeof defaultContent === 'string' ? defaultContent : ''
    );
    const [isEditing, setIsEditing] = useState(false);

    // Handle edit click
    const handleEditClick = () => {
        if (adminState.isAdminMode) {
            setIsEditing(true);
        }
    };

    // Handle save
    const handleSave = () => {
        setIsEditing(false);
    };

    // When in admin mode, highlight editable areas and make them clickable
    const adminStyles = adminState.isAdminMode
        ? "outline outline-2 outline-offset-2 outline-blue-500 cursor-pointer hover:bg-blue-100/20 transition-colors"
        : "";

    if (isEditing && adminState.isAdminMode) {
        return (
            <div className={`${className || ""}`}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="p-2 border border-blue-500 rounded w-full min-h-[100px]"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    Save
                </button>
            </div>
        );
    }

    return (
        <div
            className={`${className || ""} ${adminStyles}`}
            onClick={handleEditClick}
        >
            {adminState.isAdminMode && typeof content === 'string' && content ? content : defaultContent}
        </div>
    );
} 