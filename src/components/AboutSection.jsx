import React from 'react';

function MusicCard({ musicData }) {
  const isLive = musicData?.isLive;
  const hasTrack = musicData?.name && !musicData?.error;

  return (
    <div className="music-card">
      <h3 className="subsection-title">
        <i className="fab fa-lastfm" aria-hidden="true" />
        <span>Currently Listening</span>
      </h3>
      <div className={`card${isLive ? ' live-glow' : ''}`} id="musicGlassCard">
        {hasTrack && musicData.art && (
          <div
            className="music-card-bg-art has-art"
            id="musicCardBgArt"
            aria-hidden="true"
            style={{ backgroundImage: `url('${musicData.art}')` }}
          />
        )}
        <div className="music-widget">
          {hasTrack && musicData.art && (
            <img
              id="albumArt"
              className="album-art"
              src={musicData.art}
              alt={`${musicData.album} album cover`}
              loading="lazy"
            />
          )}
          <div className="music-info">
            <h4 id="trackName" className="track-name-row">
              {hasTrack ? musicData.name : 'Connect your Last.fm'}
              {hasTrack && (
                <span
                  id="aboutLiveBadge"
                  className={`music-live-badge ${isLive ? 'live' : 'recent'}`}
                >
                  {isLive ? (
                    <>
                      <i className="fas fa-circle" style={{ fontSize: '.5em' }} /> Live
                    </>
                  ) : (
                    <>
                      <i className="fas fa-clock" style={{ fontSize: '.7em' }} /> Recent
                    </>
                  )}
                </span>
              )}
            </h4>
            <p id="artistName" className="text-muted artist-name-row">
              {hasTrack && (
                <span className={`eq-bars${isLive ? ' live' : ''}`} id="aboutEqBars">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              )}
              <span id="artistNameText">{hasTrack ? musicData.artist : ''}</span>
            </p>
            <p id="albumName" className="text-muted">
              {hasTrack ? musicData.album : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutSection({ musicData }) {
  return (
    <>
      <h2 id="about-heading" className="section-title">
        <i className="fas fa-user-circle" aria-hidden="true" />
        <span>About Me</span>
      </h2>
      <div className="about-content">
        <p className="about-text">
          I'm a student passionate about technology and problem-solving. My journey in tech has been
          driven by curiosity and the desire to build solutions that make a difference. I specialize
          in Python development and data analysis, constantly exploring new technologies and
          methodologies.
        </p>
        <p className="about-text">
          When I'm not coding, you'll find me gaming, tinkering with new technologies, or listening
          to music. I believe in continuous learning and sharing knowledge with the community.
        </p>
      </div>
      <div className="education-section">
        <h3 className="subsection-title">
          <i className="fas fa-graduation-cap" aria-hidden="true" />
          <span>Education</span>
        </h3>
        <div className="timeline">
          <div className="timeline-line" aria-hidden="true" />
          {[
            {
              dot: 'fa-university',
              badge: 'Current',
              badgeClass: '',
              year: '2026 – Present',
              title: 'Bachelor of Computer Applications',
              place: 'Acharya Institute of Technology',
              desc: 'Pursuing a degree focused on computer science and cloud computing, building a strong foundation in algorithms, data structures, and modern cloud computing.',
            },
            {
              dot: 'fa-school',
              dotClass: 'timeline-dot--past',
              badge: 'Completed',
              badgeClass: 'timeline-badge--past',
              year: '2024 – 2026',
              title: 'Higher Secondary Education',
              place: 'Chinmaya Vidyalaya',
              desc: 'Equipped with a robust quantitative background, I apply principles of logic and systematic problem-solving to drive efficiency in modern commerce and technology.',
            },
            {
              dot: 'fa-school',
              dotClass: 'timeline-dot--past',
              badge: 'Completed',
              badgeClass: 'timeline-badge--past',
              year: '2015 – 2024',
              title: 'Primary Education',
              place: 'Abu Dhabi Indian School',
              desc: '',
            },
          ].map((item) => (
            <div className="timeline-item" key={item.title}>
              <div
                className={`timeline-dot${item.dotClass ? ' ' + item.dotClass : ''}`}
                aria-hidden="true"
              >
                <i className={`fas ${item.dot}`} />
              </div>
              <div className="timeline-card card">
                <div className="timeline-header">
                  <span className={`timeline-badge${item.badgeClass ? ' ' + item.badgeClass : ''}`}>
                    {item.badge}
                  </span>
                  <span className="timeline-year">{item.year}</span>
                </div>
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-place text-muted">
                  <i className="fas fa-map-marker-alt" aria-hidden="true" />
                  {item.place}
                </p>
                {item.desc && <p className="timeline-desc text-muted">{item.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <MusicCard musicData={musicData} />
    </>
  );
}
