import { Helmet } from 'react-helmet-async';
import { Send, ArrowDownToLine, MapPin } from 'runeicons-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/BrandIcons';
import { profile, about, experiences } from '../data/site';
import Reveal from '../components/Reveal';

export default function About() {
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

        <Reveal as="section" className="card p-5 sm:p-6" delay={0.12}>
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
