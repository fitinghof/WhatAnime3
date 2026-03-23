--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: anime_index_type; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.anime_index_type AS ENUM (
    'season',
    'movie',
    'ona',
    'ova',
    'tv_special',
    'special',
    'music_video',
    'unknown'
);


ALTER TYPE public.anime_index_type OWNER TO animedb_dev;

--
-- Name: anime_type; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.anime_type AS ENUM (
    'tv',
    'movie',
    'ova',
    'ona',
    'special',
    'unknown'
);


ALTER TYPE public.anime_type OWNER TO animedb_dev;

--
-- Name: bind_status; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.bind_status AS ENUM (
    'pending',
    'denied',
    'accepted'
);


ALTER TYPE public.bind_status OWNER TO animedb_dev;

--
-- Name: media_format; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.media_format AS ENUM (
    'tv',
    'tv_short',
    'movie',
    'special',
    'ova',
    'ona',
    'music',
    'manga',
    'novel',
    'one_shot'
);


ALTER TYPE public.media_format OWNER TO animedb_dev;

--
-- Name: media_source; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.media_source AS ENUM (
    'original',
    'manga',
    'light_novel',
    'visual_novel',
    'video_game',
    'other',
    'novel',
    'doujinshi',
    'anime',
    'web_novel',
    'live_action',
    'game',
    'comic',
    'multi_media_project',
    'picture_book'
);


ALTER TYPE public.media_source OWNER TO animedb_dev;

--
-- Name: release_season; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.release_season AS ENUM (
    'winter',
    'spring',
    'summer',
    'fall'
);


ALTER TYPE public.release_season OWNER TO animedb_dev;

--
-- Name: report_status; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.report_status AS ENUM (
    'pending',
    'in_progress',
    'resolved',
    'dismissed'
);


ALTER TYPE public.report_status OWNER TO animedb_dev;

--
-- Name: song_category; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.song_category AS ENUM (
    'standard',
    'instrumental',
    'character',
    'chanting',
    'no_category'
);


ALTER TYPE public.song_category OWNER TO animedb_dev;

--
-- Name: song_index_type; Type: TYPE; Schema: public; Owner: animedb_dev
--

CREATE TYPE public.song_index_type AS ENUM (
    'opening',
    'insert',
    'ending'
);


ALTER TYPE public.song_index_type OWNER TO animedb_dev;

--
-- Name: array_unique(anyarray, anyarray); Type: FUNCTION; Schema: public; Owner: animedb_dev
--

CREATE FUNCTION public.array_unique(arr1 anyarray, arr2 anyarray) RETURNS anyarray
    LANGUAGE sql
    AS $$
  SELECT COALESCE(array_agg(DISTINCT element), '{}')
  FROM unnest(COALESCE(arr1, '{}') || COALESCE(arr2, '{}')) AS t(element);
$$;


ALTER FUNCTION public.array_unique(arr1 anyarray, arr2 anyarray) OWNER TO animedb_dev;

--
-- Name: sort_int_array(integer[]); Type: FUNCTION; Schema: public; Owner: animedb_dev
--

CREATE FUNCTION public.sort_int_array(_arr integer[]) RETURNS integer[]
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT array_agg(elem ORDER BY elem)
FROM unnest(_arr) AS elem;
$$;


ALTER FUNCTION public.sort_int_array(_arr integer[]) OWNER TO animedb_dev;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: anime_song_links; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.anime_song_links (
    song_id integer,
    anime_ann_id integer,
    song_ann_id integer NOT NULL,
    difficulty double precision,
    song_index_type public.song_index_type,
    song_index_number integer,
    is_rebroadcast boolean
);


ALTER TABLE public.anime_song_links OWNER TO animedb_dev;

--
-- Name: animes; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.animes (
    ann_id integer NOT NULL,
    eng_name text NOT NULL,
    jpn_name text NOT NULL,
    alt_names text[] NOT NULL,
    vintage_release_season public.release_season,
    vintage_release_year integer,
    myanimelist_id integer,
    anidb_id integer,
    anilist_id integer,
    kitsu_id integer,
    anime_type public.anime_type,
    index_type public.anime_index_type,
    index_number integer NOT NULL,
    index_part smallint NOT NULL,
    mean_score integer,
    banner_image text,
    cover_image_color character varying(8),
    cover_image_medium text,
    cover_image_large text,
    cover_image_extra_large text,
    format public.media_format,
    genres text[],
    source public.media_source,
    studios_id integer[],
    studios_name text[],
    studios_url text[],
    tags_id integer[],
    tags_name text[],
    trailer_id text,
    trailer_site text,
    trailer_thumbnail text,
    episodes integer,
    season public.release_season,
    season_year integer
);


ALTER TABLE public.animes OWNER TO animedb_dev;

--
-- Name: artists; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.artists (
    id integer NOT NULL,
    names text[] NOT NULL,
    line_up_id integer,
    group_ids integer[] NOT NULL,
    member_ids integer[] NOT NULL
);


ALTER TABLE public.artists OWNER TO animedb_dev;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.songs (
    id integer NOT NULL,
    name text NOT NULL,
    artist_name text NOT NULL,
    composer_name text NOT NULL,
    arranger_name text NOT NULL,
    category public.song_category,
    length double precision,
    is_dub boolean,
    hq text,
    mq text,
    audio text,
    artists integer[] NOT NULL,
    composers integer[] NOT NULL,
    arrangers integer[] NOT NULL
);


ALTER TABLE public.songs OWNER TO animedb_dev;

--
-- Name: anisong_view; Type: VIEW; Schema: public; Owner: animedb_dev
--

CREATE VIEW public.anisong_view AS
 SELECT s.id AS song_id,
    s.name AS song_name,
    s.artist_name,
    s.composer_name,
    s.arranger_name,
    s.category AS song_category,
    s.length AS song_length,
    s.is_dub AS song_is_dub,
    s.hq,
    s.mq,
    s.audio,
    s.artists AS artist_ids,
    s.composers AS composer_ids,
    s.arrangers AS arranger_ids,
    a.ann_id AS anime_ann_id,
    a.eng_name AS anime_eng_name,
    a.jpn_name AS anime_jpn_name,
    a.alt_names AS anime_alt_names,
    a.vintage_release_season AS anime_vintage_season,
    a.vintage_release_year AS anime_vintage_year,
    a.myanimelist_id,
    a.anidb_id,
    a.anilist_id,
    a.kitsu_id,
    a.anime_type,
    a.index_type AS anime_index_type,
    a.index_number AS anime_index_number,
    a.index_part AS anime_index_part,
    a.mean_score AS anime_mean_score,
    a.banner_image AS anime_banner_image,
    a.cover_image_color AS anime_cover_image_color,
    a.cover_image_medium AS anime_cover_image_medium,
    a.cover_image_large AS anime_cover_image_large,
    a.cover_image_extra_large AS anime_cover_image_extra_large,
    a.format AS anime_format,
    a.genres AS anime_genres,
    a.source AS anime_source,
    a.studios_id AS anime_studios_id,
    a.studios_name AS anime_studios_name,
    a.studios_url AS anime_studios_url,
    a.tags_id AS anime_tags_id,
    a.tags_name AS anime_tags_name,
    a.trailer_id AS anime_trailer_id,
    a.trailer_site AS anime_trailer_site,
    a.trailer_thumbnail AS anime_trailer_thumbnail,
    a.episodes AS anime_episodes,
    a.season AS anime_season,
    a.season_year AS anime_season_year,
    asl.difficulty,
    asl.song_ann_id,
    asl.song_index_type,
    asl.song_index_number,
    asl.is_rebroadcast,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('id', ar.id, 'names', ar.names, 'line_up_id', ar.line_up_id, 'group_ids', ar.group_ids, 'member_ids', ar.member_ids)) AS jsonb_agg
           FROM public.artists ar
          WHERE (ar.id = ANY (s.artists))), '[]'::jsonb) AS artists,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('id', co.id, 'names', co.names, 'line_up_id', co.line_up_id, 'group_ids', co.group_ids, 'member_ids', co.member_ids)) AS jsonb_agg
           FROM public.artists co
          WHERE (co.id = ANY (s.composers))), '[]'::jsonb) AS composers,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('id', ae.id, 'names', ae.names, 'line_up_id', ae.line_up_id, 'group_ids', ae.group_ids, 'member_ids', ae.member_ids)) AS jsonb_agg
           FROM public.artists ae
          WHERE (ae.id = ANY (s.arrangers))), '[]'::jsonb) AS arrangers
   FROM ((public.anime_song_links asl
     JOIN public.animes a ON ((asl.anime_ann_id = a.ann_id)))
     JOIN public.songs s ON ((asl.song_id = s.id)));


ALTER VIEW public.anisong_view OWNER TO animedb_dev;

--
-- Name: bind_requests; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.bind_requests (
    id integer NOT NULL,
    song_id integer NOT NULL,
    spotify_song_id character varying(22) NOT NULL,
    spotify_song_name text,
    spotify_song_name_romanized text,
    spotify_artists text[],
    spotify_artists_romanized text[],
    spotify_album_cover text,
    user_id text,
    status public.bind_status DEFAULT 'pending'::public.bind_status,
    time_stamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bind_requests OWNER TO animedb_dev;

--
-- Name: bind_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: animedb_dev
--

CREATE SEQUENCE public.bind_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bind_requests_id_seq OWNER TO animedb_dev;

--
-- Name: bind_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animedb_dev
--

ALTER SEQUENCE public.bind_requests_id_seq OWNED BY public.bind_requests.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.reports (
    report_id integer NOT NULL,
    track_id character varying(22),
    ann_song_id integer,
    message text NOT NULL,
    user_name text,
    user_mail text,
    user_id character varying(32),
    created_by timestamp with time zone DEFAULT now() NOT NULL,
    status public.report_status DEFAULT 'pending'::public.report_status,
    handled_by character varying(32) DEFAULT NULL::character varying
);


ALTER TABLE public.reports OWNER TO animedb_dev;

--
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: animedb_dev
--

ALTER TABLE public.reports ALTER COLUMN report_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reports_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: songs_id_seq; Type: SEQUENCE; Schema: public; Owner: animedb_dev
--

CREATE SEQUENCE public.songs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.songs_id_seq OWNER TO animedb_dev;

--
-- Name: songs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: animedb_dev
--

ALTER SEQUENCE public.songs_id_seq OWNED BY public.songs.id;


--
-- Name: spotify_artist_links; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.spotify_artist_links (
    spotify_id character varying(22) NOT NULL,
    artist_id integer NOT NULL
);


ALTER TABLE public.spotify_artist_links OWNER TO animedb_dev;

--
-- Name: spotify_song_links; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.spotify_song_links (
    spotify_id character varying(22) NOT NULL,
    song_id integer NOT NULL
);


ALTER TABLE public.spotify_song_links OWNER TO animedb_dev;

--
-- Name: users; Type: TABLE; Schema: public; Owner: animedb_dev
--

CREATE TABLE public.users (
    name text,
    mail text,
    id character varying(32),
    binds integer DEFAULT 0 NOT NULL,
    flags bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO animedb_dev;

--
-- Name: bind_requests id; Type: DEFAULT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.bind_requests ALTER COLUMN id SET DEFAULT nextval('public.bind_requests_id_seq'::regclass);


--
-- Name: songs id; Type: DEFAULT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.songs ALTER COLUMN id SET DEFAULT nextval('public.songs_id_seq'::regclass);

--
-- Name: anime_song_links anime_song_links_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.anime_song_links
    ADD CONSTRAINT anime_song_links_pkey PRIMARY KEY (song_ann_id);


--
-- Name: animes animes_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.animes
    ADD CONSTRAINT animes_pkey PRIMARY KEY (ann_id);


--
-- Name: artists artists_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT artists_pkey PRIMARY KEY (id);


--
-- Name: bind_requests bind_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.bind_requests
    ADD CONSTRAINT bind_requests_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: spotify_artist_links spotify_artist_links_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.spotify_artist_links
    ADD CONSTRAINT spotify_artist_links_pkey PRIMARY KEY (spotify_id, artist_id);


--
-- Name: spotify_song_links spotify_song_links_pkey; Type: CONSTRAINT; Schema: public; Owner: animedb_dev
--

ALTER TABLE ONLY public.spotify_song_links
    ADD CONSTRAINT spotify_song_links_pkey PRIMARY KEY (spotify_id, song_id);


--
-- Name: anime_song_links_anime_ann_id; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX anime_song_links_anime_ann_id ON public.anime_song_links USING btree (anime_ann_id);


--
-- Name: anime_song_links_song_id; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX anime_song_links_song_id ON public.anime_song_links USING btree (song_id);


--
-- Name: idx_artist_group_ids; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_artist_group_ids ON public.artists USING gin (group_ids);


--
-- Name: idx_artist_member_ids; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_artist_member_ids ON public.artists USING gin (member_ids);


--
-- Name: idx_artist_names; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_artist_names ON public.artists USING btree (names);


--
-- Name: idx_song_artists; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_song_artists ON public.songs USING gin (artists);


--
-- Name: idx_song_composers; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_song_composers ON public.songs USING gin (composers);


--
-- Name: idx_song_name; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE INDEX idx_song_name ON public.songs USING btree (name);


--
-- Name: unique_song_artists_name; Type: INDEX; Schema: public; Owner: animedb_dev
--

CREATE UNIQUE INDEX unique_song_artists_name ON public.songs USING btree (name, public.sort_int_array(artists));


--
-- PostgreSQL database dump complete
--

