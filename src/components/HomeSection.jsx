import React from "react";
import { useTypewriter, useTimezone } from "../hooks";
import { useToast } from "./Toast";
import { playSound } from "../utils/audio";

// Fix #14: show a subtle skeleton while musicData is still loading (null)
function NowPlayingPill({ musicData }) {
  const isLoading = musicData === null;
  const isLive = musicData?.isLive;
  const hasTrack = musicData?.name;

  if (isLoading) {
    return (
      <div
        className="now-playing"
        role="status"
        aria-live="polite"
        aria-label="Loading music data"
      >
        <div className="now-playing-pill now-playing-pill--skeleton">
          <span className="pill-label">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="now-playing" role="status" aria-live="polite">
      <div id="heroPill" className={`now-playing-pill${isLive ? " live" : ""}`}>
        {hasTrack && musicData.art && (
          <div
            className="pill-bg-art has-art"
            aria-hidden="true"
            style={{ backgroundImage: `url('${musicData.art}')` }}
          />
        )}
        <span className={`eq-bars${isLive ? " live" : ""}`} id="heroEqBars">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span className="pill-label">
          {isLive ? "Now Playing" : "Last Played"}
        </span>
        <span className="pill-track">
          {hasTrack ? `${musicData.name} — ${musicData.artist}` : ""}
        </span>
      </div>
    </div>
  );
}

export default function HomeSection({ onNavigate, musicData }) {
  const typewriterText = useTypewriter(["Student", "Developer", "Gamer"]);
  const timezone = useTimezone();
  const showToast = useToast();

  const handleResumeClick = () => {
    playSound("success");
    showToast(
      '<i class="fas fa-file-arrow-down" style="margin-right:6px"></i> Downloading resume…',
      "info",
      2500,
    );
  };

  return (
    <div className="hero-content">
      <div className="hero-badge">
        <i className="fas fa-circle pulse-icon" aria-hidden="true" />
        <span>Available for work</span>
      </div>
      <h1 id="home-heading" className="hero-title">
        Hi, I'm <span className="hero-name-gradient">Devajith</span>
      </h1>
      <p className="hero-subtitle">
        <span id="typewriter" aria-label="Student | Developer | Gamer">
          {typewriterText}
        </span>
        <span className="typewriter-cursor">|</span>
      </p>
      <p className="hero-description">
        Building efficient solutions through code and data analysis. Passionate
        about technology, learning, and creating meaningful projects.
      </p>
      <div
        className="timezone-display"
        id="timezoneDisplay"
        role="status"
        aria-live="polite"
      >
        <i className="fas fa-clock" aria-hidden="true" />
        <span id="timezoneTime">{timezone.time}</span>
        <span className="timezone-separator">·</span>
        <span id="timezoneLabel">{timezone.label}</span>
      </div>
      <div className="hero-actions">
        <button
          onClick={() => onNavigate("projects")}
          className="btn-primary"
          data-magnetic
        >
          <i className="fas fa-folder-open" aria-hidden="true" />
          <span>View Projects</span>
        </button>
        <button
          onClick={() => onNavigate("contact")}
          className="btn-secondary"
          data-magnetic
        >
          <i className="fas fa-paper-plane" aria-hidden="true" />
          <span>Contact Me</span>
        </button>
        <a
          href="assets/docs/Devajith_Resume.pdf"
          download="Devajith_Resume.pdf"
          className="btn-resume"
          id="resumeBtn"
          data-magnetic
          aria-label="Download Resume"
          onClick={handleResumeClick}
        >
          <i className="fas fa-file-arrow-down" aria-hidden="true" />
          <span>Resume</span>
        </a>
      </div>
      <NowPlayingPill musicData={musicData} />
    </div>
  );
}
