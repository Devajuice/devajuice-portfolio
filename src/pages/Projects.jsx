import { Helmet } from 'react-helmet-async';
import { profile } from '../data/site';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  return (
    <>
      <Helmet>
        <title>Projects | {profile.name}</title>
        <meta name="description" content={`Projects by ${profile.name} — web apps, tools, and experiments.`} />
      </Helmet>

      <div className="reveal max-w-3xl">
        <p className="section-label">Projects</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Things I&apos;ve built</h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted sm:text-base">
          A collection of projects I&apos;ve worked on, from personal experiments to client work.
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </>
  );
}
