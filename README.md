# Devajith Portfolio

A modern, compact personal portfolio built with React, Vite, and Tailwind CSS. It features a Notion-inspired look, Geist Mono typography, light/dark theme switching, real routes, live Last.fm now-playing, rotating quotes, and a data-driven content structure.

## Features

- **Multi-page routing** — Real routes with React Router: `/`, `/about`, `/projects`.
- **Notion-inspired UI** — Clean, compact layout with subtle grid background, soft surfaces, and Geist Mono.
- **Light/Dark theme** — Theme toggle with persisted preference, early theme bootstrap in `index.html`, and smooth theme transitions.
- **Pill navigation** — EasyUI-style animated pill navigation on desktop, with a responsive mobile menu.
- **Live Now Playing** — Last.fm current/recent track via `/api/nowplaying` proxy (server-side key), with graceful loading/error states.
- **GitHub activity** — Home page section showing recent public repositories from GitHub.
- **Data-driven content** — Profile, about, experience, tech stack, quotes, and projects live in `src/data/`.
- **Future-ready experience section** — Experience renders automatically when entries are added to `src/data/site.js`.
- **Rotating quotes** — Small quote set with animated transitions.
- **Accessibility polish** — Skip link, focus styles, semantic landmarks, labels, and reduced-motion support.
- **Vercel-ready SPA routing** — `vercel.json` rewrites app routes to `index.html`.

## Tech Stack

- [React 18](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Rune Icons](https://www.runeicons.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [react-helmet-async](https://github.com/staylor/react-helmet-async)
- [Last.fm API](https://www.last.fm/api) (proxied server-side)
- [Vercel](https://vercel.com/) for hosting/serverless API

## Project Structure

```text
.
├── api/
│   └── nowplaying.js          # Vercel serverless Last.fm proxy
├── public/
│   └── assets/                # Images, icons, resume, static files
├── src/
│   ├── components/            # UI components (Navbar, Footer, cards, etc.)
│   ├── data/                  # Editable content (site.js, projects.js)
│   ├── hooks/                 # Theme, now playing, timezone hooks
│   ├── lib/                   # Utilities and motion tokens
│   ├── pages/                 # Route pages (Home, About, Projects)
│   ├── utils/                 # Last.fm/audio helpers
│   ├── App.jsx                # Routes/app shell wiring
│   ├── index.css              # Theme tokens and global styles
│   └── main.jsx               # App entry
├── .npmrc                     # legacy-peer-deps for Vercel/npm install
├── index.html
├── vercel.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

> `.npmrc` includes `legacy-peer-deps=true` because `runeicons-react` currently declares a React 19 peer dependency while this project uses React 18.

### Environment variables

Create a `.env` file for local development:

```env
LASTFM_API_KEY=your_lastfm_api_key_here
```

Get a key from [Last.fm API](https://www.last.fm/api/account/create).

Do **not** use `VITE_LASTFM_API_KEY`; Vite would expose `VITE_` variables to the client bundle.

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Editing Content

Most content can be updated in data files:

- **Profile, bio, education, experience, tech stack, quotes, socials**: `src/data/site.js`
- **Projects**: `src/data/projects.js`

### Add experience

Add entries to `experiences` in `src/data/site.js`:

```js
export const experiences = [
  {
    company: 'Company Name',
    url: 'https://example.com',
    role: 'Role',
    period: 'Month Year – Present',
    location: 'Location',
  },
];
```

The Experience section appears automatically when the array has entries.

## Deployment

### Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add `LASTFM_API_KEY` in Vercel Environment Variables.
4. Deploy.

`vercel.json` includes SPA rewrites so `/about` and `/projects` work on refresh/direct load.

## Notes

- The browser calls `/api/nowplaying`; the Last.fm key stays server-side.
- `backup/pre-remake/` contains a local backup from before the remake and is gitignored.
- For GitHub commit attribution, make sure `git config user.name` and `user.email` match your GitHub account and verified email.

## License

[MIT](LICENSE.md)
