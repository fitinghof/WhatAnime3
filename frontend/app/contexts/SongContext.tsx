"use client"
import { useState, ReactNode, createContext, useContext } from "react";

const defaultSongInfo: SongInfo = {
    album_image: "",
    song_name: "Loading...",
    song_artists: [],
    spotify_song_id: "",
    romanized_artists: [],
    romanized_song_name: ""
}

const SongContext = createContext<{
    songInfo: SongInfo,
    setSongInfo: React.Dispatch<React.SetStateAction<SongInfo>>,
}>({ songInfo: defaultSongInfo, setSongInfo: () => { } });

export function useSongContext() {
    return useContext(SongContext);
}

export function SongContextProvider({ children }: { children: ReactNode }) {
    const [songInfo, setSongInfo] = useState<SongInfo>(defaultSongInfo);

    return (
        <SongContext.Provider value={{ songInfo, setSongInfo }}>
            {children}
        </SongContext.Provider>
    );
}


export interface SongInfo {
    song_name: string; // Name of the song
    romanized_song_name: string,
    song_artists: string[]; // List of song artists
    romanized_artists: string[],
    album_image: string; // URL for the album image
    spotify_song_id: string; // Spotify track ID
}