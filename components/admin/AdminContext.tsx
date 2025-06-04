"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";

// The secret password to enable admin mode
const ADMIN_PASSWORD = "secretadmin";

// Admin state type
type AdminState = {
    isAdminMode: boolean;
};

// Admin context type
type AdminContextType = {
    adminState: AdminState;
    handleKeyPress: (key: string) => void;
    setAdminMode: (value: boolean) => void;
};

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export function AdminProvider({ children }: { children: ReactNode; }) {
    // State for tracking admin mode
    const [adminState, setAdminState] = useState<AdminState>({
        isAdminMode: false,
    });

    // Buffer for detecting password
    const passwordBuffer = useRef<string>("");

    // Handle key press
    const handleKeyPress = (key: string) => {
        console.log("Key pressed:", key);

        // Update the password buffer (sliding window of last ADMIN_PASSWORD.length characters)
        const newBuffer = (passwordBuffer.current + key).slice(-ADMIN_PASSWORD.length);
        passwordBuffer.current = newBuffer;

        console.log("Current buffer:", newBuffer);
        console.log("Matching against:", ADMIN_PASSWORD);

        // Check if the password matches
        if (newBuffer === ADMIN_PASSWORD) {
            console.log("PASSWORD MATCHED! Enabling admin mode");

            // Toggle admin mode
            setAdminState(prev => ({
                ...prev,
                isAdminMode: !prev.isAdminMode
            }));

            // Reset buffer after successful match
            passwordBuffer.current = "";
        }
    };

    // Set admin mode
    const setAdminModeFunction = (value: boolean) => {
        setAdminState(prev => ({
            ...prev,
            isAdminMode: value,
        }));
    };

    // Update admin indicator when admin mode changes
    useEffect(() => {
        // Update the admin indicator element if it exists
        if (typeof document !== 'undefined') {
            const indicator = document.getElementById('admin-indicator');
            if (indicator) {
                if (adminState.isAdminMode) {
                    indicator.classList.remove('hidden');
                } else {
                    indicator.classList.add('hidden');
                }
            }
        }

        console.log("Admin mode:", adminState.isAdminMode ? "ENABLED" : "DISABLED");
    }, [adminState.isAdminMode]);

    // Create context value
    const contextValue: AdminContextType = {
        adminState,
        handleKeyPress,
        setAdminMode: setAdminModeFunction,
    };

    return (
        <AdminContext.Provider value={contextValue}>
            {children}
        </AdminContext.Provider>
    );
}

// Custom hook for using the admin context
export function useAdmin() {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
} 