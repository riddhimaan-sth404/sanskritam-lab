/**
 * SKELETON DATA FOR SHLOKA VIDEOS (श्लोक-चलचित्राणि)
 * 55 Video Skeletons with rich visual thumbnails and ready-to-play dummy video players.
 * To attach a real video, simply update `videoUrl` with a YouTube link (e.g. "https://www.youtube.com/watch?v=...") or MP4 link.
 */

const shlokaThemes = [
  {
    topic: "श्रीमद्भगवद्गीता - द्वितीयोऽध्यायः",
    en: "Bhagavad Gita · Chapter 2 (Sankhya Yoga)",
    verse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    meter: "अनुष्टुप्",
    raga: "भैरवी",
    bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    accentColor: "#818cf8"
  },
  {
    topic: "ईशावास्योपनिषत् मन्त्राः",
    en: "Isha Upanishad Verses",
    verse: "ईशा वास्यमिदँ सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥",
    meter: "त्रिष्टुप्",
    raga: "यमन",
    bgGradient: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #b45309 100%)",
    accentColor: "#f59e0b"
  },
  {
    topic: "शिवताण्डवस्तोत्रम्",
    en: "Shiva Tandava Stotram (Ravana Krutam)",
    verse: "जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्॥",
    meter: "पञ्चचामरम्",
    raga: "मालकौंस",
    bgGradient: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 100%)",
    accentColor: "#38bdf8"
  },
  {
    topic: "मधुराष्टकम्",
    en: "Madhurashtakam (Vallabhacharya)",
    verse: "अधरं मधुरं वदनं मधुरं नयनं मधुरं हसितं मधुरम्। हृदयं मधुरं गमनं मधुरं मधुराधिपतेरखिलं मधुरम्॥",
    meter: "तोडकम्",
    raga: "खमाज",
    bgGradient: "linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)",
    accentColor: "#4ade80"
  },
  {
    topic: "सुभाषितरत्नभाण्डागारम्",
    en: "Subhashita Wisdom Gems",
    verse: "विद्या ददाति विनयं विनयाद्याति पात्रताम्। पात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥",
    meter: "अनुष्टुप्",
    raga: "भूपाली",
    bgGradient: "linear-gradient(135deg, #701a75 0%, #86198f 50%, #a21caf 100%)",
    accentColor: "#f472b6"
  },
  {
    topic: "कालिदास-रघुवंशम् श्लोकाः",
    en: "Kalidasa's Raghuvamsham",
    verse: "वागर्थाविव सम्पृक्तौ वागर्थप्रतिपत्तये। जगतः पितरौ वन्दे पार्वतीपरमेश्वरौ॥",
    meter: "उपजाति",
    raga: "दरबारी",
    bgGradient: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)",
    accentColor: "#38bdf8"
  },
  {
    topic: "शान्तिमन्त्राः (वेदाः)",
    en: "Vedic Shanti Mantras",
    verse: "ॐ द्यौः शान्तिरन्तरिक्षँ शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः॥",
    meter: "गायत्री",
    raga: "भैरव",
    bgGradient: "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)",
    accentColor: "#fb923c"
  },
  {
    topic: "नीतिशतकम् (भर्तृहरिः)",
    en: "Bhartrihari's Niti Shatakam",
    verse: "प्रारभ्यते न खलु विघ्नभयेन नीचैः प्रारभ्य विघ्नविहता विरमन्ति मध्याः॥",
    meter: "शार्दूलविक्रीडितम्",
    raga: "कल्याण",
    bgGradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #0d9488 100%)",
    accentColor: "#2dd4bf"
  },
  {
    topic: "विष्णुसहस्रनाम स्तोत्रम्",
    en: "Vishnu Sahasranama Dhyanam",
    verse: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्॥",
    meter: "अनुष्टुप्",
    raga: "मध्यमावती",
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
    accentColor: "#60a5fa"
  },
  {
    topic: "सौन्दर्यलहरी (शङ्कराचार्यः)",
    en: "Soundarya Lahari",
    verse: "शिवः शक्त्या युक्तो यदि भवति शक्तः प्रभवितुं न चेदेवं देवो न खलु कुशलः स्पन्दितुमपि॥",
    meter: "शिखरिणी",
    raga: "आनन्दभैरवी",
    bgGradient: "linear-gradient(135deg, #831843 0%, #9d174d 50%, #be185d 100%)",
    accentColor: "#f472b6"
  },
  {
    topic: "मेघदूतम् (कालिदासः)",
    en: "Meghadutam Mandakranta",
    verse: "कश्चित्कान्ताविरहगुरुणा स्वाधिकारात्प्रमत्तः शापेनास्तङ्गमितमहिमा वर्षभोग्येण भर्तुः॥",
    meter: "मन्दाक्रान्ता",
    raga: "मेघ",
    bgGradient: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
    accentColor: "#a8a29e"
  }
];

export const SHLOKA_VIDEOS = Array.from({ length: 55 }, (_, i) => {
  const num = i + 1;
  const pad = num < 10 ? `0${num}` : `${num}`;
  const theme = shlokaThemes[i % shlokaThemes.length];
  const durationSec = 150 + (i * 17) % 180;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return {
    id: `sv-${pad}`,
    category: "shloka_videos",
    categoryLabel: "Shloka Videos",
    categoryLabelHi: "श्लोक-चलचित्राणि",
    icon: "play",
    title: `श्लोक-चलचित्रम् ${num} · Shloka Video ${pad}`,
    titleHi: `श्लोक-चलचित्रम् ${num}`,
    titleEn: `Shloka Video ${pad}`,
    subTopic: theme.topic,
    subTopicEn: theme.en,
    verse: theme.verse,
    meter: theme.meter,
    raga: theme.raga,
    bgGradient: theme.bgGradient,
    accentColor: theme.accentColor,
    desc: `${theme.topic} (${theme.en}) — सस्वर पाठः, पदच्छेदः, अन्वयः एवं भावार्थ-चलचित्र-कङ्कालः।`,
    descEn: `Traditional metric recitation & verse-by-verse breakdown for ${theme.en}. Includes dummy player & YouTube link support.`,
    videoUrl: "", // Paste YouTube URL or MP4 link here
    youtubeId: "", // Optional YouTube video ID
    duration: durationStr,
    durationSec: durationSec,
    views: `${(1.2 + (i * 0.3) % 4.5).toFixed(1)}K`,
    link: `#video-sv-${pad}`,
    isSkeleton: true,
    isVideo: true
  };
});

export default SHLOKA_VIDEOS;
