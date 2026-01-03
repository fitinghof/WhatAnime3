export interface AnimeInfo {
    anime: DBAnime; // Anime information
    song: SimplifiedAnisongSong; // Song information
    bind: DBAnisongBind; // Binding information between song and anime
}

export interface DBAnime {
    ann_id: number; // AnisongDB anime ID
    eng_name: string; // English name of the anime
    jpn_name: string; // Japanese name of the anime
    alt_name: string[]; // Alternative names for the anime
    vintage?: Release; // Release season and year
    linked_ids: AnimeListLinks; // Linked IDs for external databases
    anime_type?: AnimeType; // Type of the anime (e.g., TV, Movie, OVA)
    anime_index: AnimeIndex; // Index information for the anime
    mean_score?: number; // Mean score of the anime
    banner_image?: string; // URL for the banner image
    cover_image: CoverImage; // Cover image information
    format?: MediaFormat; // Format of the anime (e.g., TV, Movie)
    genres: string[]; // List of genres
    source?: MediaSource; // Source material (e.g., Manga, Light Novel)
    studios: StudioConnection; // Studio information
    tags: MediaTag[]; // Tags associated with the anime
    trailer?: MediaTrailer; // Trailer information
    episodes?: number; // Number of episodes
    season?: ReleaseSeason; // Release season (e.g., Spring, Summer)
    season_year?: number; // Release year
}

export interface AnimeIndex {
    index_type: AnimeIndexType; // Type of the anime index (e.g., Season, Movie, OVA)
    number: number; // Index number (e.g., season number, movie number)
    part: number; // Part of the index (e.g., part 1, part 2)
}

export type AnimeIndexType =
    | "Season"
    | "Movie"
    | "ONA"
    | "OVA"
    | "TVSpecial"
    | "Special"
    | "MusicVideo"
    | "Unknown";

export interface SimplifiedAnisongSong {
    id: number; // Song ID
    name: string; // Name of the song
    artist_name: string; // Name of the main artist
    composer_name: string; // Name of the composer
    arranger_name: string; // Name of the arranger
    category: SongCategory; // Category of the song (e.g., Opening, Ending)
    length?: number; // Length of the song in seconds
    is_dub: boolean; // Whether the song is a dub
    hq?: string; // High-quality audio URL
    mq?: string; // Medium-quality audio URL
    audio?: string; // Audio URL
    artists: SimplifiedArtist[]; // List of artists
    composers: SimplifiedArtist[]; // List of composers
    arrangers: SimplifiedArtist[]; // List of arrangers
}

export interface DBAnisongBind {
    song_id?: number; // Song ID
    anime_ann_id?: number; // AnisongDB anime ID
    song_ann_id: number; // AnisongDB song ID
    difficulty?: number; // Difficulty rating
    song_index: AnimeTrackIndex; // Song index information
    is_rebroadcast: boolean; // Whether the song is for a rebroadcast
}

export interface SimplifiedArtist {
    names: string[]; // List of names for the artist
    id: number; // Artist ID
    line_up_id?: number; // Line-up ID
    group_ids: number[]; // IDs of groups the artist belongs to
    member_ids: number[]; // IDs of members in the group
}

export interface Release {
    season: ReleaseSeason; // Release season (e.g., Spring, Summer)
    year: number; // Release year
}

export interface AnimeListLinks {
    myanimelist?: number; // MyAnimeList ID
    anidb?: number; // AniDB ID
    anilist?: number; // AniList ID
    kitsu?: number; // Kitsu ID
}

export interface CoverImage {
    large: string; // URL for the large cover image
    medium: string; // URL for the medium cover image
}

export interface StudioConnection {
    nodes: Studio[]; // List of studio edges
}

// export interface StudioEdge {
//   node: Studio; // Studio information
// }

export interface Studio {
    id: number; // Studio ID
    name: string; // Studio name
}

export interface MediaTag {
    id: number; // Tag ID
    name: string; // Tag name
}

export interface MediaTrailer {
    id: string; // Trailer ID
    site: string; // Site hosting the trailer (e.g., YouTube)
}

export interface AnimeTrackIndex {
    index: number; // Index of the song (e.g., Opening 1, Ending 2)
    index_type: SongIndexType;
}

export type SongIndexType = "Opening" | "Insert" | "Ending";

export type AnimeType = "TV" | "Movie" | "OVA" | "ONA" | "Special";

export type ReleaseSeason = "SPRING" | "SUMMER" | "FALL" | "WINTER";

export type MediaFormat =
    | "TV"
    | "TV_SHORT"
    | "MOVIE"
    | "OVA"
    | "ONA"
    | "SPECIAL";

export type MediaSource =
    | "MANGA"
    | "LIGHT_NOVEL"
    | "ORIGINAL"
    | "GAME"
    | "OTHER";

export type SongCategory = "Opening" | "Ending" | "Insert";