"use client"
import { useState, ReactNode, createContext, useContext } from "react";
import { SongInfo } from "../components/HeaderContainer";
import { dummySongInfo } from "../util/testItems";
import ReportOverlay from "../overlays/ReportOverlay";
import { useSongContext } from "./SongContext";

const defaultReportData: ReportData = {
    visible: false,
    annSongId: null,
    spotifyTrackId: null
}

const ReportContext = createContext<{
    reportData: ReportData,
    setReportData: React.Dispatch<React.SetStateAction<ReportData>>,
}>({ reportData: defaultReportData, setReportData: () => { } });

export function useReportContext() {
    return useContext(ReportContext);
}

export function ReportContextProvider({ children }: { children: ReactNode }) {
    const [reportData, setReportData] = useState<ReportData>(defaultReportData);

    return (
        <ReportContext.Provider value={{ reportData, setReportData }}>
            {children}
        </ReportContext.Provider>
    );
}



export interface ReportData {
    visible: boolean,
    annSongId: number | null,
    spotifyTrackId: string | null
}