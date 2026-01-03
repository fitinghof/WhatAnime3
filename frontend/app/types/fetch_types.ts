import {SongInfo} from "@/app/components/HeaderContainer"
import { AnimeInfo } from "./Anime_types";

export type Update =
    | "no_updates"
    | "login_required"
    | "unauthorized"
    | "not_playing"
    | { new_song: SongUpdate };

export interface SongUpdate {
    song_info: SongInfo; // Information about the current song
    anisongs: Anisongs; // Anisongs data (hit or miss)
}

export type Anisongs =
    | { hit: NewSongHit }
    | { miss: NewSongMiss };

export interface NewSongHit {
    hits: AnimeInfo[]; // List of matching songs
    more_by_artists: AnimeInfo[]; // Additional songs by the same artists
    certainty: number; // Certainty score for the match
}

export interface NewSongMiss {
    possible: AnimeInfo[]; // List of possible matches
}