import React, { useEffect } from "react";
import { useState } from "react";
import { useReportContext } from "../contexts/ReportContext";

interface ReportInfo {
}

const ReportOverlay: React.FC<ReportInfo> = ({ }) => {
    const [message, setReason] = useState(""); // Stores the report reason
    const { reportData, setReportData } = useReportContext();

    useEffect(() => {
        console.log(reportData.visible)
    }, [])

    const handleSubmit = () => {
        const params = {
            track_id: reportData.spotifyTrackId,
            ann_song_id: reportData.annSongId,
            message: message,
        };
        fetch("/api/report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params)
        })
            .then(response => response.text())
            .then(data => {
                console.log(data);
            })
        console.log("Report Submitted:", message, reportData.annSongId, reportData.spotifyTrackId);
        setReportData({ ...reportData, visible: false });
        setReason(""); // Reset the input field
    };

    return (
        <div className="fixed w-full h-full inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="flex flex-col bg-foreground rounded-xl shadow-xl w-3/4 h-1/2 p-6 animate-scale-in">
                <h2 className="text-xl font-semibold mb-4">Report Issue</h2>

                <textarea
                    value={message}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full h-full p-3 rounded-md border border-gray-300 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex gap-4 mt-4 justify-center">
                    <button
                        onClick={() => setReportData({ ...reportData, visible: false })}
                        className="justify-center flex w-60 px-4 py-2 rounded-md border-gray-300 bg-dark_red transition hover:scale-101"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="justify-center flex w-60 px-4 py-2 rounded-md bg-primary text-white bg-confirm_green hover:scale-101"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ReportOverlay;