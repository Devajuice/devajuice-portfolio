import { Helmet } from 'react-helmet-async';
import { Send, ArrowDownToLine, MapPin } from 'runeicons-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/BrandIcons';
import { profile, about, experiences } from '../data/site';

const actionBtn = 'focus-ring inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors';
const primaryBtn = `${actionBtn} bg-accent text-accent-invert hover:opacity-90`;
const secondaryBtn = `${actionBtn} border border-border bg-surface text-text hover:bg-surface-hover`;

export default function About() {
  return (
    <>
      <Helmet>
        <title>About | {profile.name}</title>
        <meta name="description" content={about.short} />
      </Helmet>

      <div className="reveal max-w-3xl">
        <p className="section-label">About</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">A bit more about me</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted sm:text-base">{about.short}</p>
      </div>

      <div className="mt-8 grid gap-4">
        <section className="card reveal p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-text">Background</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-muted">
            {about.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </div>
        </section>

        <section className="card reveal p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-text">Education</h2>
          <div className="mt-4 space-y-4">
            {about.education.map((item) => (
              <div key={item.title} className="border-l border-border pl-4">
                <h3 className="font-medium text-text">{item.title}</h3>
                <p className="mt-1 text-sm text-text-muted">{item.subtitle}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {experiences.length > 0 && (
          <section className="card reveal p-4 sm:p-5">
            <h2 className="text-lg font-semibold tracking-tight text-text">Experience</h2>
            <div className="mt-4 space-y-4">
              {experiences.map((exp) => (
                <div key={`${exp.company}-${exp.role}`} className="flex flex-col gap-1 border-l border-border pl-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <a href={exp.url} target="_blank" rel="noopener noreferrer" className="font-medium text-text hover:underline">{exp.company}</a>
                    <p className="text-sm text-text-muted">{exp.role}</p>
                    <p className="text-sm text-text-muted">{exp.location}</p>
                  </div>
                  <p className="shrink-0 text-sm text-text-muted">{exp.period}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="card reveal p-4 sm:p-5">
          <h2 className="text-lg font-semibold tracking-tight text-text">Let&apos;s connect</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">Have an idea, opportunity, or just want to say hi? Feel free to reach out.</p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-text-muted"><MapPin size={16} /> {profile.location}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a href={`mailto:${profile.email}`} className={primaryBtn}><Send size={16} /> Email</a>
            <a href={profile.resume} download={profile.resumeName} className={secondaryBtn}><ArrowDownToLine size={16} /> Resume</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className={secondaryBtn}><GithubIcon className="h-4 w-4" /> GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={secondaryBtn}><LinkedinIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className={secondaryBtn}><InstagramIcon className="h-4 w-4" /> Instagram</a>
          </div>
        </section>
      </div>
    </>
  );
}
