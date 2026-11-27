import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, ArrowDownToLine, MapPin, ChevronDown } from 'runeicons-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/BrandIcons';
import { profile, about, experiences } from '../data/site';
import Reveal from '../components/Reveal';

export default function About() {
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <Helmet>
        <title>About | {profile.name}</title>
        <meta name="description" content={about.short} />
      </Helmet>

      <Reveal className="max-w-3xl">
        <p className="section-label">About</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">A bit more about me</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary sm:text-base">{about.short}</p>
      </Reveal>

      <div className="mt-10 grid gap-4">
        <Reveal as="section" className="card p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-text">Background</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-text-secondary">
            {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Reveal>

        <Reveal as="section" className="card p-5 sm:p-6" delay={0.04}>
          <h2 className="text-lg font-semibold tracking-tight text-text">Education</h2>
          <div className="mt-5 space-y-5">
            {about.education.map((item) => (
              <div key={item.title} className="relative border-l border-border pl-5">
                <span className="absolute top-1.5 -left-[4.5px] h-2 w-2 rounded-full bg-text-subtle" aria-hidden="true" />
                <h3 className="font-medium text-text">{item.title}</h3>
                <p className="mt-1 font-mono text-[12px] text-text-muted">{item.subtitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {experiences.length > 0 && (
          <Reveal as="section" className="card p-5 sm:p-6" delay={0.08}>
            <h2 className="text-lg font-semibold tracking-tight text-text">Experience</h2>
            <div className="mt-5 space-y-5">
              {experiences.map((exp) => (
                <div key={`${exp.company}-${exp.role}`} className="flex flex-col gap-2 border-l border-border pl-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm font-medium text-text underline-offset-4 hover:underline">{exp.company}</a>
                    <p className="mt-0.5 text-sm text-text-muted">{exp.role}</p>
                    <p className="text-sm text-text-muted">{exp.location}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[12px] text-text-muted">{exp.period}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {about.interests?.length > 0 && (
          <Reveal as="section" className="card p-5 sm:p-6" delay={0.12}>
            <h2 className="text-lg font-semibold tracking-tight text-text">Beyond code</h2>
            <div className="mt-5 space-y-6">
              {about.interests.map((group) => {
                const items = group.items || [];
                const limit = 4;
                const hasMore = items.length > limit;
                const isExpanded = !!expandedGroups[group.label];
                const visibleItems = hasMore && !isExpanded ? items.slice(0, limit) : items;

                return (
                  <div key={group.label}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-text">{group.label}</p>
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.label)}
                          className="focus-ring inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-text-muted transition hover:text-text"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Show less' : `Show all (${items.length})`}
                          <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {visibleItems.map((item, i) => {
                        const label = item.title ? `${item.title} ${group.label === 'Reading' ? 'cover' : 'poster'}` : `${group.label} ${group.label === 'Reading' ? 'cover' : 'poster'}`;
                        const content = (
                          <>
                            <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-hover">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={label}
                                  className="h-full w-full object-cover transition duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.03]"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center px-3 text-center">
                                  <span className="font-mono text-[11px] leading-relaxed text-text-subtle">Add poster</span>
                                </div>
                              )}
                            </div>
                            <figcaption className="mt-2 truncate text-[12px] text-text-muted" title={item.title}>
                              {item.title || 'Untitled'}
                            </figcaption>
                          </>
                        );

                        return (
                          <figure key={`${group.label}-${item.title}-${i}`} className="min-w-0">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group focus-ring block rounded-xl"
                              >
                                {content}
                              </a>
                            ) : (
                              <div className="group">{content}</div>
                            )}
                          </figure>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        <Reveal as="section" className="card p-5 sm:p-6" delay={about.interests?.length > 0 ? 0.16 : 0.12}>
          <h2 className="text-lg font-semibold tracking-tight text-text">Let&apos;s connect</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">Have an idea, opportunity, or just want to say hi? Feel free to reach out.</p>
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-[12px] text-text-muted"><MapPin size={14} aria-hidden="true" /> {profile.location}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="btn-primary focus-ring"><Send size={15} /> Email</a>
            <a href={profile.resume} download={profile.resumeName} className="btn-secondary focus-ring"><ArrowDownToLine size={15} /> Resume</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring"><GithubIcon className="h-4 w-4" /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring"><LinkedinIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring"><InstagramIcon className="h-4 w-4" /> Instagram</a>
          </div>
        </Reveal>
      </div>
    </>
  );
}
