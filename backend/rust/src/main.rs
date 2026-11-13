use actix_cors::Cors;
use actix_web::{web, App, HttpServer, HttpResponse};
use serde::Serialize;

use sanskrit_lab_backend::{
    assessment, corpus, dictionary, grammar, ocr, tts, viva,
};

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
    pub modules: Vec<String>,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "ok".into(),
        service: "SanskritLab Unified High-Performance Rust Engine".into(),
        version: sanskrit_lab_backend::engine_version().into(),
        modules: vec![
            "ocr".into(),
            "grammar (sandhi / morphology / vibhakti)".into(),
            "corpus (full-text search)".into(),
            "dictionary (etymology / compounds)".into(),
            "assessment (quiz generator)".into(),
            "viva (oral examiner & analytics)".into(),
            "tts (audio synthesis)".into(),
        ],
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);
    let bind_addr = format!("127.0.0.1:{}", port);
    let allowed_origin = std::env::var("ALLOWED_ORIGIN").ok();

    println!("============================================================");
    println!(" SanskritLab Unified Rust Backend running on http://{}", bind_addr);
    println!("============================================================");

    let corpus_data = web::Data::new(corpus::CorpusStore::new());
    let dict_data = web::Data::new(dictionary::DictionaryStore::new());

    HttpServer::new(move || {
        let mut cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_origin("http://localhost:4173")
            .allowed_origin("http://127.0.0.1:4173")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::CONTENT_TYPE,
                actix_web::http::header::AUTHORIZATION,
            ])
            .max_age(3600);

        if let Some(ref origin) = allowed_origin {
            cors = cors.allowed_origin(origin);
        }

        App::new()
            .wrap(cors)
            .app_data(corpus_data.clone())
            .app_data(dict_data.clone())
            .route("/api/health", web::get().to(health))
            .service(
                web::scope("/api/ocr")
                    .route("/recognize", web::post().to(ocr::recognize))
            )
            .service(
                web::scope("/api/grammar")
                    .route("/parse", web::post().to(grammar::parse))
                    .route("/sandhi", web::post().to(grammar::sandhi_split))
                    .route("/sandhi-join", web::post().to(grammar::sandhi_join))
                    .route("/declensions", web::get().to(grammar::declensions))
            )
            .service(
                web::scope("/api/corpus")
                    .route("/search", web::get().to(corpus::search))
                    .route("/texts", web::get().to(corpus::list_texts))
                    .route("/texts/{id}", web::get().to(corpus::get_text))
            )
            .service(
                web::scope("/api/dictionary")
                    .route("/lookup", web::get().to(dictionary::lookup))
                    .route("/search", web::get().to(dictionary::search_dictionary))
                    .route("/compound-split", web::post().to(dictionary::compound_split))
            )
            .service(
                web::scope("/api/assessment")
                    .route("/generate", web::post().to(assessment::generate))
            )
            .service(
                web::scope("/api/viva")
                    .route("/session", web::post().to(viva::start_session))
                    .route("/evaluate", web::post().to(viva::evaluate_response))
            )
            .service(
                web::scope("/api/analytics")
                    .route("/evaluate", web::post().to(viva::evaluate_analytics))
            )
            .service(
                web::scope("/api/tts")
                    .route("/synthesize", web::post().to(tts::synthesize))
                    .route("/stream", web::get().to(tts::stream))
            )
    })
    .bind(&bind_addr)?
    .run()
    .await
}