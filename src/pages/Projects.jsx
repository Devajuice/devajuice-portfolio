import { Helmet } from 'react-helmet-async';
import { profile } from '../data/site';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import Reveal from '../components/Reveal';

export default function Projects() {
  return (
    <>
      <Helmet>
        <title>Projects | {profile.name}</title>
        <meta name="description" content={`Projects by ${profile.name} — web apps, tools, and experiments.`} />
      </Helmet>

      <Reveal className="max-w-3xl">
        <p className="section-label">Projects</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Things I&apos;ve built</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
          A collection of projects I&apos;ve worked on, from personal experiments to client work.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.04}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
