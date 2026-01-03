"use client"
import { useReportContext } from "../contexts/ReportContext"
import { useShowSettings } from "../contexts/SettingsContext"
import OptionsOverlay from "./OptionsOverlay"
import ReportOverlay from "./ReportOverlay"

interface OverlayProps {
    children: React.ReactNode
}

export const OverlayWrapper: React.FC<OverlayProps> = ({ children }) => {
    const { reportData } = useReportContext();
    const { showSettings } = useShowSettings();
    return (
        <>
            {reportData.visible && (
                <ReportOverlay></ReportOverlay>
            )}

            {showSettings && (
                <OptionsOverlay></OptionsOverlay>
            )}

            {children}
        </>

    )
}

export default OverlayWrapper;
