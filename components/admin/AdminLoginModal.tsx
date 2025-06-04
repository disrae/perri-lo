"use client";

import { useEffect } from "react";
import { useAdmin } from "./AdminContext";
import { Button } from "../ui/button";

export default function AdminLoginModal() {
    const { adminState, resetPassword, submitAdminPassword, toggleAdminLogin } = useAdmin();

    // Auto-focus on the password field when modal appears
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Only process if the admin login modal is shown
            if (adminState.showAdminLoginModal) {
                if (e.key === "Enter") {
                    submitAdminPassword();
                } else if (e.key === "Escape") {
                    toggleAdminLogin();
                } else if (e.key === "Backspace") {
                    resetPassword();
                } else if (e.key.length === 1) {
                    // Only add alphanumeric keys and symbols to the password
                    // Ignore special keys like Shift, Ctrl, etc.
                    e.preventDefault();
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [adminState.showAdminLoginModal, submitAdminPassword, toggleAdminLogin, resetPassword]);

    if (!adminState.showAdminLoginModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
                <p className="mb-4">Please enter the admin password to continue.</p>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={"●".repeat(adminState.enteredPassword.length)}
                        className="w-full p-2 border rounded-md"
                        readOnly
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={toggleAdminLogin}>
                        Cancel
                    </Button>
                    <Button onClick={submitAdminPassword}>
                        Login
                    </Button>
                </div>
            </div>
        </div>
    );
} 