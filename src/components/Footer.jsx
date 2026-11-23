import { Mail } from 'runeicons-react';
import { profile } from '../data/site';
import Quote from './Quote';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './BrandIcons';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/70 bg-bg/60">
      <div className="container-page py-8 sm:py-10">
        <Quote />
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm text-text-muted sm:flex-row">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} {profile.name}. Built with care.</p>
          <div className="flex items-center gap-1.5">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><GithubIcon className="h-4 w-4" /></a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><LinkedinIcon className="h-4 w-4" /></a>
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><InstagramIcon className="h-4 w-4" /></a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className="focus-ring muted-link rounded-md p-2 hover:bg-surface-hover"><Mail size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
