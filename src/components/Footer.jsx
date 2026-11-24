import { Mail } from 'runeicons-react';
import { profile } from '../data/site';
import Quote from './Quote';
import { GithubIcon, LinkedinIcon, InstagramIcon } from './BrandIcons';

const socialLinkClass = 'focus-ring muted-link inline-flex rounded-lg p-2.5 transition-colors hover:bg-surface-hover';

export default function Footer() {
  return (
    <footer className="relative border-t border-border/70">
      <div className="container-page py-10 sm:py-12">
        <Quote />
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-[12px] text-text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with care.
          </p>
          <div className="flex items-center gap-1">
            <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={socialLinkClass}><GithubIcon className="h-[18px] w-[18px]" /></a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialLinkClass}><LinkedinIcon className="h-[18px] w-[18px]" /></a>
            <a href={profile.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialLinkClass}><InstagramIcon className="h-[18px] w-[18px]" /></a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className={socialLinkClass}><Mail size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
