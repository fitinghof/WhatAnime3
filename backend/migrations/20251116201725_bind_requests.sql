-- Add migration script here
CREATE TYPE bind_status AS ENUM (
    'pending',
    'denied',
    'accepted'
);

CREATE TABLE IF NOT EXISTS bind_requests (
    id SERIAL PRIMARY KEY,
    song_id INTEGER NOT NULL,
    spotify_song_id VARCHAR(22) NOT NULL,
    spotify_song_name TEXT,
    spotify_song_name_romanized TEXT,
    spotify_artists TEXT[],
    spotify_artists_romanized TEXT[],
    spotify_album_cover TEXT,

    user_id TEXT,
    status bind_status default 'pending',
    time_stamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
