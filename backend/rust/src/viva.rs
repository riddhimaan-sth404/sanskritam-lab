use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct VivaSessionResponse {
    pub session_id: String,
    pub status: String,
    pub questions: Vec<VivaQuestion>,
}

#[derive(Serialize, Clone)]
pub struct VivaQuestion {
    pub id: String,
    pub topic: String,
    pub question_sa: String,
    pub question_en: String,
    pub question_hi: String,
    pub expected_points: Vec<String>,
}

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct EvaluateVivaRequest {
    pub question_id: String,
    pub response_text: String,
}

#[derive(Serialize)]
pub struct EvaluateVivaResponse {
    pub score: u32,
    pub max_score: u32,
    pub feedback: String,
    pub feedback_hi: String,
    pub matched_points: Vec<String>,
    pub pronunciation_tips: Vec<String>,
}

#[derive(Deserialize)]
#[allow(dead_code)]
pub struct AnalyticsRequest {
    pub user_id: String,
    pub module: String,
    pub score: f64,
    pub weak_areas: Vec<String>,
}

#[derive(Serialize)]
pub struct AnalyticsResponse {
    pub recommendations: Vec<String>,
    pub next_module: String,
    pub mastery_level: String,
}

pub async fn start_session() -> HttpResponse {
    let questions = vec![
        VivaQuestion {
            id: "viva-1".into(),
            topic: "Sandhi".into(),
            question_sa: "सवर्णदीर्घसन्धौ गुणसन्धौ च कः भेदः? सोदाहरणं स्पष्टीकुरुत।".into(),
            question_en: "Explain the difference between Savarna Dīrgha and Guṇa Sandhi with examples.".into(),
            question_hi: "सवर्णदीर्घ और गुण संधि में क्या अंतर है? उदाहरण सहित स्पष्ट करें।".into(),
            expected_points: vec![
                "Savarna Dirgha joins identical vowels (akaḥ savarṇe dīrghaḥ)".into(),
                "Guṇa joins a/ā with i, u, ṛ to form e, o, ar (ādguṇaḥ)".into(),
                "Examples: agni + iva = agnīva; deva + indra = devendra".into(),
            ],
        },
        VivaQuestion {
            id: "viva-2".into(),
            topic: "Philosophy".into(),
            question_sa: "न्यायदर्शने कति प्रमाणानि सन्ति? तेषां नामानि वदन्तु।".into(),
            question_en: "What are the four pramāṇas (sources of valid knowledge) in Nyāya philosophy?".into(),
            question_hi: "न्याय दर्शन में कितने प्रमाण माने गए हैं? उनके नाम बताएं।".into(),
            expected_points: vec![
                "Pratyakṣa (Perception)".into(),
                "Anumāna (Inference)".into(),
                "Upamāna (Comparison)".into(),
                "Śabda (Testimony / Scripture)".into(),
            ],
        },
    ];

    HttpResponse::Ok().json(VivaSessionResponse {
        session_id: format!(
            "viva_{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()
        ),
        status: "ready".into(),
        questions,
    })
}

pub async fn evaluate_response(body: web::Json<EvaluateVivaRequest>) -> HttpResponse {
    let text = body.response_text.trim();
    if text.is_empty() {
        return HttpResponse::Ok().json(EvaluateVivaResponse {
            score: 0,
            max_score: 100,
            feedback: "No response provided. Please speak or type your explanation with Sanskrit examples.".into(),
            feedback_hi: "कोई उत्तर प्राप्त नहीं हुआ। कृपया संस्कृत उदाहरणों सहित अपना उत्तर दें।".into(),
            matched_points: vec![],
            pronunciation_tips: vec!["Begin with the relevant Pāṇinian rule or definition and give one clear example.".into()],
        });
    }

    let lower = text.to_lowercase();
    let keywords: &[(&str, &str)] = match body.question_id.as_str() {
        "viva-2" => &[
            ("pratyak", "Mentioned Pratyakṣa (Perception)"),
            ("प्रत्यक्ष", "Mentioned Pratyakṣa (प्रत्यक्ष)"),
            ("anuman", "Mentioned Anumāna (Inference)"),
            ("अनुमान", "Mentioned Anumāna (अनुमान)"),
            ("upaman", "Mentioned Upamāna (Comparison)"),
            ("उपमान", "Mentioned Upamāna (उपमान)"),
            ("sabd", "Mentioned Śabda (Testimony)"),
            ("śabd", "Mentioned Śabda (Testimony)"),
            ("शब्द", "Mentioned Śabda (शब्द)"),
        ],
        _ => &[
            ("savar", "Identified Savarṇa Dīrgha"),
            ("सवर्ण", "Identified सवर्णदीर्घ"),
            ("guna", "Identified Guṇa Sandhi"),
            ("guṇa", "Identified Guṇa Sandhi"),
            ("गुण", "Identified गुण सन्धि"),
            ("agni", "Cited example (agni + iva / similar)"),
            ("अग्नि", "Cited उदाहरण (अग्नि / देव)"),
            ("deva", "Cited Guṇa example (deva + indra)"),
            ("देव", "Cited उदाहरण (देव + इन्द्र)"),
            ("आद्गुण", "Referenced Pāṇini 6.1.87 (आद्गुणः)"),
        ],
    };

    let matched_points: Vec<String> = keywords
        .iter()
        .filter(|(pat, _)| lower.contains(pat) || text.contains(pat))
        .map(|(_, label)| (*label).to_string())
        .collect();

    let word_count = text.split_whitespace().count();
    let base_score: u32 = if !matched_points.is_empty() {
        (55 + (matched_points.len() as u32 * 15)).min(95)
    } else if word_count >= 5 {
        50
    } else {
        30
    };

    let (feedback, feedback_hi) = if base_score >= 80 {
        (
            "Strong conceptual clarity and accurate grammatical terminology. Keep refining compound analysis.".into(),
            "सटीक व्याकरणिक शब्दावली और स्पष्ट अवधारणा। समास और सूत्र-उदाहरण का अभ्यास जारी रखें।".into(),
        )
    } else if base_score >= 55 {
        (
            "Good start. Try to explicitly state the Pāṇinian sūtra and give at least two contrasting examples.".into(),
            "अच्छा प्रयास। कृपया संबंधित पाणिनि सूत्र और दो स्पष्ट उदाहरण अवश्य जोड़ें।".into(),
        )
    } else {
        (
            "Response needs key Sanskrit terms and grammatical rules for this topic.".into(),
            "उत्तर में इस विषय के मुख्य संस्कृत शब्द और व्याकरण नियम शामिल करें।".into(),
        )
    };

    HttpResponse::Ok().json(EvaluateVivaResponse {
        score: base_score,
        max_score: 100,
        feedback,
        feedback_hi,
        matched_points,
        pronunciation_tips: vec!["Ensure distinct aspiration on mahāprāṇa consonants (ख, घ, छ, झ, थ, ध, फ, भ)".into()],
    })
}

pub async fn evaluate_analytics(body: web::Json<AnalyticsRequest>) -> HttpResponse {
    let mut recommendations = Vec::new();
    let norm_score = if body.score > 1.0 { body.score / 100.0 } else { body.score }.clamp(0.0, 1.0);

    if norm_score < 0.7 {
        recommendations.push("Review basic Sandhi rules and practice 10 drill exercises.".into());
        recommendations.push("Revise the Subanta declension paradigms for 'राम' and 'फल'.".into());
    } else {
        recommendations.push("Excellent comprehension! Advance to Classical Sanskrit text analysis.".into());
        recommendations.push("Practice compounding rules (Samāsa) and Ashtadhyayi derivations.".into());
    }

    HttpResponse::Ok().json(AnalyticsResponse {
        recommendations,
        next_module: if norm_score < 0.7 { "sandhi-practice".into() } else { "classical-reading".into() },
        mastery_level: if norm_score >= 0.85 { "Advanced" } else if norm_score >= 0.6 { "Intermediate" } else { "Beginner" }.into(),
    })
}
