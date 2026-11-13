use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct TtsRequest {
    pub text: String,
    pub accent: Option<String>,
    pub speed: Option<f64>,
}

#[derive(Serialize)]
pub struct TtsResponse {
    pub audio_url: String,
    pub duration_ms: usize,
    pub text: String,
}

pub async fn synthesize(body: web::Json<TtsRequest>) -> HttpResponse {
    let clean = body.text.trim();
    let speed = body.speed.unwrap_or(1.0).clamp(0.5, 2.0);
    let duration = ((clean.chars().count() as f64 * 140.0) / speed).round() as usize;

    HttpResponse::Ok().json(TtsResponse {
        audio_url: format!("/api/tts/stream?q={}", urlencoding(clean)),
        duration_ms: duration,
        text: clean.to_string(),
    })
}

#[derive(Deserialize)]
pub struct StreamQuery {
    pub q: Option<String>,
}

pub async fn stream(query: web::Query<StreamQuery>) -> HttpResponse {
    let text = query.q.as_deref().unwrap_or("").trim();
    // Return empty audio buffer / stream header for audio synthesis stream compatibility
    HttpResponse::Ok()
        .content_type("audio/mpeg")
        .insert_header(("X-Sanskrit-Text", text))
        .body(vec![])
}

#[allow(dead_code)]
fn urlencoding(input: &str) -> String {
    let mut out = String::new();
    for byte in input.bytes() {
        if (byte >= b'a' && byte <= b'z') || (byte >= b'A' && byte <= b'Z') || (byte >= b'0' && byte <= b'9') || byte == b'-' || byte == b'_' || byte == b'.' || byte == b'~' {
            out.push(byte as char);
        } else {
            out.push_str(&format!("%{:02X}", byte));
        }
    }
    out
}
