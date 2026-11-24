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
import Reveal from '../components/Reveal';

function Section({ eyebrow, title, action, children, className = '' }) {
  return (
    <Reveal as="section" className={`py-8 sm:py-10 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="section-label">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Reveal>
  );
}

const iconLinkClass = 'focus-ring muted-link inline-flex rounded-lg p-2 transition-colors hover:bg-surface-hover';

export default function Home({ music }) {
  const timezone = useTimezone();
  return (
    <>
      <Helmet>
        <title>{profile.name} | Student, Developer & Data Analyst</title>
        <meta name="description" content={profile.headline} />
      </Helmet>

      <section className="pb-10 pt-2 sm:pb-14 sm:pt-4">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
          <Reveal className="order-2 max-w-2xl md:order-1" y={16}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 font-mono text-[11px] tracking-[0.04em] text-text-muted">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
              </span>
              {profile.availability}
            </p>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-text sm:text-5xl md:text-[3.5rem] md:leading-[1.08]">
              Hi, I&apos;m {profile.name}
            </h1>
            <p className="mt-3 font-mono text-[13px] tracking-[0.02em] text-text-muted sm:text-sm">
              {profile.role}
            </p>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
              {profile.headline}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={`mailto:${profile.email}`} className="btn-primary focus-ring">
                <Send size={15} /> Let&apos;s Talk
              </a>
              <a href={profile.resume} download={profile.resumeName} className="btn-secondary focus-ring">
                <ArrowDownToLine size={15} /> Resume
              </a>
              <div className="flex items-center gap-0.5 text-text-muted sm:ml-1">
                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={iconLinkClass}><GithubIcon className="h-[18px] w-[18px]" /></a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={iconLinkClass}><LinkedinIcon className="h-[18px] w-[18px]" /></a>
                <a href={profile.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={iconLinkClass}><InstagramIcon className="h-[18px] w-[18px]" /></a>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] text-text-muted">
              <p className="inline-flex items-center gap-2"><MapPin size={14} aria-hidden="true" /> {profile.location}</p>
              <p className="inline-flex items-center gap-2">
                <Clock size={14} aria-hidden="true" />
                <span>{timezone.time}</span>
                <span className="text-text-subtle">·</span>
                <span>{timezone.label ? timezone.label.split('·')[0].trim() : 'IST'}</span>
              </p>
            </div>
          </Reveal>

          <Reveal className="order-1 mx-auto md:order-2 md:mx-0" delay={0.08} y={10}>
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-3 rounded-full border border-border/50" />
              <div className="h-32 w-32 overflow-hidden rounded-full border border-border bg-surface shadow-md sm:h-40 sm:w-40 md:h-48 md:w-48">
                <img
                  src="/assets/images/profile.webp"
                  alt={`${profile.name} portrait`}
                  className="h-full w-full object-cover object-[center_20%] grayscale transition duration-500 ease-out [@media(hover:hover)]:hover:scale-[1.03] [@media(hover:hover)]:hover:grayscale-0"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <NowPlaying music={music} />
      </Reveal>

      <Section
        eyebrow="About"
        title="A bit about me"
        action={<Link to="/about" className="muted-link focus-ring inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-mono text-[12px]">More about me <ChevronRight size={14} aria-hidden="true" /></Link>}
      >
        <div className="card p-5 sm:p-6">
          <p className="max-w-3xl text-[15px] leading-relaxed text-text-secondary">{about.short}</p>
        </div>
      </Section>

      {experiences.length > 0 && (
        <Section eyebrow="Experience" title="Where I've worked">
          <div className="space-y-3">
            {experiences.map((exp) => (
              <article key={`${exp.company}-${exp.role}`} className="card card-hover flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <a href={exp.url} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-sm font-medium text-text underline-offset-4 hover:underline">{exp.company}</a>
                  <p className="mt-0.5 text-sm text-text-muted">{exp.role}</p>
                </div>
                <div className="font-mono text-[12px] text-text-muted sm:text-right">
                  <p>{exp.period}</p>
                  <p>{exp.location}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section
        eyebrow="Featured"
        title="Projects"
        action={<Link to="/projects" className="muted-link focus-ring inline-flex items-center gap-1 rounded-md px-1 py-0.5 font-mono text-[12px]">All projects <ChevronRight size={14} aria-hidden="true" /></Link>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 0.05}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="GitHub" title="Recent activity">
        <GitHubActivity />
      </Section>

      <Section eyebrow="Skills" title="Tech Stack">
        <div className="space-y-5">
          {techStack.map((group) => (
            <div key={group.label}>
              <p className="mb-2.5 font-mono text-[11px] font-medium tracking-[0.08em] text-text-muted uppercase">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((tech) => (
                  <div
                    key={tech.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/70 px-3 py-2 font-mono text-[11px] text-text-secondary transition-colors duration-150 hover:border-border-hover hover:bg-surface-hover hover:text-text"
                  >
                    <img src={tech.icon} alt="" className="h-3.5 w-3.5 opacity-80" loading="lazy" />
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Contact" title="Let's talk">
        <div className="card p-5 sm:p-6">
          <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
            Have a project, opportunity, or question? I&apos;d love to hear from you.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="btn-primary focus-ring"><Send size={15} /> Email me</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring"><LinkedinIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn-secondary focus-ring"><GithubIcon className="h-4 w-4" /> GitHub</a>
          </div>
        </div>
      </Section>
    </>
  );
}
