"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../ui/button";
import { useAdmin } from "./AdminContext";

type EditableContent = {
    section: string;
    content: string;
    type: string;
    imageUrl?: string;
};

export default function AdminEditInterface() {
    const { adminState, setAdminMode } = useAdmin();
    const [editableContent, setEditableContent] = useState<EditableContent[]>([]);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>("");
    const [editingImageUrl, setEditingImageUrl] = useState<string>("");

    // Get all content from the database
    const allContent = useQuery(api.admin.getAllSiteContent);

    // Update content mutation
    const updateContent = useMutation(api.admin.updateSiteContent);

    // Initialize editable content when data is loaded
    useEffect(() => {
        if (allContent) {
            setEditableContent(allContent.map(item => ({
                section: item.section,
                content: item.content,
                type: item.type,
                imageUrl: item.imageUrl
            })));
        }
    }, [allContent]);

    // Handle editing a section
    const handleEditSection = (section: string) => {
        const contentItem = editableContent.find(item => item.section === section);
        if (contentItem) {
            setActiveSection(section);
            setEditingContent(contentItem.content);
            setEditingImageUrl(contentItem.imageUrl || "");
        }
    };

    // Handle saving changes
    const handleSaveChanges = async () => {
        if (activeSection) {
            const contentItem = editableContent.find(item => item.section === activeSection);
            if (contentItem) {
                await updateContent({
                    section: activeSection,
                    content: editingContent,
                    type: contentItem.type,
                    imageUrl: contentItem.type === "image" ? editingImageUrl : undefined
                });

                // Update local state
                setEditableContent(prev => prev.map(item =>
                    item.section === activeSection
                        ? {
                            ...item,
                            content: editingContent,
                            imageUrl: item.type === "image" ? editingImageUrl : item.imageUrl
                        }
                        : item
                ));

                // Reset active section
                setActiveSection(null);
            }
        }
    };

    // Exit admin mode
    const handleExitAdminMode = () => {
        setAdminMode(false);
    };

    if (!adminState.isAdminMode) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Admin Edit Interface</h2>
                    <Button variant="destructive" onClick={handleExitAdminMode}>
                        Exit Admin Mode
                    </Button>
                </div>

                {activeSection ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Editing: {activeSection}</h3>

                        {editableContent.find(item => item.section === activeSection)?.type === "image" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Image URL</label>
                                <input
                                    type="text"
                                    value={editingImageUrl}
                                    onChange={(e) => setEditingImageUrl(e.target.value)}
                                    className="w-full p-2 border rounded-md mb-2"
                                />
                                {editingImageUrl && (
                                    <div className="mt-2 border rounded p-2">
                                        <p className="text-sm mb-1">Preview:</p>
                                        <img
                                            src={editingImageUrl}
                                            alt="Preview"
                                            className="max-h-40 object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full p-2 border rounded-md h-40"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setActiveSection(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveChanges}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Click on any section below to edit its content:
                        </p>

                        {editableContent.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editableContent.map((item) => (
                                    <div
                                        key={item.section}
                                        className="border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                                        onClick={() => handleEditSection(item.section)}
                                    >
                                        <h4 className="font-medium mb-1">{item.section}</h4>
                                        <p className="text-sm text-muted-foreground">Type: {item.type}</p>
                                        {item.type === "image" && item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.section}
                                                className="mt-2 max-h-20 object-contain"
                                            />
                                        )}
                                        {item.type === "text" && (
                                            <p className="mt-2 text-sm truncate">{item.content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No editable content available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 