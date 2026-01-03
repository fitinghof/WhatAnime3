import React from "react";
import { useSettings, useShowSettings } from "../contexts/SettingsContext";
import { useReportContext } from "../contexts/ReportContext";
import { useSongContext } from "../contexts/SongContext";
import { redirect } from "next/navigation";
import { useUserContext } from "../contexts/UserContext";

interface SettingsProp { }

const OptionsOverlay: React.FC<SettingsProp> = ({ }) => {
    const { setReportData } = useReportContext();
    const { settings, setSettings } = useSettings();
    const { setShowSettings } = useShowSettings();
    const { songInfo } = useSongContext();
    const { userData } = useUserContext();

    const Header = "text-md font-bold mt-3";
    const Button = "text-white px-2 py-1 rounded-xl hover:brightness-120";
    const buttonContainer = "space-x-2";
    const reportButton = "w-fit mb-4 mt-auto text-white px-4 py-2 rounded-xl bg-dark_red self-center hover:brightness-120"
    return (
        <div className="fixed flex flex-col h-full z-1 w-full justify-center p-4">
            <div className="relative flex w-full h-1/2 flex-col text-center bg-foreground rounded-2xl overflow-auto no-scrollbar">
                <div className="sticky top-0">
                    <button
                        className="absolute right-4 top-4 aspect-square rounded-md w-10 
                                    bg-[url('/x-close.svg')] bg-no-repeat bg-center bg-[length:2rem_2rem] hover:bg-white/10"
                        onClick={() => setShowSettings(false)}
                    ></button>
                </div>
                <div className="header mt-4">
                    <div className="text-2xl font-bold">Settings</div>
                </div>
                <div className={Header}>Filters</div>
                <div className={buttonContainer}>
                    <button className={`${Button} ${settings.showOpenings ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, showOpenings: !settings.showOpenings })}>
                        Openings</button>
                    <button className={`${Button} ${settings.showInserts ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, showInserts: !settings.showInserts })}>
                        Inserts</button>
                    <button className={`${Button} ${settings.showEndings ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, showEndings: !settings.showEndings })}>
                        Endings</button>
                </div>

                <div className={Header}>Anime Title Language</div>
                <div className={buttonContainer}>
                    <button className={`${Button} ${settings.language === "eng" ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, language: "eng" })}>
                        English</button>
                    <button className={`${Button} ${settings.language === "jpn" ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, language: "jpn" })}>
                        Japanese</button>
                </div>
                <div className={Header}>More</div>
                <div className={buttonContainer}>
                    <button className={`${Button} ${settings.romanizeSongInfo ? "bg-confirm_green" : "bg-dark_red"}`}
                        onClick={() => setSettings({ ...settings, romanizeSongInfo: !settings.romanizeSongInfo })}>
                        Romanize song info</button>
                </div>
                <div className="mb-4"></div>
                <button
                    className={reportButton}
                    onClick={() => {
                        setReportData({ annSongId: null, spotifyTrackId: songInfo.spotify_song_id, visible: true });
                    }}>
                    Report
                </button>
                {((userData.flags & 1) != 0) && (
                    <button
                        className={reportButton}
                        onClick={() => {
                            setShowSettings(false);
                            redirect("/moderator");
                        }}>
                        Moderator View
                    </button>
                )}
            </div>
        </div >
    );
};

export default OptionsOverlay;