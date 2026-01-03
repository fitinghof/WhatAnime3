"use client"
import { useState, ReactNode, createContext, useContext } from "react";
import OptionsOverlay from "../overlays/OptionsOverlay";

const defaultSettings: Settings = {
    showOpenings: true,
    showInserts: true,
    showEndings: true,
    romanizeSongInfo: false,

    language: "eng",
}

const SettingsContext = createContext<{
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}>({
    settings: defaultSettings,
    setSettings: () => { },
});

const ShowSettingsWindowContext = createContext<{
    showSettings: boolean;
    setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    showSettings: false,
    setShowSettings: () => { },
});

export function useShowSettings() {
    return useContext(ShowSettingsWindowContext);
}

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    return (
        <ShowSettingsWindowContext value={{ showSettings, setShowSettings }}>
            <SettingsContext.Provider value={{ settings, setSettings }}>
                {children}
            </SettingsContext.Provider>
        </ShowSettingsWindowContext>
    );
}

export interface Settings {
    showOpenings: boolean,
    showInserts: boolean,
    showEndings: boolean,
    romanizeSongInfo: boolean,

    language: Language,
}

export type Language = "eng" | "jpn";