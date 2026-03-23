use std::{
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use anisong_api::{AnisongAPI, models::SongAnnId};
use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
};
use database_api::{
    Database,
    models::{DBAnisong, DBBindRequest, DBUser, Report},
};
use log::{error, info};
use reqwest::Url;
use serde::{Deserialize, Serialize};
use spotify_api::{
    SpotifyAPI,
    models::{ClientID, ClientSecret, CurrentlyPlaying, TokenResponse},
};
use tower_sessions::Session;
use what_anime_shared::{SongID, SpotifyTrackID, SpotifyUserID};

use crate::what_anime::{models::ModeratorData, utility::select_best};

use super::{
    models::{self, NewSongHit, NewSongMiss, SongInfo, SongUpdate},
    utility::{pair_artists, select_best_by_song_title},
};

pub struct AppState<D, S, A>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    pub database: D,
    pub spotify_api: S,
    pub _anisong_api: A,
    pub client_id: ClientID,
    pub client_secret: ClientSecret,
    pub redirect_uri: Url,
}

pub async fn login<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
) -> impl IntoResponse
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    let (state, url) = app_state
        .spotify_api
        .generate_login_link(app_state.client_id.clone(), app_state.redirect_uri.clone());

    insert_state(session, state).await.expect("Sad if failure");

    Redirect::to(url.as_str())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateParams {
    refresh: Option<bool>,
}

const AUTO_BIND_LIMIT: f32 = 80.0;

pub async fn update<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
    Query(params): Query<UpdateParams>,
) -> impl IntoResponse
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    let token = get_token_data(
        &session.clone(),
        &app_state.spotify_api,
        app_state.client_id.clone(),
        app_state.client_secret.clone(),
    )
    .await
    .unwrap();

    let token = match token {
        Some(t) => t,
        None => return axum::Json(models::Update::LoginRequired),
    };

    match app_state.spotify_api.get_current(token.access_token).await {
        Ok(p) => match p {
            CurrentlyPlaying::Track(t) => {
                if params.refresh != Some(true) {
                    let prev_played = get_prev_played(session.clone()).await.unwrap();
                    if prev_played.as_ref() == Some(&t.id) {
                        return axum::Json(models::Update::NoUpdates);
                    }
                }
                insert_prev_played(session.clone(), t.id.clone())
                    .await
                    .unwrap();

                let anisongs = app_state
                    .database
                    .get_anisongs_by_song_id(t.id.clone())
                    .await;
                if !anisongs.is_empty() {
                    let hit_id = anisongs[0]
                        .song
                        .id
                        .expect("anisong from database should always contain an id");
                    let (hits, more_by_artists): (Vec<DBAnisong>, Vec<DBAnisong>) = anisongs
                        .into_iter()
                        .partition(|a| a.song.id == Some(hit_id));

                    let artist_pairs =
                        pair_artists(t.artists.clone(), hits[0].song.artists.clone());
                    let artist_binds = artist_pairs
                        .into_iter()
                        .filter_map(|a| {
                            if a.2 > AUTO_BIND_LIMIT {
                                Some((a.1.id, a.0.id))
                            } else {
                                None
                            }
                        })
                        .collect();
                    app_state.database.bind_artists(artist_binds).await;

                    return axum::Json(models::Update::NewSong(SongUpdate {
                        song_info: SongInfo::from_track(&t),
                        anisongs: models::Anisongs::Hit(NewSongHit {
                            hits,
                            more_by_artists,
                            certainty: 100,
                        }),
                    }));
                }
                let anisongs = app_state
                    .database
                    .get_anisongs_by_artist_ids(t.artists.iter().map(|a| a.id.clone()).collect())
                    .await;

                if !anisongs.is_empty() {
                    let mut song = select_best_by_song_title(anisongs, &t.name);
                    if song.certainty >= AUTO_BIND_LIMIT as i32 {
                        song.certainty = 100;
                        let artist_binds =
                            pair_artists(t.artists.clone(), song.hits[0].song.artists.clone())
                                .into_iter()
                                .filter_map(|a| {
                                    if a.2 > AUTO_BIND_LIMIT {
                                        Some((a.1.id, a.0.id))
                                    } else {
                                        None
                                    }
                                })
                                .collect();
                        app_state.database.bind_artists(artist_binds).await;
                        let best_id = song.hits[0].song.id.expect("From database must be Some");
                        app_state
                            .database
                            .bind_songs(vec![(best_id, t.id.clone())])
                            .await;
                    }
                    return axum::Json(models::Update::NewSong(SongUpdate {
                        song_info: SongInfo::from_track(&t),
                        anisongs: models::Anisongs::Hit(song),
                    }));
                }
                let anisongs = app_state
                    .database
                    .full_search(
                        t.name.clone(),
                        t.artists.iter().map(|a| a.name.clone()).collect(),
                        true,
                        true,
                    )
                    .await;
                if !anisongs.is_empty() {
                    let (mut song, artist_pairs) =
                        select_best(anisongs, t.name.clone(), t.artists.clone());

                    let final_search_ids = song.hits[0].song.artists.iter().map(|a| a.id).collect();
                    let hit_song_id = song.hits[0].song.id.expect("must be some");
                    if song.certainty >= AUTO_BIND_LIMIT as i32 {
                        song.certainty = 100;
                        let artist_binds = artist_pairs
                            .into_iter()
                            .filter_map(|a| {
                                if a.2 > AUTO_BIND_LIMIT {
                                    Some((a.1.id, a.0.id))
                                } else {
                                    None
                                }
                            })
                            .collect();
                        app_state.database.bind_artists(artist_binds).await;
                        let best_id = song.hits[0].song.id.expect("From database must be Some");
                        app_state
                            .database
                            .bind_songs(vec![(best_id, t.id.clone())])
                            .await;
                    }
                    let all_songs = app_state
                        .database
                        .get_anisongs_by_ani_artist_ids(final_search_ids)
                        .await;

                    let (hits, more) = all_songs
                        .into_iter()
                        .partition(|a| a.song.id == Some(hit_song_id));

                    song.hits = hits;
                    song.more_by_artists = more;
                    return axum::Json(models::Update::NewSong(SongUpdate {
                        song_info: SongInfo::from_track(&t),
                        anisongs: models::Anisongs::Hit(song),
                    }));
                }
                let possible = app_state
                    .database
                    .full_search(
                        t.name.clone(),
                        t.artists.iter().map(|a| a.name.clone()).collect(),
                        false,
                        false,
                    )
                    .await;

                return axum::Json(models::Update::NewSong(SongUpdate {
                    song_info: SongInfo::from_track(&t),
                    anisongs: models::Anisongs::Miss(NewSongMiss { possible }),
                }));
            }
            _ => {
                insert_prev_played(session.clone(), SpotifyTrackID("".to_string()))
                    .await
                    .unwrap();
                axum::Json(models::Update::NotPlaying)
            }
        },
        Err(_) => axum::Json(models::Update::UnAuthorized),
    }
}

#[derive(Deserialize)]
pub struct CallbackParams {
    code: String,
    state: spotify_api::models::State,
}

pub async fn callback<D, S, A>(
    Query(params): Query<CallbackParams>,
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
) -> impl IntoResponse
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    session.load().await.unwrap();

    let session_state = match remove_state(session.clone()).await {
        Ok(v) => v,
        Err(e) => {
            error!("Couldn't fetch State, error: {}", e);
            return Err(axum::http::StatusCode::BAD_REQUEST);
        }
    };
    if session_state.as_ref() != Some(&params.state) {
        error!(
            "Sate missmatch occured, probably\n{:?}, {:?}",
            params.state, session_state
        );
        return Err(axum::http::StatusCode::BAD_REQUEST);
    }

    let res = app_state
        .spotify_api
        .handle_callback(
            app_state.client_id.clone(),
            app_state.client_secret.clone(),
            params.code,
            app_state.redirect_uri.clone(),
        )
        .await;

    let token = match res {
        Err(e) => match e {
            _ => return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
        },
        Ok(mut v) => {
            v.expires_in = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs()
                + v.expires_in;
            let res = insert_token_data(session.clone(), v.clone()).await;
            match res {
                Ok(()) => v,
                Err(e) => {
                    error!("Token insertion failed: {}", e);
                    return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
                }
            }
        }
    };

    session.save().await.unwrap();

    let user = app_state.spotify_api.get_user(token.access_token).await;
    if let Ok(user) = user {
        let mut db_user = app_state.database.get_user(user.id.clone()).await;
        if db_user.is_none() {
            db_user = Some(database_api::models::DBUser {
                name: user.display_name,
                mail: user.email,
                id: user.id,
                binds: 0,
                flags: 0,
            });
            let _ = app_state
                .database
                .add_user(db_user.as_ref().unwrap().clone())
                .await;
            // Errors? hopefully not
        }
        let db_user = db_user.unwrap();
        let _ = session.insert("user_id", db_user.id.clone()).await;
        let _ = session.insert("user", db_user).await;
    }

    return Ok(Redirect::to("/"));
}

#[derive(Deserialize)]
pub struct ConfirmationParams {
    pub song_id: what_anime_shared::SongID,
    pub spotify_song_id: what_anime_shared::SpotifyTrackID,
}

pub async fn confirm_anime<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
    axum::Json(params): axum::Json<ConfirmationParams>,
) -> impl IntoResponse
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    let token = get_token_data(
        &session,
        &app_state.spotify_api,
        app_state.client_id.clone(),
        app_state.client_secret.clone(),
    )
    .await;
    if let Ok(Some(token)) = token {
        let user = app_state.spotify_api.get_user(token.access_token).await;
        if let Ok(user) = user {
            info!(
                "{:?} added bind for {:?}\nhttps://open.spotify.com/track/{}",
                user.display_name, params.song_id, params.spotify_song_id
            );
            app_state
                .database
                .bind_songs(vec![(params.song_id, params.spotify_song_id)])
                .await;
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct ReportParams {
    pub track_id: Option<SpotifyTrackID>,
    pub ann_song_id: Option<SongAnnId>,
    pub message: String,
}

pub async fn report<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
    axum::Json(params): axum::Json<ReportParams>,
) -> Result<impl IntoResponse, axum::http::StatusCode>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    let token_data = match get_token_data(
        &session.clone(),
        &app_state.spotify_api,
        app_state.client_id.clone(),
        app_state.client_secret.clone(),
    )
    .await
    {
        Ok(Some(v)) => v,
        _ => return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
    };
    let user = match app_state
        .spotify_api
        .get_user(token_data.access_token)
        .await
    {
        Ok(u) => u,
        Err(_) => return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
    };

    let report = Report {
        report_id: 0,
        track_id: params.track_id,
        song_ann_id: params.ann_song_id,
        message: params.message,
        user,
        status: database_api::models::ReportStatus::Pending,
    };

    info!("A report was made!\n{:#?}", &report);
    app_state.database.add_report(report).await;
    Ok(())
}

pub async fn get_moderator<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
) -> Result<impl IntoResponse, axum::http::StatusCode>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    // Check for moderator perms
    let user = get_db_user(&session, &app_state.database).await;
    if let Some(user) = user {
        if user.is_admin() {
            let bind_requests = app_state.database.get_bind_requests().await;
            let reports = app_state.database.get_reports().await;
            let returns = ModeratorData {
                bind_requests,
                reports,
            };

            // Add ping system

            return Ok(axum::Json(returns));
        }
        return Err(axum::http::StatusCode::FORBIDDEN);
    } else {
        return Err(axum::http::StatusCode::NETWORK_AUTHENTICATION_REQUIRED);
    }
}

#[derive(Serialize)]
#[serde(tag = "type", content = "data")]
enum GetUserResponse {
    User(DBUser),
    LoginRequired,
}

pub async fn get_user<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
) -> Result<impl IntoResponse, axum::http::StatusCode>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    if let Some(user) = get_db_user(&session, &app_state.database).await {
        Ok(axum::Json(GetUserResponse::User(user)))
    } else {
        Ok(axum::Json(GetUserResponse::LoginRequired))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BindParams {
    pub bind_id: i32,
    pub new_status: database_api::models::BindStatus,
}
pub async fn update_bind_request<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    Query(params): Query<BindParams>,
    session: Session,
) -> Result<impl IntoResponse, axum::http::StatusCode>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    // Check for moderator perms
    let user = get_db_user(&session, &app_state.database).await;
    if let Some(user) = user {
        if user.is_admin() {
            let status = app_state
                .database
                .finish_bind_request(params.bind_id, params.new_status.clone())
                .await;
            match status {
                Ok(v) => {
                    if params.new_status == database_api::models::BindStatus::Accepted {
                        info!(
                            "{:?} added bind for {:?}\nhttps://open.spotify.com/track/{}",
                            user.name, v.song_id, v.spotify_song_id
                        );

                        app_state
                            .database
                            .bind_songs(vec![(v.song_id, v.spotify_song_id)])
                            .await;

                        Ok("success")
                    } else {
                        Ok("success")
                    }
                }
                Err(()) => return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
            }
        } else {
            return Err(axum::http::StatusCode::FORBIDDEN);
        }
    } else {
        return Err(axum::http::StatusCode::NETWORK_AUTHENTICATION_REQUIRED);
    }
}

#[derive(Serialize, Deserialize)]
pub struct BindRequestArgs {
    pub song_id: SongID,
    pub spotify_song_id: SpotifyTrackID,
}

pub async fn make_bindrequest<D, S, A>(
    State(app_state): State<Arc<AppState<D, S, A>>>,
    session: Session,
    axum::Json(params): axum::Json<BindRequestArgs>,
) -> Result<impl IntoResponse, axum::http::StatusCode>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    if let Ok(Some(token)) = get_token_data(
        &session,
        &app_state.spotify_api,
        app_state.client_id.clone(),
        app_state.client_secret.clone(),
    )
    .await
    {
        if let Ok(song) = app_state
            .spotify_api
            .get_song(token.access_token, params.spotify_song_id)
            .await
        {
            if let Some(user) = get_db_user(&session, &app_state.database).await {
                let bind_request = DBBindRequest {
                    bind_id: 0, // Unused for making a bind
                    song_id: params.song_id,
                    spotify_song_id: song.id,
                    spotify_song_name_romanized: database_api::regex::process_possible_japanese(
                        &song.name,
                    ),
                    spotify_song_name: song.name,
                    spotify_artists_romanized: song
                        .artists
                        .iter()
                        .map(|a| database_api::regex::process_possible_japanese(&a.name))
                        .collect::<Vec<String>>(),
                    spotify_artists: song
                        .artists
                        .into_iter()
                        .map(|a| a.name)
                        .collect::<Vec<String>>(),
                    spotify_album_cover: song.album.images.first().cloned(),
                    user_id: user.id,
                    status: database_api::models::BindStatus::Pending,
                };
                let result = app_state.database.add_bind_request(bind_request).await;

                match result {
                    Ok(()) => return Ok("Success"),
                    Err(()) => return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR),
                }
            }
        }
    }
    return Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR);
}

async fn get_db_user<T: Database>(session: &Session, database: &T) -> Option<DBUser> {
    let user_id = session.get::<SpotifyUserID>("user_id").await;
    if let Ok(Some(user_id)) = user_id {
        let user = database.get_user(user_id).await;
        user
    } else {
        None
    }
}

async fn insert_state(
    session: Session,
    state: spotify_api::models::State,
) -> Result<(), tower_sessions::session::Error> {
    session.insert("state", state).await
}
async fn remove_state(
    session: Session,
) -> Result<Option<spotify_api::models::State>, tower_sessions::session::Error> {
    session.remove("state").await
}
async fn insert_token_data(
    session: Session,
    token_data: TokenResponse,
) -> Result<(), tower_sessions::session::Error> {
    session.insert("token", token_data).await
}
async fn get_token_data<T: SpotifyAPI>(
    session: &Session,
    spotify_api: &T,
    client_id: ClientID,
    client_secret: ClientSecret,
) -> Result<Option<TokenResponse>, tower_sessions::session::Error> {
    let token = session.get::<TokenResponse>("token").await?;
    if let Some(t) = token.as_ref() {
        if t.expires_in
            < SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("Time went backwards")
                .as_secs()
        {
            if let Some(refresh) = t.refresh_token.clone() {
                match spotify_api
                    .refresh_token(refresh, client_id, client_secret)
                    .await
                {
                    Ok(t) => return Ok(Some(t)),
                    Err(e) => {
                        error!("Failed to refresh token! Error: {:?}", e);
                        return Ok(None);
                    }
                }
            }
        }
    }
    Ok(token)
}
async fn insert_prev_played(
    session: Session,
    id: SpotifyTrackID,
) -> Result<(), tower_sessions::session::Error> {
    session.insert("prev_played", id).await
}
async fn get_prev_played(
    session: Session,
) -> Result<Option<SpotifyTrackID>, tower_sessions::session::Error> {
    session.get("prev_played").await
}
