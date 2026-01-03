import React, { useEffect, useState } from "react";
import { AnimeInfo, SimplifiedAnisongSong, } from "@/app/types/Anime_types"
import { RenderIfSome } from "@/app/util/utility";
import { SongInfo } from "../HeaderContainer";

export interface BindRequest {
    bind_id: number,
    song_id: number,
    spotify_song_id: string,
    spotify_song_name: string,
    spotify_song_name_romanized: string,
    spotify_artists: Array<string>,
    spotify_artists_romanized: Array<string>,
    spotify_album_cover: string | undefined,
    user_id: string,
    status: ReportStatus,
}

type ReportStatus = "pending" | "accepted" | "denied";

export interface BindRequestInfo {
    song: SimplifiedAnisongSong,
    bind_request: BindRequest
}

interface BindProps {
    info: BindRequestInfo,
    postAccept: (info: BindRequestInfo) => void,
    postDeny: (info: BindRequestInfo) => void,
}

const Bind: React.FC<BindProps> = ({ info, postAccept, postDeny }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    return (
        <div className="flex flex-col bg-black/50 rounded-2xl transition p-4 hover:scale-101">
            <div
                className="flex flex-row w-full gap-2"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex flex-col flex-grow">
                    <div className="text-white">
                        <div className="">
                            {`Song: ${info.song.name}`}
                        </div>
                        <div className="text-white">
                            <div>{`Artists: ${info.song.artists.map(a => a.names[0]).join(", ")}`}</div>
                        </div>
                        <div className="">
                            {`Status: ${info.bind_request.status}`}
                        </div>
                    </div>

                </div>

                {/* Divider */}
                <div className="w-2 min-w-2 bg-black/60 mx-2 rounded-2xl"></div>

                <div
                    className="relative flex flex-col w-40 px-3 items-center rounded-2xl transition hover:scale-105 hover:bg-white/10"
                    onClick={() => window.open(`https://open.spotify.com/track/${info.bind_request.spotify_song_id}`, "_blank")}
                >
                    <div className="text-lg z-1">
                        {info.bind_request.spotify_song_name}
                    </div>
                    <div className="text-white z-1">
                        <div>{info.bind_request.spotify_artists.join(", ")}</div>
                    </div>

                    <div
                        className="absolute rounded-2xl w-full h-full bg-no-repeat bg-center bg-cover brightness-50"
                        style={{ backgroundImage: `url(${info.bind_request.spotify_album_cover})` }}
                    >
                    </div>
                </div>

            </div>
            {expanded && (
                <div className="flex flex-row gap-4 mt-4">
                    <button
                        className="bg-dark_red rounded-2xl flex flex-1 items-center justify-center p-2 transition hover:scale-105"
                        onClick={onDeny}
                    >
                        Deny
                    </button>
                    <button
                        className="bg-confirm_green rounded-2xl flex flex-1 items-center justify-center p-2 transition hover:scale-105"
                        onClick={onAccept}
                    >
                        Accept
                    </button>
                </div>
            )}
        </div>
    )
    function onAccept() {
        const url = `/api/update_bind_request?bind_id=${info.bind_request.bind_id.toString(10)}&new_status=Accepted`;
        console.log(url);
        fetch(url).then(r => r.text().then(d => console.log(d)));
        postAccept(info);
    }

    function onDeny() {
        const url = `/api/update_bind_request?bind_id=${info.bind_request.bind_id.toString(10)}&new_status=Denied`;
        fetch(url).then(r => r.text().then(d => console.log(d)));
        postDeny(info);
    }
}

export default Bind;