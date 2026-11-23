import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowDownToLine, Send, MapPin, Clock } from 'runeicons-react';
import { GithubIcon, LinkedinIcon, InstagramIcon } from '../components/BrandIcons';
import { profile, about, experiences, techStack } from '../data/site';
import { useTimezone } from '../hooks';
import { featuredProjects } from '../data/projects';
import NowPlaying from '../components/NowPlaying';
import ProjectCard from '../components/ProjectCard';
import GitHubActivity from '../components/GitHubActivity';

function Section({ eyebrow, title, action, children, className = '' }) {
  return (
    <section className={`reveal py-7 sm:py-9 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="section-label">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const actionBtn = 'focus-ring inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors';
const primaryBtn = `${actionBtn} bg-accent text-accent-invert hover:opacity-90`;
const secondaryBtn = `${actionBtn} border border-border bg-surface text-text hover:bg-surface-hover`;

export default function Home({ music }) {
  const timezone = useTimezone();
  return (
    <>
      <Helmet>
        <title>{profile.name} | Student, Developer & Data Analyst</title>
        <meta name="description" content={profile.headline} />
      </Helmet>

      <section className="reveal pb-8 pt-2 sm:pb-10 sm:pt-4">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-10">
          <div className="order-2 max-w-2xl md:order-1">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-text-muted">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
              {profile.availability}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-5xl">
              Hi, I&apos;m {profile.name}
            </h1>
            <p className="mt-2 text-sm text-text-secondary sm:text-base">{profile.role}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted">
              {profile.headline}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a href={`mailto:${profile.email}`} className={primaryBtn}>
                <Send size={16} /> Let&apos;s Talk
              </a>
              <a href={profile.resume} download={profile.resumeName} className={secondaryBtn}>
                <ArrowDownToLine size={16} /> Resume
              </a>
              <div className="ml-1 flex items-center gap-1 text-text-muted">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><GithubIcon className="h-4 w-4" /></a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><LinkedinIcon className="h-4 w-4" /></a>
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><InstagramIcon className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted sm:text-sm">
              <p className="inline-flex items-center gap-2"><MapPin size={16} /> {profile.location}</p>
              <p className="inline-flex items-center gap-2"><Clock size={16} /> {timezone.time} {timezone.label ? `· ${timezone.label.split('·')[0].trim()}` : 'IST'}</p>
            </div>
          </div>

          <div className="order-1 mx-auto md:order-2 md:mx-0">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-border bg-surface shadow-sm sm:h-36 sm:w-36 md:h-44 md:w-44">
              <img
                src="/assets/images/profile.webp"
                alt={`${profile.name} portrait`}
                className="h-full w-full object-cover object-[center_20%] transition-transform duration-500 hover:scale-[1.03]"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      <NowPlaying music={music} />

      <Section
        eyebrow="About"
        title="A bit about me"
        action={<Link to="/about" className="muted-link inline-flex items-center gap-1 text-sm">More about me <ChevronRight size={16} /></Link>}
      >
        <div className="card p-4 sm:p-5">
          <p className="max-w-3xl text-sm leading-relaxed text-text-muted">{about.short}</p>
        </div>
      </Section>

      {experiences.length > 0 && (
        <Section eyebrow="Experience" title="Where I've worked">
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={`${exp.company}-${exp.role}`} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="font-medium text-text hover:underline">{exp.company}</a>
                  <p className="text-sm text-text-muted">{exp.role}</p>
                </div>
                <div className="text-sm text-text-muted sm:text-right">
                  <p>{exp.period}</p>
                  <p>{exp.location}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        eyebrow="Featured"
        title="Projects"
        action={<Link to="/projects" className="muted-link inline-flex items-center gap-1 text-sm">Show all projects <ChevronRight size={16} /></Link>}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <Section eyebrow="GitHub" title="Recent activity">
        <GitHubActivity />
      </Section>

      <Section eyebrow="Skills" title="Tech Stack">
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <div key={tech.name} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text-secondary">
              <img src={tech.icon} alt="" className="h-3.5 w-3.5" loading="lazy" />
              <span>{tech.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Contact" title="Let's talk">
        <div className="card p-4 sm:p-5">
          <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
            Have a project, opportunity, or question? I&apos;d love to hear from you.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a href={`mailto:${profile.email}`} className={primaryBtn}><Send size={16} /> Email me</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={secondaryBtn}><LinkedinIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className={secondaryBtn}><GithubIcon className="h-4 w-4" /> GitHub</a>
          </div>
        </div>
      </Section>
    </>
  );
}
