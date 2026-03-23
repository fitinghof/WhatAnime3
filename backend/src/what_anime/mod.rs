mod models;
mod routes;
mod utility;

use anilist_api::AnilistAPI;
use anisong_api::AnisongAPI;
use anisong_api::models::AnisongArtistID;
use axum::Router;
use axum::routing::get;
use axum::routing::post;
use database_api::Database;
use log::info;
use reqwest::Url;
use routes::AppState;
use routes::confirm_anime;
use routes::report;
use routes::{callback, login, update};
use spotify_api::SpotifyAPI;
use spotify_api::models::ClientID;
use spotify_api::models::ClientSecret;
use std::str::FromStr;
use std::sync::Arc;
use tokio::time::interval;
use tower_sessions::MemoryStore;
use tower_sessions::SessionManagerLayer;
use tower_sessions::cookie;

use crate::what_anime::routes::get_moderator;
use crate::what_anime::routes::get_user;
use crate::what_anime::routes::make_bindrequest;
use crate::what_anime::routes::update_bind_request;

pub struct WhatAnime<D, S, A>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    app_state: Arc<AppState<D, S, A>>,
}

impl<D, S, A> WhatAnime<D, S, A>
where
    D: Database + Send + Sync + 'static,
    S: SpotifyAPI + Send + Sync + 'static,
    A: AnisongAPI + Send + Sync + 'static,
{
    pub fn new(database: D, spotify_api: S, anisong_api: A) -> Self {
        let client_id = ClientID(
            std::env::var("SPOTIFY_CLIENT_ID").expect("Environment variable client_id not set"),
        );
        let client_secret = ClientSecret(
            std::env::var("SPOTIFY_CLIENT_SECRET")
                .expect("Environment variable client_secret not set"),
        );

        let redirect_uri = Url::from_str(
            &std::env::var("SPOTIFY_REDIRECT_URI")
                .expect("SPOTIFY_REDIRECT_URI environment variable must be set"),
        )
        .expect("SPOTIFY_REDIRECT_URI must be valid uri");

        Self {
            app_state: Arc::new(AppState {
                database,
                spotify_api,
                _anisong_api: anisong_api,
                client_id,
                client_secret,
                redirect_uri,
            }),
        }
    }

    pub async fn run(&self) {
        let session_store = MemoryStore::default();
        let session_layer = SessionManagerLayer::new(session_store)
            .with_secure(true)
            .with_same_site(cookie::SameSite::None)
            .with_always_save(true)
            .with_http_only(true);

        if self
            .app_state
            .database
            .get_artists(vec![AnisongArtistID(13736)])
            .await
            .len()
            == 0
        {
            info!(
                "Detected uninitilized database, running initilization script. This will take a few minutes, please note that binds will be missing until it is complete."
            );
            let app_state_new = self.app_state.clone();
            tokio::task::spawn(async move {
                let anilist_api = AnilistAPI::new();
                utility::initialize_database(
                    &app_state_new.database,
                    &app_state_new._anisong_api,
                    &anilist_api,
                )
                .await;
            });
        }

        let anilist_api = AnilistAPI::new();
        let app_state_new = self.app_state.clone();
        tokio::task::spawn(async move {
            let interval_duration = tokio::time::Duration::from_secs(60 * 60); // 1 hour
            let mut interval = interval(interval_duration);
            let mut counter = 0;
            loop {
                counter += 1;
                if counter == 12 {
                    counter = 0;
                    let fetches = utility::update_current_season(
                        &app_state_new.database,
                        &app_state_new._anisong_api,
                        &anilist_api,
                    )
                    .await;
                    info!("Fetched {} from anisong and updated data", fetches);
                }
                interval.tick().await;
                info!("Sent Heartbeat");
            }
        });

        let app = Router::new()
            .route("/api/update", get(update))
            .route("/api/login", get(login))
            .route("/api/callback", get(callback))
            .route("/api/confirm_anime", post(confirm_anime))
            .route("/api/report", post(report))
            .route("/api/get_moderator", get(get_moderator))
            .route("/api/make_bind_request", post(make_bindrequest))
            .route("/api/update_bind_request", get(update_bind_request))
            .route("/api/get_user", get(get_user))
            .layer(session_layer)
            .with_state(self.app_state.clone());

        // let backend_port = std::env::var("WHATANIME_BACKEND_PORT").unwrap_or("8005".to_string());
        let backend_port = "8005";
        let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", backend_port))
            .await
            .unwrap();
        axum::serve(listener, app).await.unwrap()
    }
}
