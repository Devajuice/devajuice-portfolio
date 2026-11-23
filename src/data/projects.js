export const projects = [
  {
    slug: 'flixet',
    title: 'Flixet',
    description:
      'Streaming platform for movies and TV shows with a modern UI and responsive design.',
    type: 'Personal project',
    href: 'https://flixet.vercel.app',
    repo: '',
    image: '',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'TMDB API'],
    featured: true,
  },
  {
    slug: 'portfolio',
    title: 'Devajith Portfolio',
    description:
      'Responsive personal portfolio with section transitions, live music integration, and interactive UI details.',
    type: 'Personal project',
    href: 'https://github.com/Devajuice/devajuice-portfolio',
    repo: 'https://github.com/Devajuice/devajuice-portfolio',
    image: '',
    tags: ['React', 'Vite', 'Tailwind CSS'],
    featured: true,
  },
  {
    slug: 'better-end-sky',
    title: 'Better End Sky',
    description:
      'Fancy sky renderer for The End dimension from the hit mod Better End by paulevs and BetterX Team in a standalone mod for a client-side only usage.',
    type: 'Personal project',
    href: 'https://github.com/Devajuice/better-end-sky',
    repo: 'https://github.com/Devajuice/better-end-sky',
    image: '',
    tags: ['Java'],
    featured: false,
  },
  {
    slug: 'lines-and-design',
    title: 'Lines & Design',
    description:
      'LinesnDesign is an architectural firm that specializes in excellence in interior design and construction.',
    type: 'Client project',
    href: 'https://linesndesign.com',
    repo: '',
    image: '',
    tags: ['HTML', 'CSS'],
    featured: false,
  },
  {
    slug: 'playlist-tracker',
    title: 'Playlist Tracker',
    description:
      'Track and manage YouTube Music playlists with a clean, intuitive interface.',
    type: 'Personal project',
    href: 'https://github.com/Devajuice/youtube-music-playlist-tracker',
    repo: 'https://github.com/Devajuice/youtube-music-playlist-tracker',
    image: '',
    tags: ['Python'],
    featured: false,
  },
  {
    slug: 'f1-tv',
    title: 'F1 Tv',
    description:
      'F1 Tv is a streaming platform for Formula 1 content with a modern UI and responsive design.',
    type: 'Personal project',
    href: 'https://livef1tv.vercel.app',
    repo: '',
    image: '',
    tags: ['TypeScript', 'HTML', 'CSS'],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
