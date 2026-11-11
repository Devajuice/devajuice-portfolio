import { PROJECTS } from './projects';
import SpotlightCard from './ui/SpotlightCard';
import { ArrowUpRight } from 'lucide-react';

export default function ProjectsSection() {
  return (
    <>
      <h2 id="projects-heading" className="section-heading">
        <i className="fas fa-folder-open" aria-hidden="true" />
        <span>Projects</span>
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <SpotlightCard
            key={p.href}
            as="a"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.title} (opens in a new tab)`}
            className="group/card flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-surface-hover/80 text-text-primary shadow-subtle backdrop-blur-sm transition-colors group-hover/card:bg-surface-raised">
              <i className={`fas ${p.icon} text-base`} aria-hidden="true" />
            </div>

            <h3 className="mb-2 flex items-start justify-between gap-3 text-base font-semibold text-text-primary">
              <span>{p.title}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-hover/60 px-2 py-1 text-[10px] font-medium tracking-wide text-text-subtle uppercase transition-colors group-hover/card:text-text-secondary">
                Open
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </h3>

            <p className="mb-5 flex-1 text-sm leading-relaxed text-text-muted">{p.desc}</p>

            <div className="flex flex-wrap gap-1.5">
              {p.tags.map(([cls, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-hover/70 px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                >
                  <i className={cls} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
