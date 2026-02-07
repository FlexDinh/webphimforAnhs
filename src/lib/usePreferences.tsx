"use client";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";

// Types
interface UserPreferences {
    // Server preferences
    preferredServer: "vietsub" | "thuyet-minh" | "auto";

    // Theme
    accentColor: string;
    theaterMode: boolean;

    // Homepage sections
    hiddenSections: string[];
}

const defaultPreferences: UserPreferences = {
    preferredServer: "auto",
    accentColor: "#FFD875",
    theaterMode: false,
    hiddenSections: [],
};

// Hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    const setValue = (value: T) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

// Context
interface PreferencesContextType {
    preferences: UserPreferences;
    updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
    toggleSection: (sectionId: string) => void;
    resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

// Provider
export function PreferencesProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
        "rophim-preferences",
        defaultPreferences
    );

    const updatePreference = <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => {
        setPreferences({ ...preferences, [key]: value });
    };

    const toggleSection = (sectionId: string) => {
        const hidden = preferences.hiddenSections;
        const newHidden = hidden.includes(sectionId)
            ? hidden.filter((id) => id !== sectionId)
            : [...hidden, sectionId];
        updatePreference("hiddenSections", newHidden);
    };

    const resetPreferences = () => {
        setPreferences(defaultPreferences);
    };

    // Apply accent color CSS variable
    useEffect(() => {
        document.documentElement.style.setProperty("--accent-color", preferences.accentColor);
    }, [preferences.accentColor]);

    return (
        <PreferencesContext.Provider
            value={{ preferences, updatePreference, toggleSection, resetPreferences }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

// Hook to use preferences
export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error("usePreferences must be used within PreferencesProvider");
    }
    return context;
}

// Preset accent colors
export const ACCENT_COLORS = [
    { name: "Vàng Gold", value: "#FFD875" },
    { name: "Hồng", value: "#FF6B9D" },
    { name: "Xanh Dương", value: "#4DA6FF" },
    { name: "Xanh Lá", value: "#4ADE80" },
    { name: "Tím", value: "#A78BFA" },
    { name: "Cam", value: "#FB923C" },
    { name: "Đỏ", value: "#F87171" },
    { name: "Cyan", value: "#22D3EE" },
];
