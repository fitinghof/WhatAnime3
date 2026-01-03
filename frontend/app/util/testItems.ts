import { AnimeInfo } from "../types/Anime_types";
import { SongInfo } from "../components/HeaderContainer";
import { BindRequestInfo, BindRequest } from "../components/moderator/Bind";

export const dummySongInfo: SongInfo = {
  song_name: "Test Name",
  romanized_artists: ["A artist"],
  romanized_song_name: "",
  spotify_song_id: "",
  song_artists: ["A artist"],
  album_image: "https://cdn-images.dzcdn.net/images/cover/36a228c4cbe6fcf1490951705451e5b4/1900x1900-000000-80-0-0.jpg"
}

export const dummyAnimeInfo: AnimeInfo = {
  anime: {
    ann_id: 1001,
    eng_name: "Fullmetal Alchemist: Brotherhood",
    jpn_name: "鋼の錬金術師 FULLMETAL ALCHEMIST",
    alt_name: ["FMA: Brotherhood", "Hagane no Renkinjutsushi"],
    vintage: {
      season: "SPRING",
      year: 2009,
    },
    linked_ids: {
      myanimelist: 5114,
      anidb: 6420,
      anilist: 5114,
      kitsu: 1103,
    },
    anime_type: "TV",
    anime_index: {
      index_type: "Season",
      number: 1,
      part: 1,
    },
    mean_score: 9.2,
    banner_image:
      undefined,
    cover_image: {
      large: "https://example.com/cover/fma-brotherhood-large.jpg",
      medium: "https://example.com/cover/fma-brotherhood-medium.jpg",
    },
    format: "TV",
    genres: ["Action", "Adventure", "Fantasy"],
    source: "MANGA",
    studios: {
      nodes: [
        { id: 1, name: "Bones" },
      ],
    },
    tags: [
      { id: 1, name: "Alchemy" },
      { id: 2, name: "Brotherhood" },
    ],
    trailer: {
      id: "abcd1234",
      site: "YouTube",
    },
    episodes: 64,
    season: "SPRING",
    season_year: 2009,
  },

  song: {
    id: 5001,
    name: "Again",
    artist_name: "YUI",
    composer_name: "YUI",
    arranger_name: "YUI",
    category: "Opening",
    length: 250,
    is_dub: false,
    hq: "https://example.com/audio/again-hq.mp3",
    mq: "https://example.com/audio/again-mq.mp3",
    audio: "https://example.com/audio/again.mp3",
    artists: [
      {
        names: ["YUI"],
        id: 1,
        group_ids: [],
        member_ids: [],
      },
    ],
    composers: [
      {
        names: ["YUI"],
        id: 1,
        group_ids: [],
        member_ids: [],
      },
    ],
    arrangers: [
      {
        names: ["YUI"],
        id: 1,
        group_ids: [],
        member_ids: [],
      },
    ],
  },

  bind: {
    song_id: 5001,
    anime_ann_id: 1001,
    song_ann_id: 10001,
    difficulty: 3,
    song_index: {
      index: 1,
      index_type: "Opening",
    },
    is_rebroadcast: false,
  },
};
