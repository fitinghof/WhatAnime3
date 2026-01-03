import React, { useEffect, useState } from "react";
import { AnimeInfo, } from "@/app/types/Anime_types"
import AnimeEntry, { AnimeEntryConfig, linked_ids } from "../AnimeEntry";
import { useSettings } from "@/app/contexts/SettingsContext";



export interface ReportProps {
    report: UserReport,
}

const Report: React.FC<ReportProps> = ({ report }) => {
    const { settings } = useSettings();
    const [expanded, setExpanded] = useState<boolean>(false);
    const buttonClassName = "flex-grow bg-confirm_green rounded-2xl basis-0 transition hover:scale-102";

    const config: AnimeEntryConfig = {
        show_confirm_button: false,
        show_report_button: false,
        language: settings.language,
        open_report_window: () => { },
        after_anime_bind: () => { },
    }

    return (
        <div
            className="flex flex-col bg-black/50 rounded-2xl gap-4 transition p-4 hover:scale-101"
        >
            <div
                className="flex flex-row flex-grow"
                onClick={() => {
                    setExpanded(!expanded)
                }
                }
            >
                <div
                    className="flex flex-col flex-grow"
                >
                    <div>
                        {report.report.user.display_name}
                    </div>
                    <div className={`${expanded ? "" : "line-clamp-3"}`}>
                        {report.report.message}
                    </div>

                </div>
                <div
                    className="flex flex-col min-w-24 aspect-square bg-black/50 rounded-2xl items-center justify-center hover:bg-black/30"
                    onClick={() => window.open(`https://open.spotify.com/track/${report.report.track_id}`, "_blank")}
                >
                    <div className="pb-1">
                        Spotify
                    </div>
                </div>
            </div>

            {expanded && (
                <>
                    <div>
                        <AnimeEntry anime={report.anisong} config={config}></AnimeEntry>
                    </div>
                    <div className="flex flex-row flex-grow gap-4">

                        <button className={buttonClassName}
                            onClick={() => sendReportAction(report.report.report_id, "Unbind")}
                        >Shall do stuff</button>

                        <button className={buttonClassName}
                            onClick={() => sendReportAction(report.report.report_id, "Unbind")}
                        >Shall do stuff</button>

                        <button className={buttonClassName}
                            onClick={() => sendReportAction(report.report.report_id, "Unbind")}
                        >Shall do stuff</button>

                        <button className={buttonClassName}
                            onClick={() => sendReportAction(report.report.report_id, "Unbind")}
                        >Shall do stuff</button>
                    </div>

                </>
            )}
        </div>
    )
}



type ReportActions = "Unbind" | ""

function sendReportAction(report_id: number, reportAction: ReportActions) {
    console.log("doesn't do stuff yet though");
}

export default Report;

export interface UserReport {
    anisong: AnimeInfo,
    report: Report
}

export type ReportStatus = "Pending" | "InProgress" | "Resolved" | "Dismissed";

export interface SpotifyUser {
    display_name: string | null,
    email: string | null,
    id: string
}

export interface Report {
    report_id: number,
    track_id: string | null,
    song_ann_id: number | null,
    message: string,
    user: SpotifyUser,
    status: ReportStatus,
}