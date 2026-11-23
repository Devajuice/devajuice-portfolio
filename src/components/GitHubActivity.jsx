import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'runeicons-react';
import { profile } from '../data/site';

export default function GitHubActivity() {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.github.com/users/devajuice/repos?sort=updated&per_page=4&type=owner')
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRepos(Array.isArray(data) ? data.filter((r) => !r.fork).slice(0, 4) : []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-muted">Recent GitHub repositories</p>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="muted-link inline-flex items-center gap-1 text-sm">
          View profile <ArrowUpRight size={16} />
        </a>
      </div>

      {status === 'loading' && <p className="mt-4 text-sm text-text-muted">Loading repositories...</p>}
      {status === 'error' && <p className="mt-4 text-sm text-text-muted">Could not load GitHub activity right now.</p>}
      {status === 'ready' && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-lg border border-border bg-surface-hover/40 p-3 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-medium text-text">{repo.name}</p>
                <ArrowUpRight size={14} />
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">{repo.description || 'No description'}</p>
              <p className="mt-2 text-[11px] text-text-subtle">{repo.language || 'Repository'}{repo.stargazers_count ? ` · ★ ${repo.stargazers_count}` : ''}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
