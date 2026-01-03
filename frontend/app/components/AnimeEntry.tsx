import React, { useEffect, useState } from "react";
import { AnimeInfo, ReleaseSeason, MediaSource, AnimeIndex, AnimeTrackIndex, AnimeListLinks } from "@/app/types/Anime_types";
import ListEntry, { generateSeperator, makeBindRequest } from "@/app/util/utility"
import { Language } from "../contexts/SettingsContext";
import { useSongContext } from "../contexts/SongContext";
import { useReportContext } from "../contexts/ReportContext";


interface AnimeEntryProps {
    anime: AnimeInfo;
    config: AnimeEntryConfig;
}

export interface AnimeEntryConfig {
    show_confirm_button: boolean;
    show_report_button: boolean;
    language: Language;
    after_anime_bind: () => void;
    open_report_window: (anisong_ann_id: number) => void;
}

const AnimeEntry: React.FC<AnimeEntryProps> = ({ anime, config }) => {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const { songInfo } = useSongContext();
    const { setReportData } = useReportContext();

    useEffect(() => {
        setShowMoreInfo(false);
    }, [anime]);

    const handleConfirmClick = () => {
        makeBindRequest(anime.song.id, songInfo.spotify_song_id);
    };

    let animeSongNumber = parseTrackIndex(anime.bind.song_index);
    let animeIndex = parseAnimeIndex(anime.anime.anime_index);
    let source = formatSource(anime.anime.source);
    let release_season = formatReleaseSeason(anime.anime.vintage?.season);
    let title =
        config.language === "eng" ? anime.anime.eng_name : anime.anime.jpn_name;

    const iconClass = "relative min-w-20 w-20 aspect-square rounded-xl"
    const scoreClass = "relative min-w-20 w-20 aspect-square bg-no-repeat bg-center bg-contain flex items-center justify-center"
    const sharedSideContainers = "flex flex-col"
    const animeInfoText = "flex flex-row justify-center flex-wrap"
    const extraInfo = "text-white text-sm flex-1 min-w-35 space-y-0"

    return (
        <>
            <ListEntry className="transition hover:scale-101"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${anime.anime.banner_image ?? "/amq_icon_green.svg"
                        })`,
                }}
                onClick={() => setShowMoreInfo(!showMoreInfo)}
            >
                <div className={sharedSideContainers}>
                    <img
                        src={anime.anime.cover_image.medium ?? "/amq_icon_green.svg"}
                        alt="Anime art"
                        className={iconClass}
                        onError={(e) => {
                            e.currentTarget.src = "/amq_icon_green.svg"; // Fallback to SVG
                        }}
                    />
                    {showMoreInfo && config.show_report_button && (
                        <div className="mt-auto">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setReportData({ spotifyTrackId: songInfo.spotify_song_id, annSongId: anime.bind.song_ann_id, visible: true });
                                }}
                                className="bg-foreground w-20 aspect-square rounded-2xl self-center hover:bg-dark_red"
                            >
                                Report
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-col text-center self-center min-w-0">
                    <div className="font-semibold break-words">{title || "Unknown Anime"}</div>
                    {showMoreInfo && (
                        <div className={animeInfoText}>
                            <div className={extraInfo}>
                                {generateSeperator("Song Info", "#ffffff")}
                                {/* Insert x */}
                                <div>{animeSongNumber}</div>

                                {/* Song name */}
                                <div>
                                    {`Song: ${anime.song.name}`}
                                </div>

                                {/* Artists */}
                                <div>
                                    {`Artists: ${anime.song.artists
                                        .map((a) => a.names[0])
                                        .join(", ")}`}
                                </div>

                                {/* Composers */}
                                <div>
                                    {`Composers: ${anime.song.composers
                                        .map((a) => a.names[0])
                                        .join(", ")}`}
                                </div>

                                {/* Arrangers */}
                                <div>
                                    {`Arrangers: ${anime.song.arrangers
                                        .map((a) => a.names[0])
                                        .join(", ")}`}
                                </div>
                            </div>
                            {showMoreInfo && (
                                <div
                                    className={extraInfo}
                                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                                >
                                    {generateSeperator("Anime Info", "#ffffff")}

                                    {/* Season */}
                                    <div className="anime-info-text">{`${animeIndex}`}</div>

                                    {/* Episodes */}
                                    {anime.anime.episodes && (
                                        <div className="anime-info-text">
                                            {`Episodes: ${anime.anime.episodes}`}
                                        </div>
                                    )}

                                    {/* Release date */}
                                    {anime.anime.vintage && (
                                        <div className="anime-info-text">
                                            {`Release: ${release_season} ${anime.anime.vintage?.year}`}
                                        </div>
                                    )}

                                    {/* Source */}
                                    {source && (
                                        <div className="anime-info-text">{`Source: ${source}`}</div>
                                    )}

                                    {/* Anime Type */}
                                    <div className="anime-info-text">
                                        {`Type: ${anime.anime.anime_type || "Unknown"}`}
                                    </div>

                                    {/* Anime Type */}
                                    {anime.anime.genres.length !== 0 && (
                                        <div className="anime-info-text">
                                            {`Genres: ${anime.anime.genres.join(", ")}`}
                                        </div>
                                    )}

                                    {/* Studios */}
                                    {anime.anime.studios.nodes.length !== 0 && false && (
                                        <div className="anime-info-text">
                                            {`Studios: ${anime.anime.studios.nodes.map((a) => a.name).join(", ")}`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {showMoreInfo && linked_ids(anime.anime.linked_ids)}
                </div>
                <div className={sharedSideContainers}>
                    <div
                        className={scoreClass}
                        style={{ backgroundImage: `url('star.svg')` }}
                    >
                        <div className="text-background font-medium text-3xl mt-2">{anime.anime.mean_score ?? ""}</div>
                    </div>
                    {config.show_confirm_button && showMoreInfo && (
                        <div className="mt-auto">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleConfirmClick();
                                }}
                                className="bg-foreground w-20 aspect-square rounded-2xl self-center hover:bg-confirm_green"
                            >
                                Request<br></br>Bind
                            </button>
                        </div>
                    )}
                </div>
            </ListEntry>
        </>
    );
};

export default AnimeEntry;

function formatReleaseSeason(
    release_season: ReleaseSeason | undefined
): string | null {
    switch (release_season) {
        case "SPRING":
            return "Spring";
        case "SUMMER":
            return "Summer";
        case "FALL":
            return "Fall";
        case "WINTER":
            return "Winter";
    }
    return null;
}

function formatSource(source: MediaSource | undefined): string | null {
    switch (source) {
        case "GAME":
            return "Game";
        case "LIGHT_NOVEL":
            return "Light Novel";
        case "MANGA":
            return "Manga";
        case "ORIGINAL":
            return "Original";
        case "OTHER":
            return null;
    }
    return null;
}

function parseAnimeIndex(animeIndex: AnimeIndex): string {
    switch (animeIndex.index_type) {
        case "Season":
            return `Season ${animeIndex.number || 1}`;
        case "Movie":
            return `Movie ${animeIndex.number || 1}`;
        case "ONA":
            return `ONA ${animeIndex.number || 1}`;
        case "OVA":
            return `OVA ${animeIndex.number || 1}`;
        case "TVSpecial":
            return `TV Special ${animeIndex.number || 1}`;
        case "Special":
            return `Special ${animeIndex.number || 1}`;
        case "MusicVideo":
            return `Music Video ${animeIndex.number || 1}`;
        default:
            return "Unknown season";
    }
}

function parseTrackIndex(track: AnimeTrackIndex): string {
    if (!track) return "";

    switch (track.index_type) {
        case "Opening":
            return `Opening ${track.index || "1"}`;
        case "Insert":
            return `Insert Song ${track.index || ""}`;
        case "Ending":
            return `Ending ${track.index || "1"}`;
        default:
            return "";
    }
}

const animeLinks = "flex flex-wrap text-link_color gap-x-5 justify-center font-bold"
const singularLink = "hover:underline"
export function linked_ids(anime_ids: AnimeListLinks) {
    if (anime_ids === undefined) return null;
    return (
        <div className={animeLinks}>
            {anime_ids.myanimelist && (
                <a
                    href={`https://myanimelist.net/anime/${anime_ids.myanimelist}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={singularLink}
                >
                    MAL
                </a>
            )}
            {anime_ids.anilist && (
                <a
                    href={`https://anilist.co/anime/${anime_ids.anilist}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={singularLink}
                >
                    Anilist
                </a>
            )}
            {anime_ids.anidb && (
                <a
                    href={`https://anidb.net/anime/${anime_ids.anidb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={singularLink}
                >
                    AniDB
                </a>
            )}
            {anime_ids.kitsu && (
                <a
                    href={`https://kitsu.io/anime/${anime_ids.kitsu}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={singularLink}
                >
                    Kitsu
                </a>
            )}
        </div>
    );
}
