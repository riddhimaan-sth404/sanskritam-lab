/**
 * SKELETON DATA FOR SANSKRIT SONGS (संस्कृत-गीतानि)
 * 55 Song Skeletons with rich audio/video thumbnails and dummy interactive players.
 * To attach a real song, update `audioUrl` or `videoUrl` with an MP3 or YouTube link.
 */

const songThemes = [
  {
    titleHi: "पठत संस्कृतं वदत संस्कृतम्",
    titleEn: "Pathata Sanskritam Vadata Sanskritam",
    type: "प्रबोधन-गीतम् (Inspirational)",
    composer: "संस्कृत-भारती",
    verse: "पठत संस्कृतं वदत संस्कृतम्। लसतु संस्कृतं चिरं गृहे गृहे च भारते॥",
    bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4338ca 100%)",
    accentColor: "#a5b4fc"
  },
  {
    titleHi: "जयतु जयतु भारतम्",
    titleEn: "Jayatu Jayatu Bharatam",
    type: "देशभक्ति-गीतम् (Patriotic)",
    composer: "डा. वासुदेव कृष्णः",
    verse: "जयतु जयतु भारतं जयतु भारतम्। भव्य-दिव्य-मातृभूमि-वन्दनं मुहुर्मुहुः॥",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #7c2d12 50%, #ea580c 100%)",
    accentColor: "#fdba74"
  },
  {
    titleHi: "वन्दे मातरम् (संस्कृत रूपान्तरम्)",
    titleEn: "Vande Mataram (Sanskrit Lyrical)",
    type: "राष्ट्रिय-गीतम् (National Song)",
    composer: "बंकिमचन्द्र चट्टोपाध्यायः",
    verse: "सुजलां सुफलां मलयजशीतलाम्। शस्यश्यामलां मातरम्। वन्दे मातरम्॥",
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
    accentColor: "#6ee7b7"
  },
  {
    titleHi: "चन्दनमिव वने",
    titleEn: "Chandanamiva Vane (Sacred Woods)",
    type: "संस्कृति-गीतम् (Cultural Melody)",
    composer: "पारम्परिकम्",
    verse: "चन्दनमिव वने सुगन्धियुतम्। संस्कृतं सुहृदयं सकललोकहितम्॥",
    bgGradient: "linear-gradient(135deg, #701a75 0%, #86198f 50%, #c026d3 100%)",
    accentColor: "#f0abfc"
  },
  {
    titleHi: "एहि एहि वीर बालक",
    titleEn: "Ehi Ehi Vira Balaka",
    type: "बाल-गीतम् (Children's March)",
    composer: "संस्कृत शिक्षामृतम्",
    verse: "एहि एहि वीर बालक! पालयतु धर्ममादरात्। रक्षतु राष्ट्रमुन्नतं जयतु जयतु भारतम्॥",
    bgGradient: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0ea5e9 100%)",
    accentColor: "#7dd3fc"
  },
  {
    titleHi: "मधुरं मधुरं संस्कृतम्",
    titleEn: "Madhuram Madhuram Sanskritam",
    type: "भाषा-प्रशस्तिः (Ode to Sanskrit)",
    composer: "आचार्य रामचन्द्रः",
    verse: "मधुरं मधुरं संस्कृतम्, सरलं सरलं संस्कृतम्। सुरभारती सुमधुरामृत-धारारूपं संस्कृतम्॥",
    bgGradient: "linear-gradient(135deg, #831843 0%, #be185d 50%, #db2777 100%)",
    accentColor: "#f9a8d4"
  },
  {
    titleHi: "हे हंसवाहिनी ज्ञानदायिनी",
    titleEn: "He Hamsavahini Jnanadayini",
    type: "सरस्वती-वन्दना (Saraswati Vandana)",
    composer: "परम्परागतम्",
    verse: "हे हंसवाहिनी ज्ञानदायिनी अम्ब विमल मति दे। जगत् जननी भारतमाता सकल-सद्गुणं दे॥",
    bgGradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
    accentColor: "#5eead4"
  },
  {
    titleHi: "सत्यमेव जयते नानृतम्",
    titleEn: "Satyameva Jayate Nanritam",
    type: "उपनिषद्-गीतम् (Truth Resounding)",
    composer: "मुण्डकोपनिषत्",
    verse: "सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः॥",
    bgGradient: "linear-gradient(135deg, #365314 0%, #4d7c0f 50%, #65a30d 100%)",
    accentColor: "#bef264"
  },
  {
    titleHi: "दीपज्योतिः परब्रह्म",
    titleEn: "Deepa Jyotih Parabrahma",
    type: "प्रार्थना (Evening Prayer)",
    composer: "वैदिक परम्परा",
    verse: "दीपज्योतिः परब्रह्म दीपज्योतिर्जनार्दनः। दीपो हरतु मे पापं सन्ध्यादीप नमोऽस्तु ते॥",
    bgGradient: "linear-gradient(135deg, #78350f 0%, #b45309 50%, #f59e0b 100%)",
    accentColor: "#fde68a"
  },
  {
    titleHi: "कर्मण्येवाधिकारस्ते",
    titleEn: "Karmanye Vadhikaraste (Geeta Gaan)",
    type: "गीतोपदेश-गीतम् (Geeta Song)",
    composer: "व्यास-प्रणीतम्",
    verse: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #3b82f6 100%)",
    accentColor: "#93c5fd"
  },
  {
    titleHi: "सर्वे भवन्तु सुखिनः",
    titleEn: "Sarve Bhavantu Sukhinah",
    type: "शान्ति-गीतम् (Universal Peace)",
    composer: "बृहदारण्यकोपनिषत्",
    verse: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥",
    bgGradient: "linear-gradient(135deg, #1c1917 0%, #44403c 50%, #78716c 100%)",
    accentColor: "#d6d3d1"
  }
];

export const SANSKRIT_SONGS = Array.from({ length: 55 }, (_, i) => {
  const num = i + 1;
  const pad = num < 10 ? `0${num}` : `${num}`;
  const theme = songThemes[i % songThemes.length];
  const durationSec = 170 + (i * 13) % 190;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return {
    id: `ss-${pad}`,
    category: "sanskrit_songs",
    categoryLabel: "Sanskrit Songs",
    categoryLabelHi: "संस्कृत-गीतानि",
    icon: "music",
    title: `संस्कृत-गीतम् ${num} · Sanskrit Song ${pad}`,
    titleHi: `संस्कृत-गीतम् ${num}`,
    titleEn: `Sanskrit Song ${pad}`,
    songName: theme.titleHi,
    songNameEn: theme.titleEn,
    type: theme.type,
    composer: theme.composer,
    verse: theme.verse,
    bgGradient: theme.bgGradient,
    accentColor: theme.accentColor,
    desc: `${theme.titleHi} (${theme.titleEn}) — ${theme.type}। लयबद्धं सुमधुरं संस्कृत-गानम्।`,
    descEn: `${theme.type} composed in traditional rhythmic Sanskrit meter. Includes dummy audio player & URL support.`,
    audioUrl: "", // Paste audio file path or streaming URL here later
    videoUrl: "", // Optional YouTube video link
    duration: durationStr,
    durationSec: durationSec,
    views: `${(2.1 + (i * 0.4) % 6.0).toFixed(1)}K`,
    link: `#song-ss-${pad}`,
    isSkeleton: true,
    isVideo: false
  };
});

export default SANSKRIT_SONGS;
