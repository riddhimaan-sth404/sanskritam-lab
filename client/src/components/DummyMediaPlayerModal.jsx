import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link as LinkIcon,
  Check,
  Music,
  Video,
  X
} from "lucide-react";

export default function DummyMediaPlayerModal({ item, onClose, onNext, onPrev, hasNext, hasPrev }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [customUrl, setCustomUrl] = useState(item?.videoUrl || item?.audioUrl || "");
  const [savedUrl, setSavedUrl] = useState(item?.videoUrl || item?.audioUrl || "");
  const [copySuccess, setCopySuccess] = useState(false);

  const duration = item?.durationSec || 215;
  const isVideo = item?.category === "shloka_videos";

  // Simulate playback timer
  useEffect(() => {
    let interval = null;
    if (isPlaying && !extractYouTubeId(savedUrl)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, playbackSpeed, savedUrl]);

  // Reset when item changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    setCustomUrl(item?.videoUrl || item?.audioUrl || "");
    setSavedUrl(item?.videoUrl || item?.audioUrl || "");
  }, [item?.id]);

  function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  const youtubeId = extractYouTubeId(savedUrl);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(pos * duration));
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    setSavedUrl(customUrl.trim());
    item.videoUrl = customUrl.trim();
    item.audioUrl = customUrl.trim();
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(8px)"
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: 20,
          maxWidth: 780,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh"
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "#1e293b"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 99,
                background: isVideo ? "#0284c7" : "#d97706",
                color: "#fff",
                letterSpacing: "0.5px"
              }}
            >
              {item.categoryLabelHi} · {item.id}
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}
            >
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              cursor: "pointer",
              fontSize: 16
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video / Audio Player Viewport */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            background: item.bgGradient || "linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={item.title}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              {/* Dummy Player Animated Screen */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                  textAlign: "center"
                }}
              >
                {/* Glowing Pulsing Aura */}
                <div
                  style={{
                    position: "absolute",
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    background: item.accentColor || "#ff6a00",
                    filter: "blur(70px)",
                    opacity: isPlaying ? 0.35 : 0.15,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none"
                  }}
                />

                {/* Big Center Play / Pause Icon Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(255, 106, 0, 0.95)",
                    border: "3px solid rgba(255,255,255,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 8px 30px rgba(255,106,0,0.5)",
                    transition: "transform 0.15s ease",
                    zIndex: 2
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {isPlaying ? <Pause size={34} fill="#fff" /> : <Play size={34} fill="#fff" style={{ marginLeft: 4 }} />}
                </button>

                {/* Video Info Overlay */}
                <div style={{ marginTop: 18, zIndex: 2, maxWidth: 620 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: item.accentColor || "#fbbf24",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 6
                    }}
                  >
                    {item.subTopic || item.songName} · {item.meter ? `छन्दः ${item.meter}` : item.type}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.5,
                      textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                      fontFamily: "'Noto Sans Devanagari', sans-serif"
                    }}
                  >
                    {item.verse || item.titleHi}
                  </div>
                </div>

                {/* Simulated Audio Visualizer Bars */}
                {isPlaying && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: 4,
                      height: 36,
                      marginTop: 18,
                      zIndex: 2
                    }}
                  >
                    {[18, 32, 24, 40, 20, 36, 28, 16, 38, 22, 34, 19, 30].map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 4,
                          height: `${(h * ((currentTime % 5) + 1)) / 3}px`,
                          maxHeight: 36,
                          minHeight: 6,
                          borderRadius: 2,
                          background: item.accentColor || "#ff6a00",
                          transition: "height 0.2s ease"
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Player Top Badges */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  zIndex: 3
                }}
              >
                <span
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.5px"
                  }}
                >
                  HD 1080p · DUMMY PLAYER
                </span>
                <span
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(4px)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#cbd5e1"
                  }}
                >
                  {item.views || "1.2K"} views
                </span>
              </div>

              {/* Bottom Custom Control Bar */}
              <div
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.92) 100%)",
                  padding: "16px 16px 12px",
                  zIndex: 3
                }}
              >
                {/* Scrubber Progress Bar */}
                <div
                  onClick={handleSeek}
                  style={{
                    width: "100%",
                    height: 6,
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: 3,
                    cursor: "pointer",
                    position: "relative",
                    marginBottom: 10
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "var(--vt-orange)",
                      borderRadius: 3,
                      position: "relative"
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -5,
                        top: -4,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 0 6px rgba(0,0,0,0.5)"
                      }}
                    />
                  </div>
                </div>

                {/* Control Buttons & Timestamps */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                      onClick={() => setCurrentTime(0)}
                      title="Restart"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#cbd5e1",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <RotateCcw size={16} />
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      title={isMuted ? "Unmute" : "Mute"}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#cbd5e1",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Speed Selector */}
                    <button
                      onClick={() => {
                        const speeds = [1, 1.25, 1.5, 2];
                        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                        setPlaybackSpeed(speeds[nextIdx]);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer"
                      }}
                    >
                      {playbackSpeed}x
                    </button>

                    {/* Prev / Next video */}
                    <button
                      onClick={onPrev}
                      disabled={!hasPrev}
                      title="Previous"
                      style={{
                        background: "none",
                        border: "none",
                        color: hasPrev ? "#fff" : "rgba(255,255,255,0.3)",
                        cursor: hasPrev ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={onNext}
                      disabled={!hasNext}
                      title="Next"
                      style={{
                        background: "none",
                        border: "none",
                        color: hasNext ? "#fff" : "rgba(255,255,255,0.3)",
                        cursor: hasNext ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Section: Real YouTube / MP4 Link Input */}
        <div style={{ padding: "16px 20px", background: "#1e293b", overflowY: "auto" }}>
          <form onSubmit={handleApplyUrl} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <LinkIcon
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}
              />
              <input
                type="text"
                placeholder="यूट्युब् संयोजनं प्रविशतु (Paste YouTube URL or Video link to test real playback)..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 36px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#fff",
                  fontSize: 13
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-sm btn-primary"
              style={{ padding: "9px 16px", whiteSpace: "nowrap" }}
            >
              {copySuccess ? <Check size={16} /> : "चालयतु (Embed)"}
            </button>
          </form>

          {/* Metadata Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
              fontSize: 12,
              background: "#0f172a",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #334155"
            }}
          >
            <div>
              <span style={{ color: "#94a3b8", display: "block" }}>विषयः / Theme:</span>
              <strong style={{ color: "#e2e8f0" }}>{item.subTopic || item.songName}</strong>
            </div>
            {item.meter && (
              <div>
                <span style={{ color: "#94a3b8", display: "block" }}>छन्दः / Meter:</span>
                <strong style={{ color: "#e2e8f0" }}>{item.meter}</strong>
              </div>
            )}
            {item.raga && (
              <div>
                <span style={{ color: "#94a3b8", display: "block" }}>रागः / Raga:</span>
                <strong style={{ color: "#e2e8f0" }}>{item.raga}</strong>
              </div>
            )}
            {item.composer && (
              <div>
                <span style={{ color: "#94a3b8", display: "block" }}>रचयिता / Composer:</span>
                <strong style={{ color: "#e2e8f0" }}>{item.composer}</strong>
              </div>
            )}
            <div>
              <span style={{ color: "#94a3b8", display: "block" }}>अवधिः / Duration:</span>
              <strong style={{ color: "#e2e8f0" }}>{item.duration}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

