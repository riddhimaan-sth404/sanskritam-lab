use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct ParseRequest {
    pub text: String,
}

#[derive(Serialize)]
pub struct ParseResponse {
    pub tokens: Vec<Token>,
    pub syntax_tree: String,
}

#[derive(Serialize, Clone)]
pub struct Token {
    pub word: String,
    pub root: String,
    pub pos: String,
    pub case_info: Option<String>,
    pub meaning: Option<String>,
}

#[derive(Deserialize)]
pub struct SandhiSplitRequest {
    pub text: String,
}

#[derive(Serialize)]
pub struct SandhiSplitResponse {
    pub original: String,
    pub splits: Vec<String>,
    pub rule_applied: Option<String>,
    pub explanation: Option<String>,
}

#[derive(Deserialize)]
pub struct SandhiJoinRequest {
    pub word1: String,
    pub word2: String,
}

#[derive(Serialize)]
pub struct SandhiJoinResponse {
    pub joined: String,
    pub rule: String,
    pub paninian_sutra: String,
}

#[derive(Deserialize)]
pub struct DeclensionQuery {
    pub stem: Option<String>,
    pub gender: Option<String>,
}

#[derive(Serialize)]
pub struct DeclensionTable {
    pub stem: String,
    pub gender: String,
    pub paradigm: Vec<VibhaktiRow>,
}

#[derive(Serialize)]
pub struct VibhaktiRow {
    pub case_num: u8,
    pub case_name: String,
    pub singular: String,
    pub dual: String,
    pub plural: String,
}

pub async fn parse(body: web::Json<ParseRequest>) -> HttpResponse {
    let raw = body.text.trim();
    let words: Vec<&str> = raw.split(|c: char| c.is_whitespace() || c == '।' || c == '॥' || c == ',' || c == '.').filter(|s| !s.is_empty()).collect();

    let tokens: Vec<Token> = words.into_iter().map(|w| {
        let (root, pos, case_info, meaning) = analyze_token(w);
        Token {
            word: w.to_string(),
            root,
            pos,
            case_info,
            meaning,
        }
    }).collect();

    let syntax_tree = format!("(S {})", tokens.iter().map(|t| format!("({} {})", t.pos, t.word)).collect::<Vec<_>>().join(" "));

    HttpResponse::Ok().json(ParseResponse {
        tokens,
        syntax_tree,
    })
}

pub fn analyze_token(w: &str) -> (String, String, Option<String>, Option<String>) {
    match w {
        "रामः" => ("राम".into(), "noun".into(), Some("प्रथमा एकवचन (Nominative Sg)".into()), Some("Rama".into())),
        "रामम्" => ("राम".into(), "noun".into(), Some("द्वितीया एकवचन (Accusative Sg)".into()), Some("Rama (object)".into())),
        "रामेण" => ("राम".into(), "noun".into(), Some("तृतीया एकवचन (Instrumental Sg)".into()), Some("by Rama".into())),
        "रामाय" => ("राम".into(), "noun".into(), Some("चतुर्थी एकवचन (Dative Sg)".into()), Some("for Rama".into())),
        "रामात्" => ("राम".into(), "noun".into(), Some("पञ्चमी एकवचन (Ablative Sg)".into()), Some("from Rama".into())),
        "रामस्य" => ("राम".into(), "noun".into(), Some("षष्ठी एकवचन (Genitive Sg)".into()), Some("of Rama".into())),
        "रामे" => ("राम".into(), "noun".into(), Some("सप्तमी एकवचन (Locative Sg)".into()), Some("in Rama".into())),
        "गच्छति" => ("गम्".into(), "verb".into(), Some("लट् प्रथमपुरुष एकवचन (Present 3rd Sg)".into()), Some("goes".into())),
        "गच्छसि" => ("गम्".into(), "verb".into(), Some("लट् मध्यमपुरुष एकवचन (Present 2nd Sg)".into()), Some("you go".into())),
        "गच्छामि" => ("गम्".into(), "verb".into(), Some("लट् उत्तमपुरुष एकवचन (Present 1st Sg)".into()), Some("I go".into())),
        "पठति" => ("पठ्".into(), "verb".into(), Some("लट् प्रथमपुरुष एकवचन (Present 3rd Sg)".into()), Some("reads".into())),
        "पठामि" => ("पठ्".into(), "verb".into(), Some("लट् उत्तमपुरुष एकवचन (Present 1st Sg)".into()), Some("I read".into())),
        "अस्ति" => ("अस्".into(), "verb".into(), Some("लट् प्रथमपुरुष एकवचन (Present 3rd Sg)".into()), Some("is / exists".into())),
        "भवति" => ("भू".into(), "verb".into(), Some("लट् प्रथमपुरुष एकवचन (Present 3rd Sg)".into()), Some("becomes / is".into())),
        "अहम्" => ("अस्मद्".into(), "pronoun".into(), Some("प्रथमा एकवचन (1st Person Pronoun)".into()), Some("I".into())),
        "त्वम्" => ("युष्मद्".into(), "pronoun".into(), Some("प्रथमा एकवचन (2nd Person Pronoun)".into()), Some("you".into())),
        "सः" => ("तद्".into(), "pronoun".into(), Some("प्रथमा एकवचन (3rd Person Masc Pronoun)".into()), Some("he".into())),
        "सा" => ("तद्".into(), "pronoun".into(), Some("प्रथमा एकवचन (3rd Person Fem Pronoun)".into()), Some("she".into())),
        "तत्" => ("तद्".into(), "pronoun".into(), Some("प्रथमा एकवचन (3rd Person Neuter Pronoun)".into()), Some("that".into())),
        "वनम्" => ("वन".into(), "noun".into(), Some("प्रथमा/द्वितीया एकवचन (Neuter Sg)".into()), Some("forest".into())),
        "फलम्" => ("फल".into(), "noun".into(), Some("प्रथमा/द्वितीया एकवचन (Neuter Sg)".into()), Some("fruit".into())),
        "पुस्तकम्" => ("पुस्तक".into(), "noun".into(), Some("प्रथमा/द्वितीया एकवचन (Neuter Sg)".into()), Some("book".into())),
        "च" => ("च".into(), "indeclinable".into(), None, Some("and".into())),
        "न" => ("न".into(), "indeclinable".into(), None, Some("not".into())),
        "अत्र" => ("अत्र".into(), "indeclinable".into(), None, Some("here".into())),
        "तत्र" => ("तत्र".into(), "indeclinable".into(), None, Some("there".into())),
        _ => (w.to_string(), "noun".into(), None, None),
    }
}

pub fn sandhi_split_known(input: &str) -> (Vec<String>, Option<String>, Option<String>) {
    match input {
        "रामाग्र" => (vec!["राम".into(), "अग्र".into()], Some("सवर्णदीर्घ (Savarna Dīrgha)".into()), Some("अ + अ → आ".into())),
        "अग्नीव" => (vec!["अग्नि".into(), "इव".into()], Some("सवर्णदीर्घ (Savarna Dīrgha)".into()), Some("इ + इ → ई (Pāṇini 6.1.101 akaḥ savarṇe dīrghaḥ)".into())),
        "देवेन्द्र" => (vec!["देव".into(), "इन्द्र".into()], Some("गुण (Guṇa)".into()), Some("अ + इ → ए (Pāṇini 6.1.87 ādguṇaḥ)".into())),
        "सूर्योदय" => (vec!["सूर्य".into(), "उदय".into()], Some("गुण (Guṇa)".into()), Some("अ + उ → ओ (Pāṇini 6.1.87 ādguṇaḥ)".into())),
        "सदैव" => (vec!["सदा".into(), "एव".into()], Some("वृद्धि (Vṛddhi)".into()), Some("आ + ए → ऐ (Pāṇini 6.1.88 vṛddhireci)".into())),
        "महौषधम्" => (vec!["महा".into(), "औषधम्".into()], Some("वृद्धि (Vṛddhi)".into()), Some("आ + ओ → औ (Pāṇini 6.1.88 vṛddhireci)".into())),
        "इत्यादि" => (vec!["इति".into(), "आदि".into()], Some("यण् (Yaṇ)".into()), Some("इ + आ → या (Pāṇini 6.1.77 iko yaṇaci)".into())),
        "स्वागतम्" => (vec!["सु".into(), "आगतम्".into()], Some("यण् (Yaṇ)".into()), Some("उ + आ → वा (Pāṇini 6.1.77 iko yaṇaci)".into())),
        "नयनम्" => (vec!["ने".into(), "अनम्".into()], Some("अयादि (Ayādi)".into()), Some("ए + अ → अय् (Pāṇini 6.1.78 eco'yavāyāvaḥ)".into())),
        "नायकः" => (vec!["नै".into(), "अकः".into()], Some("अयादि (Ayādi)".into()), Some("ऐ + अ → आय् (Pāṇini 6.1.78 eco'yavāyāvaḥ)".into())),
        "पावकः" => (vec!["पौ".into(), "अकः".into()], Some("अयादि (Ayādi)".into()), Some("औ + अ → आव् (Pāṇini 6.1.78 eco'yavāyāvaḥ)".into())),
        "तेऽपि" => (vec!["ते".into(), "अपि".into()], Some("पूर्वरूप (Pūrvarūpa)".into()), Some("ए + अ → एऽ (Pāṇini 6.1.109 eṅaḥ padāntād ati)".into())),
        "नमस्ते" => (vec!["नमः".into(), "ते".into()], Some("विसर्ग (Visarga)".into()), Some("ः + त → स्त (Pāṇini 8.3.34 visarjanīyasya saḥ)".into())),
        "रामश्च" => (vec!["रामः".into(), "च".into()], Some("विसर्ग (Visarga)".into()), Some("ः + च → श्च (Pāṇini 8.3.34 + 8.4.40)".into())),
        "सज्जनः" => (vec!["सत्".into(), "जनः".into()], Some("श्चुत्व (Ścutva)".into()), Some("त् + ज → ज्ज (Pāṇini 8.4.40 stoḥ ścunā ścuḥ)".into())),
        "वागीशः" => (vec!["वाक्".into(), "ईशः".into()], Some("जश्त्व (Jaśtva)".into()), Some("क् + ई → गी (Pāṇini 8.2.39 jhalāṃ jaśo'nte)".into())),
        _ => {
            let parts: Vec<String> = input.split_whitespace().map(|s| s.to_string()).collect();
            (parts, None, None)
        }
    }
}

pub async fn sandhi_split(body: web::Json<SandhiSplitRequest>) -> HttpResponse {
    let input = body.text.trim();
    let (splits, rule, explanation) = sandhi_split_known(input);

    HttpResponse::Ok().json(SandhiSplitResponse {
        original: input.to_string(),
        splits,
        rule_applied: rule,
        explanation,
    })
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Vowel {
    A, Aa, I, Ii, U, Uu, R, Rr, E, Ai, O, Au,
}

fn is_dev_consonant(c: char) -> bool {
    ('\u{0915}'..='\u{0939}').contains(&c)
}

fn ends_with_vowel(w: &str) -> Option<(String, Vowel)> {
    let last = w.chars().next_back()?;
    let prefix: String = w.chars().take(w.chars().count() - 1).collect();
    match last {
        'अ' => Some((prefix, Vowel::A)),
        'आ' | 'ा' => Some((prefix, Vowel::Aa)),
        'इ' | 'ि' => Some((prefix, Vowel::I)),
        'ई' | 'ी' => Some((prefix, Vowel::Ii)),
        'उ' | 'ु' => Some((prefix, Vowel::U)),
        'ऊ' | 'ू' => Some((prefix, Vowel::Uu)),
        'ऋ' | 'ृ' => Some((prefix, Vowel::R)),
        'ॠ' | 'ॄ' => Some((prefix, Vowel::Rr)),
        'ए' | 'े' => Some((prefix, Vowel::E)),
        'ऐ' | 'ै' => Some((prefix, Vowel::Ai)),
        'ओ' | 'ो' => Some((prefix, Vowel::O)),
        'औ' | 'ौ' => Some((prefix, Vowel::Au)),
        c if is_dev_consonant(c) => Some((w.to_string(), Vowel::A)),
        _ => None,
    }
}

fn starts_with_vowel(w: &str) -> Option<(Vowel, String)> {
    let mut chars = w.chars();
    let first = chars.next()?;
    let rem: String = chars.collect();
    let v = match first {
        'अ' => Vowel::A,
        'आ' => Vowel::Aa,
        'इ' => Vowel::I,
        'ई' => Vowel::Ii,
        'उ' => Vowel::U,
        'ऊ' => Vowel::Uu,
        'ऋ' => Vowel::R,
        'ॠ' => Vowel::Rr,
        'ए' => Vowel::E,
        'ऐ' => Vowel::Ai,
        'ओ' => Vowel::O,
        'औ' => Vowel::Au,
        _ => return None,
    };
    Some((v, rem))
}

fn vowel_matra(v: Vowel) -> &'static str {
    match v {
        Vowel::A => "",
        Vowel::Aa => "ा",
        Vowel::I => "ि",
        Vowel::Ii => "ी",
        Vowel::U => "ु",
        Vowel::Uu => "ू",
        Vowel::R => "ृ",
        Vowel::Rr => "ॄ",
        Vowel::E => "े",
        Vowel::Ai => "ै",
        Vowel::O => "ो",
        Vowel::Au => "ौ",
    }
}

fn format_base_with_semivowel(base: &str, semivowel: &str, v2: Vowel, rem2: &str) -> String {
    if base.is_empty() {
        format!("{}{}{}", semivowel, vowel_matra(v2), rem2)
    } else if base.ends_with('्') {
        format!("{}{}{}{}", base, semivowel, vowel_matra(v2), rem2)
    } else {
        format!("{}्{}{}{}", base, semivowel, vowel_matra(v2), rem2)
    }
}

fn is_soft_consonant(c: char) -> bool {
    matches!(c, 'ग' | 'घ' | 'ङ' | 'ज' | 'झ' | 'ञ' | 'ड' | 'ढ' | 'ण' | 'द' | 'ध' | 'न' | 'ब' | 'भ' | 'म' | 'य' | 'र' | 'ल' | 'व' | 'ह')
}

fn jashtva_char(c: char) -> Option<char> {
    match c {
        'क' => Some('ग'),
        'च' => Some('ज'),
        'ट' => Some('ड'),
        'त' => Some('द'),
        'प' => Some('ब'),
        _ => None,
    }
}

pub fn sandhi_join_words(w1: &str, w2: &str) -> (String, String, String) {
    let w1 = w1.trim();
    let w2 = w2.trim();

    if let (Some((base1, v1)), Some((v2, rem2))) = (ends_with_vowel(w1), starts_with_vowel(w2)) {
        match (v1, v2) {
            (Vowel::A | Vowel::Aa, Vowel::A | Vowel::Aa) => {
                return (format!("{}ा{}", base1, rem2), "सवर्णदीर्घ (Savarna Dīrgha: a/ā + a/ā → ā)".into(), "अकः सवर्णे दीर्घः (६.१.१०१)".into());
            }
            (Vowel::I | Vowel::Ii, Vowel::I | Vowel::Ii) => {
                return (format!("{}ी{}", base1, rem2), "सवर्णदीर्घ (Savarna Dīrgha: i/ī + i/ī → ī)".into(), "अकः सवर्णे दीर्घः (६.१.१०१)".into());
            }
            (Vowel::U | Vowel::Uu, Vowel::U | Vowel::Uu) => {
                return (format!("{}ू{}", base1, rem2), "सवर्णदीर्घ (Savarna Dīrgha: u/ū + u/ū → ū)".into(), "अकः सवर्णे दीर्घः (६.१.१०१)".into());
            }
            (Vowel::R | Vowel::Rr, Vowel::R | Vowel::Rr) => {
                return (format!("{}ॄ{}", base1, rem2), "सवर्णदीर्घ (Savarna Dīrgha: ṛ/ṝ + ṛ/ṝ → ṝ)".into(), "अकः सवर्णे दीर्घः (६.१.१०१)".into());
            }
            (Vowel::A | Vowel::Aa, Vowel::I | Vowel::Ii) => {
                return (format!("{}े{}", base1, rem2), "गुण (Guṇa: a/ā + i/ī → e)".into(), "आद्गुणः (६.१.८७)".into());
            }
            (Vowel::A | Vowel::Aa, Vowel::U | Vowel::Uu) => {
                return (format!("{}ो{}", base1, rem2), "गुण (Guṇa: a/ā + u/ū → o)".into(), "आद्गुणः (६.१.८७)".into());
            }
            (Vowel::A | Vowel::Aa, Vowel::R | Vowel::Rr) => {
                return (format!("{}र्{}", base1, rem2), "गुण (Guṇa: a/ā + ṛ/ṝ → ar)".into(), "आद्गुणः + उरण् रपरः (६.१.८७, १.१.५१)".into());
            }
            (Vowel::A | Vowel::Aa, Vowel::E | Vowel::Ai) => {
                return (format!("{}ै{}", base1, rem2), "वृद्धि (Vṛddhi: a/ā + e/ai → ai)".into(), "वृद्धिरेचि (६.१.८८)".into());
            }
            (Vowel::A | Vowel::Aa, Vowel::O | Vowel::Au) => {
                return (format!("{}ौ{}", base1, rem2), "वृद्धि (Vṛddhi: a/ā + o/au → au)".into(), "वृद्धिरेचि (६.१.८८)".into());
            }
            (Vowel::I | Vowel::Ii, _) => {
                return (format_base_with_semivowel(&base1, "य", v2, &rem2), "यण् (Yaṇ: i/ī + dissimilar vowel → y)".into(), "इको यणचि (६.१.७७)".into());
            }
            (Vowel::U | Vowel::Uu, _) => {
                return (format_base_with_semivowel(&base1, "व", v2, &rem2), "यण् (Yaṇ: u/ū + dissimilar vowel → v)".into(), "इको यणचि (६.१.७७)".into());
            }
            (Vowel::R | Vowel::Rr, _) => {
                return (format_base_with_semivowel(&base1, "र", v2, &rem2), "यण् (Yaṇ: ṛ/ṝ + dissimilar vowel → r)".into(), "इको यणचि (६.१.७७)".into());
            }
            (Vowel::E | Vowel::O, Vowel::A) if !matches!(w2, "अनम्" | "अनः" | "अति" | "अन्" | "अनीय" | "अकः") => {
                return (format!("{}{}ऽ{}", base1, vowel_matra(v1), rem2), "पूर्वरूप (Pūrvarūpa: e/o + a → eऽ/oऽ)".into(), "एङः पदान्तादति (६.१.१०९)".into());
            }
            (Vowel::E, _) => {
                return (format!("{}य{}{}", base1, vowel_matra(v2), rem2), "अयादि (Ayādi: e + vowel → ay)".into(), "एचोऽयवायावः (६.१.७८)".into());
            }
            (Vowel::Ai, _) => {
                return (format!("{}ाय{}{}", base1, vowel_matra(v2), rem2), "अयादि (Ayādi: ai + vowel → āy)".into(), "एचोऽयवायावः (६.१.७८)".into());
            }
            (Vowel::O, _) => {
                return (format!("{}व{}{}", base1, vowel_matra(v2), rem2), "अयादि (Ayādi: o + vowel → av)".into(), "एचोऽयवायावः (६.१.७८)".into());
            }
            (Vowel::Au, _) => {
                return (format!("{}ाव{}{}", base1, vowel_matra(v2), rem2), "अयादि (Ayādi: au + vowel → āv)".into(), "एचोऽयवायावः (६.१.७८)".into());
            }
        }
    }

    if let Some(pre) = w1.strip_suffix('ः') {
        let pre_v = ends_with_vowel(pre).map(|(_, v)| v);
        if let Some(b0) = w2.chars().next() {
            if matches!(b0, 'च' | 'छ' | 'श') {
                return (format!("{}श्{}", pre, w2), "विसर्ग सन्धेः श्चुत्वम् (Visarga → ś before c/ch/ś)".into(), "विसर्जनीयस्य सः + स्तोः श्चुना श्चुः (८.३.३४, ८.४.४०)".into());
            }
            if matches!(b0, 'ट' | 'ठ' | 'ष') {
                return (format!("{}ष्{}", pre, w2), "विसर्ग सन्धेः ष्टुत्वम् (Visarga → ṣ before ṭ/ṭh/ṣ)".into(), "विसर्जनीयस्य सः + ष्टुना ष्टुः (८.३.३४, ८.४.४१)".into());
            }
            if matches!(b0, 'त' | 'थ' | 'स') {
                return (format!("{}स्{}", pre, w2), "विसर्ग सन्धेः सत्वम् (Visarga → s before t/th/s)".into(), "विसर्जनीयस्य सः (८.३.३४)".into());
            }
            if matches!(b0, 'क' | 'ख' | 'प' | 'फ') {
                if (pre == "नि" || pre == "दु" || pre == "बहि" || pre == "आवि" || pre == "धनु" || pre == "चतु") {
                    return (format!("{}ष्{}", pre, w2), "विसर्ग सन्धेः षत्वम् (i/u-upadhā + k/kh/p/ph → ṣ)".into(), "इदुदुपधस्य चाप्रत्ययस्य (८.३.४१)".into());
                }
                return (format!("{} {}", w1, w2), "विसर्गः (Visarga retained before k/kh/p/ph)".into(), "कुप्वोः ≍क≍पौ च (८.३.३७)".into());
            }
            if is_soft_consonant(b0) {
                if pre_v == Some(Vowel::A) {
                    return (format!("{}ो {}", pre, w2), "उत्व + गुण (Visarga: aḥ + soft consonant → o)".into(), "हशि च (६.१.११४)".into());
                }
                if pre_v == Some(Vowel::Aa) {
                    return (format!("{} {}", pre, w2), "विसर्गलोपः (Visarga after ā dropped before soft consonant)".into(), "भोभगोअघोअपूर्वस्य योऽशि (८.३.१७)".into());
                }
                if b0 == 'र' {
                    let lengthened = match pre {
                        "नि" => "नी",
                        "दु" => "दू",
                        _ => pre,
                    };
                    return (format!("{}{}", lengthened, w2), "रो रि + ढ्रलोपे पूर्वस्य दीर्घोऽणः (visarga/r + r → drop r & lengthen)".into(), "रो रि + ढ्रलोपे पूर्वस्य दीर्घोऽणः (८.३.१४, ६.३.१११)".into());
                }
                return (format!("{}र्{}", pre, w2), "रुत्वम् (Visarga → r before soft consonant)".into(), "ससजुषो रुः (८.२.६६)".into());
            }
        }
        if let Some((v2, rem2)) = starts_with_vowel(w2) {
            if pre_v == Some(Vowel::A) {
                if v2 == Vowel::A {
                    return (format!("{}ोऽ{}", pre, rem2), "उत्व + गुण + पूर्वरूप (aḥ + a → oऽ)".into(), "अतो रोरप्लुतादप्लुते + आद्गुणः + एङः पदान्तादति (६.१.११३)".into());
                }
                return (format!("{} {}", pre, w2), "विसर्गलोपः (aḥ + dissimilar vowel → a)".into(), "भोभगोअघोअपूर्वस्य योऽशि (८.३.१७)".into());
            }
            if pre_v == Some(Vowel::Aa) {
                return (format!("{} {}", pre, w2), "विसर्गलोपः (āḥ + vowel → ā)".into(), "भोभगोअघोअपूर्वस्य योऽशि (८.३.१७)".into());
            }
            return (format!("{}र{}{}", pre, vowel_matra(v2), rem2), "रुत्वम् (Visarga → r before vowel)".into(), "ससजुषो रुः (८.२.६६)".into());
        }
    }

    if let Some(stem_with_c) = w1.strip_suffix('्') {
        if let Some(final_c) = stem_with_c.chars().next_back() {
            let prefix_len = stem_with_c.len() - final_c.len_utf8();
            let prefix = &stem_with_c[..prefix_len];
            if let Some(b0) = w2.chars().next() {
                if final_c == 'म' && is_dev_consonant(b0) {
                    return (format!("{}ं {}", prefix, w2), "अनुस्वार (Anusvāra: m + consonant → ṃ)".into(), "मोऽनुस्वारः (८.३.२३)".into());
                }
                if final_c == 'त' && is_dev_consonant(b0) {
                    let b_rem = &w2[b0.len_utf8()..];
                    let assimilated = match b0 {
                        'च' => Some(("च्च", "स्तोः श्चुना श्चुः (८.४.४०)")),
                        'छ' => Some(("च्छ", "स्तोः श्चुना श्चुः (८.४.४०)")),
                        'ज' => Some(("ज्ज", "जश्त्व + श्चुत्वम् (८.४.४०)")),
                        'झ' => Some(("ज्झ", "जश्त्व + श्चुत्वम् (८.४.४०)")),
                        'ट' => Some(("ट्ट", "ष्टुना ष्टुः (८.४.४१)")),
                        'ड' => Some(("ड्ड", "जश्त्व + ष्टुत्वम् (८.४.४१)")),
                        'द' => Some(("द्द", "झलां जशोऽन्ते (८.२.३९)")),
                        'न' => Some(("न्न", "यरोऽनुनासिकेऽनुनासिको वा (८.४.४५)")),
                        'ल' => Some(("ल्ल", "तोर्लि (८.४.६०)")),
                        'श' => Some(("च्छ", "शश्छोऽटि (८.४.६३)")),
                        _ => None,
                    };
                    if let Some((rep, sutra)) = assimilated {
                        return (format!("{}{}{}", prefix, rep, b_rem), "व्यञ्जन सन्धेः समीभवनम् (Consonant assimilation)".into(), sutra.into());
                    }
                }
                if is_soft_consonant(b0) {
                    if let Some(soft) = jashtva_char(final_c) {
                        return (format!("{}{}्{}", prefix, soft, w2), "जश्त्व (Jaśtva before soft consonant)".into(), "झलां जशोऽन्ते (८.२.३९)".into());
                    }
                }
                if let Some((v2, rem2)) = starts_with_vowel(w2) {
                    if let Some(soft) = jashtva_char(final_c) {
                        return (format!("{}{}{}{}", prefix, soft, vowel_matra(v2), rem2), "जश्त्व (Jaśtva before vowel)".into(), "झलां जशोऽन्ते (८.२.३९)".into());
                    }
                    return (format!("{}{}{}", stem_with_c, vowel_matra(v2), rem2), "व्यञ्जन + स्वर संयोगः (Consonant + vowel joining)".into(), "संहितायाम्".into());
                }
            }
        }
    }

    (format!("{} {}", w1, w2), "General combination (pada-pāṭha)".into(), "संहितायाम्".into())
}

pub async fn sandhi_join(body: web::Json<SandhiJoinRequest>) -> HttpResponse {
    let w1 = body.word1.trim();
    let w2 = body.word2.trim();

    if w1.is_empty() || w2.is_empty() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Both word1 and word2 are required"
        }));
    }

    let (joined, rule, sutra) = sandhi_join_words(w1, w2);

    HttpResponse::Ok().json(SandhiJoinResponse {
        joined,
        rule,
        paninian_sutra: sutra,
    })
}

pub async fn declensions(query: web::Query<DeclensionQuery>) -> HttpResponse {
    let stem = query.stem.as_deref().unwrap_or("राम").trim();
    let stem = if stem.is_empty() { "राम" } else { stem };
    let gender = query.gender.as_deref().unwrap_or("masculine");

    let use_na_to_nna = stem.contains('र') || stem.contains('ष') || stem.contains('ऋ') || stem.contains('ृ');
    let inst_sg = if use_na_to_nna { format!("{}ेण", stem) } else { format!("{}ेन", stem) };
    let gen_pl = if use_na_to_nna { format!("{}ाणाम्", stem) } else { format!("{}ानाम्", stem) };

    let paradigm = if gender.eq_ignore_ascii_case("neuter") || matches!(stem, "फल" | "पुस्तक" | "वन" | "जल" | "ज्ञान") {
        vec![
            VibhaktiRow { case_num: 1, case_name: "प्रथमा (Nominative)".into(), singular: format!("{}म्", stem), dual: format!("{}े", stem), plural: format!("{}ानि", stem) },
            VibhaktiRow { case_num: 2, case_name: "द्वितीया (Accusative)".into(), singular: format!("{}म्", stem), dual: format!("{}े", stem), plural: format!("{}ानि", stem) },
            VibhaktiRow { case_num: 3, case_name: "तृतीया (Instrumental)".into(), singular: inst_sg, dual: format!("{}ाभ्याम्", stem), plural: format!("{}ैः", stem) },
            VibhaktiRow { case_num: 4, case_name: "चतुर्थी (Dative)".into(), singular: format!("{}ाय", stem), dual: format!("{}ाभ्याम्", stem), plural: format!("{}ेभ्यः", stem) },
            VibhaktiRow { case_num: 5, case_name: "पञ्चमी (Ablative)".into(), singular: format!("{}ात्", stem), dual: format!("{}ाभ्याम्", stem), plural: format!("{}ेभ्यः", stem) },
            VibhaktiRow { case_num: 6, case_name: "षष्ठी (Genitive)".into(), singular: format!("{}स्य", stem), dual: format!("{}योः", stem), plural: gen_pl },
            VibhaktiRow { case_num: 7, case_name: "सप्तमी (Locative)".into(), singular: format!("{}े", stem), dual: format!("{}योः", stem), plural: format!("{}ेषु", stem) },
            VibhaktiRow { case_num: 8, case_name: "सम्बोधन (Vocative)".into(), singular: format!("हे {}", stem), dual: format!("हे {}े", stem), plural: format!("हे {}ानि", stem) },
        ]
    } else {
        vec![
            VibhaktiRow { case_num: 1, case_name: "प्रथमा (Nominative)".into(), singular: format!("{}ः", stem), dual: format!("{}ौ", stem), plural: format!("{}ाः", stem) },
            VibhaktiRow { case_num: 2, case_name: "द्वितीया (Accusative)".into(), singular: format!("{}म्", stem), dual: format!("{}ौ", stem), plural: format!("{}ान्", stem) },
            VibhaktiRow { case_num: 3, case_name: "तृतीया (Instrumental)".into(), singular: inst_sg, dual: format!("{}ाभ्याम्", stem), plural: format!("{}ैः", stem) },
            VibhaktiRow { case_num: 4, case_name: "चतुर्थी (Dative)".into(), singular: format!("{}ाय", stem), dual: format!("{}ाभ्याम्", stem), plural: format!("{}ेभ्यः", stem) },
            VibhaktiRow { case_num: 5, case_name: "पञ्चमी (Ablative)".into(), singular: format!("{}ात्", stem), dual: format!("{}ाभ्याम्", stem), plural: format!("{}ेभ्यः", stem) },
            VibhaktiRow { case_num: 6, case_name: "षष्ठी (Genitive)".into(), singular: format!("{}स्य", stem), dual: format!("{}योः", stem), plural: gen_pl },
            VibhaktiRow { case_num: 7, case_name: "सप्तमी (Locative)".into(), singular: format!("{}े", stem), dual: format!("{}योः", stem), plural: format!("{}ेषु", stem) },
            VibhaktiRow { case_num: 8, case_name: "सम्बोधन (Vocative)".into(), singular: format!("हे {}", stem), dual: format!("हे {}ौ", stem), plural: format!("हे {}ाः", stem) },
        ]
    };

    HttpResponse::Ok().json(DeclensionTable {
        stem: stem.to_string(),
        gender: gender.to_string(),
        paradigm,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn svara_sandhi_rules() {
        assert_eq!(sandhi_join_words("राम", "अग्र").0, "रामाग्र");
        assert_eq!(sandhi_join_words("अग्नि", "इव").0, "अग्नीव");
        assert_eq!(sandhi_join_words("भानु", "उदयः").0, "भानूदयः");
        assert_eq!(sandhi_join_words("पितृ", "ऋणम्").0, "पितॄणम्");
        assert_eq!(sandhi_join_words("देव", "इन्द्र").0, "देवेन्द्र");
        assert_eq!(sandhi_join_words("सूर्य", "उदय").0, "सूर्योदय");
        assert_eq!(sandhi_join_words("देव", "ऋषिः").0, "देवर्षिः");
        assert_eq!(sandhi_join_words("सदा", "एव").0, "सदैव");
        assert_eq!(sandhi_join_words("महा", "औषधम्").0, "महौषधम्");
        assert_eq!(sandhi_join_words("इति", "आदि").0, "इत्यादि");
        assert_eq!(sandhi_join_words("सु", "आगतम्").0, "स्वागतम्");
        assert_eq!(sandhi_join_words("पितृ", "आदेशः").0, "पित्रादेशः");
        assert_eq!(sandhi_join_words("ने", "अनम्").0, "नयनम्");
        assert_eq!(sandhi_join_words("नै", "अकः").0, "नायकः");
        assert_eq!(sandhi_join_words("पौ", "अकः").0, "पावकः");
        assert_eq!(sandhi_join_words("ते", "अपि").0, "तेऽपि");
    }

    #[test]
    fn visarga_and_vyanjana_sandhi_rules() {
        assert_eq!(sandhi_join_words("नमः", "ते").0, "नमस्ते");
        assert_eq!(sandhi_join_words("रामः", "च").0, "रामश्च");
        assert_eq!(sandhi_join_words("धनुः", "टङ्कारः").0, "धनुष्टङ्कारः");
        assert_eq!(sandhi_join_words("रामः", "अस्ति").0, "रामोऽस्ति");
        assert_eq!(sandhi_join_words("शिवः", "वन्द्यः").0, "शिवो वन्द्यः");
        assert_eq!(sandhi_join_words("मुनिः", "इति").0, "मुनिरिति");
        assert_eq!(sandhi_join_words("निः", "रसः").0, "नीरसः");
        assert_eq!(sandhi_join_words("सत्यम्", "वद").0, "सत्यं वद");
        assert_eq!(sandhi_join_words("वाक्", "ईशः").0, "वागीशः");
        assert_eq!(sandhi_join_words("सत्", "जनः").0, "सज्जनः");
        assert_eq!(sandhi_join_words("उत्", "चारणम्").0, "उच्चारणम्");
    }

    #[test]
    fn split_known_examples() {
        let (parts, _, _) = sandhi_split_known("तेऽपि");
        assert_eq!(parts, vec!["ते", "अपि"]);
        let (parts2, _, _) = sandhi_split_known("नमस्ते");
        assert_eq!(parts2, vec!["नमः", "ते"]);
    }
}