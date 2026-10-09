# Devajith | Developer Portfolio 🌟

A modern, responsive single-page portfolio website featuring a monochrome design system on Tailwind CSS v4, smooth animations, a gooey mobile menu, live Last.fm music integration with full-bleed album art, a playground of self-contained browser toys, and interactive easter eggs. Built with React and Vite.

![Website Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## ✨ Features

### 🎨 Design & UX

- **Dark-Only Theme** — One palette, declared once, with no toggle and no flash-of-wrong-theme script: `index.html` paints `#111113` before React mounts and `color-scheme: dark` makes native UI (scrollbars, form controls, autofill) match. Anything needing a literal colour (WebGL shader, canvas confetti, animated favicon) hardcodes the dark value rather than branching at runtime
- **EasyUI Design System** — Every colour, radius and glass surface is a CSS custom property declared in a Tailwind v4 `@theme` block, so tokens are real utilities (`bg-surface`, `text-muted`) rather than magic strings. `public/404.css` hand-mirrors the same tokens for the static 404 page
- **Monochrome Design** — Black/white palette with a single green accent reserved for the "live" music state, so colour carries meaning
- **Responsive Design** — Seamlessly adapts to desktop, tablet, and mobile devices
- **Floating Pill Navbar** — Centered glassmorphism pill on desktop with a sliding active-section indicator; the mobile drawer is a gooey menu (see below). With seven sections the pill breaks at `lg` rather than `md`, and its tablist scrolls horizontally as a backstop so a tab can never clip
- **DM Sans Typography** — Modern, clean font used across the entire site
- **Per-Section Error Boundary** — A failure in any section degrades that section only, instead of blanking the whole page
- **Site Footer** — 4-column grid layout (Brand, Quick Links, Connect, Resources) with tagline, tech stack chips, navigation links, email contact, resume download, social icon links, and keyboard shortcuts hint; responsive 4→2→1 column grid on mobile
- **Custom 404 Page** — Styled error page matching the portfolio design with glitch animation, served via Vercel routing
- **Locale-Aware Timezone Display** — Hero section shows the current IST time and how far ahead/behind it is from the visitor's local timezone, updating every 30 seconds
- **No-JS Fallback** — A `<noscript>` banner informs users if JavaScript is disabled and reveals the home section statically

### 🎭 Animations & Interactions

- **Smooth Page Transitions** — Sections fade and slide in the correct direction (forward or backward) before the next one fades in, with a locked transition state to prevent glitches
- **Browser Back/Forward Support** — `hashchange` listener keeps the active section in sync with the browser's navigation history so the back and forward buttons work correctly
- **Staggered Content Animations** — Cards, headings, and text elements cascade in with a delay when a section becomes active
- **Typewriter Effect** — Hero subtitle cycles through "Student", "Developer", and "Gamer" with a blinking accent cursor
- **Navbar Entrance** — Navigation pill springs down into view on page load
- **Gooey Mobile Menu** — The mobile drawer melts open via an SVG `feGaussianBlur` + alpha-contrast `feColorMatrix` filter. Because a goo filter collapses its subtree to a single flat colour, the menu is two aligned layers: a filtered one-colour blob layer with an invisible copy of each row's text and icon for sizing, and the real text on an unfiltered layer above it. The panel is `position: relative` so the blob layer's `inset: 0` anchors to it instead of escaping to the fixed header
- **Hover Effects** — Interactive lift animations on cards, nav items, and buttons
- **Magnetic Buttons** — Hero CTA buttons subtly follow the cursor on hover; reattached automatically on each section change without a MutationObserver
- **Shared Motion Tokens** — Springs and easings come from `src/lib/motion-tokens.js` so every transition in the site shares one timing vocabulary instead of per-component curves
- **Mobile Swipe Gestures** — Swipe left/right on touch devices to navigate between sections, with a live edge hint pill showing the destination

### 🌌 Visual Effects

- **WebGL Dot Shader Background** — A full-screen `DotShader` canvas behind the content, driven by a `uMouse`/`uTime` uniform pair, with light-on-dark dots so they stay visible against the dark surface. Pauses when the tab is hidden to save GPU/battery
- **Full-Bleed Album Art** — The About card and the home now-playing pill render the cover as a scaled, blurred, saturated backdrop clipped by the container's own `overflow-hidden` radius. No edge masks: at pill height a gradient mask reads as a blotchy vignette rather than a cover
- **Thin Glass Veil** — The frosted layer over the artwork is 22% surface tint with `blur(10px) saturate(220%)`, enough tint for contrast and enough saturation that the artwork reads as colour rather than a grey wash. The veil inherits its container radius so it cannot show as a hard rectangle where `backdrop-filter` is unsupported
- **Animated Favicon** — Canvas-drawn `</>` logo with an orbiting glow dot that plays for 3 seconds on load then stops to avoid ongoing repaints; drawn light-on-dark to match the site

### 🐣 Easter Eggs

- **Konami Code** — Type ↑ ↑ ↓ ↓ ← → ← → B A to trigger an achievement-style popup with confetti rain and a +30 Gamer Points badge

### 🎵 Music Integration

- **Live Now-Playing Pill** — Hero section displays a loading skeleton while data is fetching, then shows a green pill with animated equalizer bars when actively scrobbling, or grey when showing the last played track
- **Last.fm API** — Track name, artist, and album fetched in real-time from Last.fm. The browser never calls Last.fm directly: `src/utils/lastfm.js` requests `/api/nowplaying`, served by `api/nowplaying.js` in production and by a Vite middleware in dev and preview, so the API key stays server-side
- **Graceful Degradation** — With no key or an unreachable API the pill renders *Unavailable* instead of breaking the hero layout
- **iTunes Cover Art** — Album artwork fetched from the iTunes Search API (CORS-friendly, no key required) at up to 3000×3000 resolution, with Last.fm image as fallback
- **Smart Art Caching** — Bounded in-memory cache (max 100 entries, oldest evicted first) so iTunes is only called when the artist/album changes; repeated polls reuse cached art
- **Parallel Fetching** — `track.getInfo` and iTunes cover art lookups fire in parallel using `Promise.allSettled`, not sequentially
- **Animated Equalizer Bars** — 4 bars animate when live, sit flat when idle — appear in both the hero pill and the About section music widget
- **Live/Recent Badge** — About section shows a green "Live" or grey "Recent" badge next to the track name
- **Auto-Refresh** — Updates every 30 seconds (live tracks) or 120 seconds (last played)
- **Background Ambient Music** — Optional procedurally generated ambient piano music using the Web Audio API, with a look-ahead scheduler. Pauses automatically when the tab is hidden

### 📬 Contact Features

- **Functional Contact Form** — Web3Forms integration with honeypot spam protection (no backend needed)
- **Double-Submit Guard** — A `ref`-based guard prevents concurrent or accidental duplicate submissions
- **Form Validation** — Client-side validation for all fields including email format check
- **Copy Email Button** — One-click button copies your email address to the clipboard with a success toast, alongside the social links
- **Toast Notifications** — Non-intrusive slide-in toasts for form success, errors, and navigation feedback; renders through a stacked notification pile so rapid-fire messages never overlap
- **World Clock** — Airport-board split-flap clock in the footer showing the local time in Dubai, London, and Tokyo, with a scrolling glyph animation that honours `prefers-reduced-motion`
- **Social Media Links** — Quick access to LinkedIn, GitHub, and Instagram

### 🎛️ Playground

A grab-bag page for self-contained toys, reachable at `/#playground`. Everything runs locally —
no network requests, no accounts, nothing persisted beyond the clock's city list.

- **Editable World Clock** — The footer's split-flap clock with its city editor switched on. Pick up to five of the 32 available cities and the selection is written to `localStorage`, so it survives reloads. Corrupt or stale stored values fall back to the default three instead of breaking the page
- **Step Sequencer** — A 16-step, 4-voice drum machine (kick, hat, clap, bass) with three tempos, randomize, and clear. It shares the module-level `AudioContext` from `src/utils/audio.js` rather than opening its own, and uses the standard look-ahead scheduler — notes are placed against `ctx.currentTime` while a coarse 25ms timer only refills the queue, so the rhythm does not jitter when a tick lands late
- **Random Toys** — Dice (1–4d6), coin flip, a weekend-project picker, and a decision maker with twelve grouped verdicts (yes / do-something-smaller / no) rather than a yes-no coin flip, so it can express the actually-useful middle answer. Consecutive asks never repeat

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` – `7` | Jump to section (in `SECTIONS` order) |
| `B` | Back to top |
| `?` | Open/close shortcuts overlay |
| `Esc` | Close overlays / mobile menu |

The number keys and the overlay's key list are both derived from `SECTIONS`, so adding a section
extends them automatically instead of leaving a gap that silently shifts the later shortcuts.

### ⚡ Performance & Accessibility

- **PWA Ready** — `manifest.json` enables "Add to Home Screen" on Android/iOS with app shortcuts for Projects and Contact
- **Theme Color** — a single `theme-color` meta tag sets the browser chrome to the site's background; `color-scheme: dark` is declared so form controls and scrollbars render dark too
- **Fast Loading** — Vite-bundled output, deferred script loading, preconnect hints for all external origins, and no render-blocking resources
- **SEO Optimised** — Full meta tags, Open Graph (with image dimensions), Twitter Card, canonical URL, JSON-LD structured data (Person schema), and a clean `sitemap.xml`
- **Accessibility** — Skip link, ARIA labels, keyboard navigation, focus traps on overlays (`role="dialog"`), `aria-live` regions for dynamic content, and `aria-hidden` on the mobile nav dropdown when closed so hidden buttons are invisible to screen readers and excluded from the tab order
- **Reduced Motion** — Respects `prefers-reduced-motion` — disables the WebGL background and CSS transitions, and `DotShader` listens for changes at runtime rather than only reading the preference once on mount
- **Tab Visibility** — The background shader and ambient music both pause when the tab is hidden, resuming when you return
- **Deduplicated Init** — Initial section is computed once at module level from `window.location.hash` and shared across all state initialisers, avoiding redundant hash reads
- **Auto Footer Year** — Copyright year updates automatically

## 🎨 Color Theme

Dark only. Every token is declared once in the `@theme` block in `src/index.css` —
there is no light variant and no `.dark` class to toggle. `public/404.css` mirrors
the same set by hand, so keep the two in sync.

| Token | Value |
|-------|-------|
| `--color-bg` | `#111113` |
| `--color-surface` | `#1c1c1f` |
| `--color-surface-hover` | `#202023` |
| `--color-surface-raised` | `#18181a` |
| `--color-border` | `#29292c` |
| `--color-border-hover` | `#343438` |
| `--color-text-primary` | `#f2f2f3` |
| `--color-text-secondary` | `#a1a1a6` |
| `--color-text-muted` | `#6f6f75` |
| `--color-text-subtle` | `#4d4d52` |
| `--color-accent` | `#f2f2f3` |
| `--color-live` | `#4ade80` |

The accent is intentionally the same as `text-primary` — the palette is monochrome,
and green appears only where it means something (the live now-playing state).
`--art-alpha` (`0.9`) controls how far the blurred album art pushes its own colour
into the glass surface.

Because the theme can no longer change at runtime, anything that needs a literal
colour (the WebGL shader, canvas confetti, the animated favicon) hardcodes the dark
value directly instead of branching on a hook.

## 📂 Project Structure

```
devajith-portfolio/
├── index.html               # Entry point; carries the pre-paint dark background
├── vite.config.js           # Vite bundling, Tailwind plugin, /api/nowplaying dev middleware
├── vercel.json              # Vercel deployment & 404 routing logic
├── .env.example             # Template for LASTFM_API_KEY (never commit a real .env)
├── api/
│   ├── nowplaying.js        # Serverless proxy — keeps the Last.fm key off the client
│   ├── og.png.js            # Edge OG route — explains the missing generator / redirects to static
│   └── _lib/
│       └── error-page.js    # Shared HTML error page for API routes (browser vs JSON)
├── public/                  # Static assets & standalone pages
│   ├── 404.html             # Custom error page
│   ├── 404.css              # Error page styles (hand-written; not part of the token layer)
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                 # Verification harness (see "Verification scripts")
│   ├── render-check.jsx     # Static/SSR render assertions run by `npm run check`
│   ├── browser-check.mjs    # Navigation, section rendering, console/network errors
│   ├── ui-polish-check.mjs  # Pill centring, icon alignment, transitions, goo menu geometry
│   ├── music-pill-check.mjs # Live / no-tracks / failed now-playing states
│   ├── music-style-check.mjs# Artwork visibility + edge coverage, glass, live accent, layout
│   └── lib/png.mjs          # Dependency-free PNG decode → mean colour / colour distance
└── src/
    ├── main.jsx             # React DOM mounting
    ├── App.jsx              # Section state, swipe gestures, hashchange, DotShader mount
    ├── index.css            # The whole design system: @theme tokens, keyframes, utilities
    ├── components/
    │   ├── AboutSection.jsx     # Timeline, accordion, music card with full-bleed art
    │   ├── ContactSection.jsx   # Contact form + copy-email button
    │   ├── EasterEgg.jsx
    │   ├── ErrorBoundary.jsx    # Per-section failure isolation
    │   ├── Footer.jsx           # 4-column grid + world clock
    │   ├── HomeSection.jsx      # Hero + now-playing pill
    │   ├── HobbiesSection.jsx
    │   ├── KeyboardShortcuts.jsx
    │   ├── Navigation.jsx       # PillNavigation desktop bar + gooey mobile drawer, SECTIONS
    │   ├── PlaygroundSection.jsx # Accordion shell for the self-contained toys
    │   ├── playground/
    │   │   ├── WorldClockToy.jsx # Editable clock + localStorage city persistence
    │   │   ├── SequencerToy.jsx  # 16-step Web Audio drum machine
    │   │   └── RandomToys.jsx    # Dice, coin flip, project ideas, decision maker
    │   ├── ProjectsSection.jsx
    │   ├── projects.jsx         # Project data config — edit here to add/update projects
    │   ├── SkillsSection.jsx
    │   ├── Toast.jsx             # Provider; renders NotificationStack
    │   ├── ToastContext.js
    │   ├── useToast.js
    │   └── ui/                  # EasyUI primitives
    │       ├── AirportMatrixClock.jsx # Split-flap world clock (footer + playground)
    │       ├── Button.jsx
    │       ├── DotShader.jsx      # WebGL background
    │       ├── Equalizer.jsx
    │       ├── LiveBadge.jsx
    │       ├── MagneticButton.jsx
    │       ├── NotificationStack.jsx # Stacked, drag-to-dismiss pile
    │       ├── PillNavigation.jsx # Floating glass pill + sliding indicator
    │       ├── SmoothAccordion.jsx
    │       └── SpotlightCard.jsx
    ├── hooks/
    │   ├── index.js         # useSound, useNowPlaying, useTimezone, useTypewriter
    │   ├── useFocusTrap.js  # Shared focus-trap hook used by overlays
    │   └── useOgImage.js    # OG image URL builder
    ├── lib/
    │   ├── motion-tokens.js # Shared springs and easings
    │   └── utils.js         # `cn()` class-name merge helper
    └── utils/
        ├── audio.js         # Audio engine & ambient music controller
        └── lastfm.js        # Calls /api/nowplaying + iTunes cover art fetching
```

> **Note:** The browser favicon is generated at runtime via a JavaScript canvas animation that runs for 3 seconds on load — no static `favicon.ico` is required. `manifest.json` must stay at the root so browsers and PWA installers can find it automatically.

> **Note:** `public/404.html` is a standalone page served directly by the host, outside the React app, so it keeps its own hand-written `public/404.css` rather than importing the token layer.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm (Vite 5 requires `^18.0.0 || >=20.0.0`)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control
- Last.fm account (for music widget)
- Web3Forms account (for contact form)

### Verification scripts

```bash
npm run lint               # ESLint over src
npm run check              # build + static/SSR render assertions (35 checks)
npm run browser-check      # navigation, section rendering, console/network errors
npm run music-pill-check   # live / no-tracks / failed now-playing states
npm run music-style-check  # artwork visibility, edge coverage, glass, "Live" accent, mobile layout (45 checks)
npm run ui-polish-check    # pill centring, icon alignment, transitions, goo menu geometry (38 checks)
```

The four `.mjs` suites drive a **real browser via `puppeteer-core`** against a running server, so start one first:

```bash
npm run preview            # in one terminal (production build — required for real CSS)
npm run ui-polish-check    # in another
```

Run the browser suites against `preview`, not `dev` — Vite's dev server serves
unprocessed CSS, so token-derived values such as the auto-generated
`-webkit-backdrop-filter` prefix will not match production. All four default to
`http://127.0.0.1:4173` for that reason; set `BASE_URL` to point them elsewhere.

`music-style-check` measures artwork visibility by **screenshotting the region
with and without artwork** and comparing pixels, because asserting that the
backdrop CSS exists says nothing about whether the artwork is actually visible
through the glass tint. It also asserts that the dark palette is the one actually
resolved, since the site is dark-only and nothing toggles it at runtime.

`ui-polish-check` measures the goo menu geometrically: it compares each blob's
bounding box against the corresponding text row and fails if they drift in
either axis. It waits for the now-playing pill to reach a settled state rather
than sleeping, so it does not measure the skeleton.

> The suites launch **Firefox** through `puppeteer-core`, currently hardcoded to
> `/Applications/Firefox.app/Contents/MacOS/firefox` on macOS. On another
> platform or install location, change the `FIREFOX` constant at the top of each
> `.mjs` script. They default to `BASE_URL=http://127.0.0.1:4173`, which is the
> address `npm run preview` serves.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/devajuice/devajuice-portfolio.git
   cd devajuice-portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example file and add your Last.fm API key (get one at
   <https://www.last.fm/api/account/create>):

   ```bash
   cp .env.example .env
   ```

   ```env
   LASTFM_API_KEY=your_lastfm_api_key_here
   ```

   > Use the plain name `LASTFM_API_KEY` — **not** `VITE_LASTFM_API_KEY`.
   > Vite inlines any `VITE_`-prefixed variable into the client bundle at build
   > time, which would publish your key in the shipped JavaScript. The
   > unprefixed name stays server-side.
   >
   > `npm run dev` and `npm run preview` serve `/api/nowplaying` from a Vite
   > middleware; production uses the `api/nowplaying.js` function. The key is
   > read in all three cases and never reaches the browser. If it is missing,
   > the endpoint returns a 500 explaining what to set, the terminal prints the
   > same message, and the pill shows *Unavailable* rather than breaking.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

6. **Customize your information**

   In `src/App.jsx`:
   - Update your name in the hero section and OG meta tags

   In `src/hooks/index.js`:
   - Update `MY_TZ` and `MY_TZ_SHORT` if you're not in `Asia/Kolkata`
   - Update the typewriter `words` array in `useTypewriter`

   In `src/components/projects.jsx`:
   - Add or edit your project entries — no JSX changes needed

   In `src/components/ContactSection.jsx`:
   - Replace the `access_key` value with your Web3Forms key
   - Replace the placeholder email in `handleCopyEmail` with your real address

7. **Get API Keys**

   **Last.fm API (Free):**
   - Visit [last.fm/api/account/create](https://www.last.fm/api/account/create)
   - Create an application and copy your API key into `.env`

   **Web3Forms (Free):**
   - Visit [web3forms.com](https://web3forms.com/)
   - Enter your email to get an access key

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → **Import Git Repository**
4. Select your repository, add `LASTFM_API_KEY` under **Environment Variables** and click **Deploy**
5. Your site will be live at `your-project.vercel.app`

> The included `vercel.json` handles routing so unknown URLs correctly show the 404 page instead of a blank Vercel error. The `/api/nowplaying` serverless function proxies Last.fm requests so the API key is never exposed in the browser bundle.
>
> **OG images:** `vercel.json` rewrites `/api/og` and `/api/og.png` to `api/og.png.js`. There is no dynamic `@vercel/og` generator in the repo, so that function explains the situation instead of falling through to Vercel's generic error: a browser opening the URL gets a readable page naming the missing generator, while link-preview scrapers are redirected to the static `og-image-v2.png` in `public/`. To serve generated cards, re-add a `@vercel/og` handler at `api/og.png.js` (the dependency is already installed).

### Deploy to Netlify

1. Run `npm run build` and drag the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments on push
3. Add `LASTFM_API_KEY` under **Site settings → Environment variables** (read by the `/api/nowplaying` function; the static build itself needs no key)

> Note: The `/api/nowplaying` function is Vercel-specific. On Netlify, recreate it as a Netlify Function pointing at the same Last.fm endpoint. Do not fall back to calling Last.fm from the browser — that exposes your API key.

### Deploy to GitHub Pages

1. Run `npm run build`
2. Push the `dist/` folder contents to your `gh-pages` branch
3. Your site will be live at `username.github.io/repository-name`

> Note: `vercel.json` has no effect on GitHub Pages. To handle 404s there, copy `404.html` to the root — GitHub Pages serves it automatically for unmatched routes.

## 📱 Sections

| Section | Description |
|---------|-------------|
| **Home** | Hero with typewriter subtitle, locale-aware timezone display, CTA buttons, and live Last.fm now-playing pill |
| **About** | Personal bio, education timeline, and currently listening music widget with album art and live badge |
| **Projects** | Clickable project cards — data lives in `src/components/projects.jsx` |
| **Skills** | Animated progress bars for programming languages, frameworks & tools, and data science technologies. Bars re-animate every time the section is visited |
| **Hobbies** | Gaming, music, and tech exploration |
| **Playground** | Self-contained toys: the editable world clock (picks persist to `localStorage`), a 16-step Web Audio sequencer, and random toys (dice, coin flip, project ideas, decision maker). Nothing here makes a network request |
| **Contact** | Contact form via Web3Forms, copy-email button, and social media links |

### Adding a new section

There is no router — `SECTIONS` in `src/components/Navigation.jsx` is the single source of
truth, and a "page" is just an entry in it. Adding one wires up the desktop pill, the mobile
drawer, the footer quick-links, the `?` shortcuts modal, arrow-key navigation, hash deep-linking
(`/#playground`), and the entrance animations at once.

1. Add the id to `SECTIONS`, plus `SECTION_LABELS` and `SECTION_ICONS` entries.
2. `lazy()` the component in `App.jsx` and render a `<section id="…" className={getStateClasses('…')}>`.
3. `npm run render-check` asserts these three lists agree — a section listed in `SECTIONS` but
   missing from `App.jsx` renders a nav item that navigates nowhere, with no error otherwise.

With seven tabs the desktop pill no longer fits an 768px row, so it (and the burger that
replaces it) breaks at `lg` rather than `md`. The tablist also scrolls horizontally as a
backstop, and tabs are `whitespace-nowrap` so labels can't wrap onto two lines.

## 🛠️ Customization Guide

### Changing Theme Colors

Edit the tokens in the `@theme` block in `src/index.css`, and mirror any change into
the `:root` block in `public/404.css` (the static 404 page cannot reach the SPA's
Tailwind bundle):

```css
@theme {
  --color-accent: #f2f2f3;
  --color-live: #4ade80;
}
```

Anything declared in `@theme` becomes a Tailwind utility automatically — adding
`--color-brand: #7c3aed` makes `bg-brand`, `text-brand`, `border-brand` and so on
available with no extra configuration. `src/components/ui/` and the `cn()` helper
in `src/lib/utils.js` are the intended way to apply class names, since `cn()`
merges conflicting Tailwind classes instead of letting both win.

### Changing Your Timezone

Find the timezone constants in `src/hooks/index.js`:

```js
const MY_TZ = "Asia/Kolkata";
const MY_TZ_SHORT = "IST";
```

Replace with your own IANA timezone string (e.g. `"America/New_York"`, `"Europe/London"`).

### Changing the Typewriter Words

Find `useTypewriter` in `src/hooks/index.js`:

```js
export function useTypewriter(words = ['Student', 'Developer', 'Gamer'])
```

Pass different words when calling it in `HomeSection.jsx`:

```jsx
const typewriterText = useTypewriter(['Designer', 'Builder', 'Creator']);
```

### Tuning the Swipe Sensitivity

Find these constants inside the swipe `useEffect` in `src/App.jsx`:

```js
const MIN_X = 55;   // minimum horizontal pixels required
const MAX_Y = 80;   // maximum vertical drift before swipe is ignored
const MIN_V = 0.3;  // minimum speed (px/ms) to count as intentional
```

### Adjusting the Background Shader

The background is a WebGL dot shader, not a particle canvas. Tune density, speed
and dot appearance with the props passed to `DotShader` in `src/App.jsx`:

```jsx
<DotShader />
```

The shader's speed, radius and color uniforms live in
`src/components/ui/DotShader.jsx`. For a much cheaper background on low-end
devices, gate the component on a media query or a `prefers-reduced-motion`
check before rendering it at all.

### Adding a Project

Open `src/components/projects.jsx` and add an entry to the `PROJECTS` array:

```js
{
  href: 'https://your-project.com',
  icon: 'fa-code',
  title: 'Your Project',
  desc: 'Short description of what it does.',
  tags: [['fab fa-react', 'React'], ['fab fa-js', 'JavaScript']],
},
```

No JSX changes needed — `ProjectsSection.jsx` renders the array automatically.

### Adding a Navigation Section

1. Add your section to the `SECTIONS` array in `src/components/Navigation.jsx`
   (it is exported from there, and `App.jsx` imports it):

   ```js
   export const SECTIONS = ['home', 'about', 'projects', 'skills', 'hobbies', 'newpage', 'contact'];
   ```

   Position in this array *is* the keyboard-shortcut number and the
   left/right swipe order, so insert rather than append if the new page belongs
   mid-flow.

2. Add its label and icon in the same file. Icons are Font Awesome class names:

   ```js
   export const SECTION_LABELS = { ..., newpage: 'New Page' };
   export const SECTION_ICONS  = { ..., newpage: 'fa-star' };
   ```

   `NAV_ITEMS` is derived from those two maps, so the desktop pill and the gooey
   mobile menu both pick up the new entry automatically.

3. `lazy()` the component at the top of `App.jsx` alongside the other sections,
   then add a matching `<section>` inside `<main>`:

   ```jsx
   const NewPageSection = lazy(() => import('./components/NewPageSection'));
   ```

   ```jsx
   <ErrorBoundary>
     <section id="newpage" className={getStateClasses('newpage')} aria-labelledby="newpage-heading">
       <NewPageSection />
     </section>
   </ErrorBoundary>
   ```

   Steps 1–3 are the whole job. The `1`–`7` shortcuts, the `?` overlay's key list,
   and the arrow-key/swipe order all read from `SECTIONS`, so they extend
   automatically.

4. Run `npm run check`. A `PlaygroundSection`-style render check is worth adding,
   and there is a standing assertion that every id in `SECTIONS` has a matching
   `<section>` in `App.jsx` plus `SECTION_LABELS`/`SECTION_ICONS` entries —
   without it, a step-3 omission renders a nav item that navigates nowhere and
   raises no error anywhere.

### Updating the Copy-Email Address

Find `handleCopyEmail` in `src/components/ContactSection.jsx`:

```js
navigator.clipboard.writeText("devajith@example.com")
```

Replace the string with your real email address.

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| React 18 | Component-based UI and state management |
| Vite 5 | Dev server, bundling, Tailwind plugin, dev API middleware |
| Tailwind CSS v4 | Utility styling on a CSS-variable token layer (`@theme`) |
| `@tailwindcss/vite` | Tailwind integration without PostCSS or a config file |
| framer-motion | Section transitions and the gooey mobile menu |
| lucide-react | Icons in the new UI primitives |
| Font Awesome | Icons via CDN, still used in several sections |
| `clsx` + `tailwind-merge` | `cn()` class merging in `src/lib/utils.js` |
| CSS custom properties | Design tokens shared by utilities, canvas and WebGL |
| SVG filters | `feGaussianBlur` + alpha-contrast matrix behind the goo menu |
| WebGL | `DotShader` background |
| Web Audio API | Procedurally generated ambient background music |
| Canvas API | Animated favicon + confetti |
| Intl API | Locale-aware timezone comparison |
| Clipboard API | One-click copy-email button in Contact section |
| Last.fm API | Music metadata (track, artist, album), proxied server-side |
| iTunes Search API | Album cover art (CORS-friendly, no key required) |
| Google Fonts (DM Sans) | Typography |
| Web3Forms | Contact form backend |
| react-helmet-async | Dynamic `<head>` / OG meta tag management |
| `@vercel/og` | OG image generation |
| Vercel | Hosting, routing, and serverless API proxy |
| `puppeteer-core` + `vite-node` | Test harness driving a real browser / SSR render |

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

> The animated favicon and confetti use the HTML5 Canvas API. The background uses WebGL via `DotShader`, which falls back to a 2D-canvas dot grid if WebGL is unavailable. The ambient music uses the Web Audio API, available in all evergreen browsers. The timezone display uses `Intl.DateTimeFormat`, universally supported. The copy-email button uses the Clipboard API, available in all modern browsers over HTTPS.
>
> `backdrop-filter` is what produces the glass surfaces. Safari needs the `-webkit-` prefix, which Lightning CSS adds automatically during the build — **do not hand-write both forms**, as declaring the prefixed version first makes the minifier drop the unprefixed one and Firefox loses the effect entirely.

## 🩺 Troubleshooting

### `can't access property 'useState', dispatcher is null`

This is not an application bug — it means **two copies of React** were loaded in
the browser. Vite pre-bundles dependencies into `node_modules/.vite`, and if that
cache is regenerated mid-session (typically after `npm install` while `npm run dev`
is still running) the browser can end up holding modules from two different
generations.

Fix it by restarting the dev server with a clean cache:

```bash
# stop the running dev server first (Ctrl+C), then:
npm run dev:clean
```

A hard reload (`Cmd+Shift+R`) also helps if the browser cached the old modules.
If you keep hitting this after changing dependencies, make sure the dev server is
restarted after each `npm install` rather than left running.

### Now-playing pill shows "Unavailable"

The `/api/nowplaying` endpoint could not reach Last.fm. Check the dev server
output — it prints the reason. The usual cause is a missing key: see
[Set up environment variables](#installation).

### Album art looks like a grey wash

The glass tint over the artwork is deliberately thin — raising it trades away
colour. Two dials in `src/index.css`:

- `--art-alpha` (0.85 light, 0.9 dark) — how far the artwork pushes its own colour into the glass
- the `glass-art` utility — the `22%` tint in `color-mix()` and the `saturate(220%)` in its `backdrop-filter`

A very pale cover cannot tint the dark surface much, so if the art is still washed
out, the cover itself is the limiting factor, not the veil. Also check that you
are looking at a production build: the `-webkit-backdrop-filter` prefix is only
added by Lightning CSS during `vite build`.

### Glass surfaces are flat and unblurred in one browser only

That is the classic `backdrop-filter` prefix trap. Writing both
`-webkit-backdrop-filter` and `backdrop-filter` by hand makes the minifier drop
the unprefixed declaration, which breaks Firefox while Safari keeps working.
Declare only the unprefixed property and let the build add the prefix.

## 📄 License

This project is open source and available under the [MIT License](LICENSE.md).

## 🙏 Acknowledgments

- **lucide-react** and **Font Awesome** — Icons
- **Google Fonts** — DM Sans font family
- **Last.fm** — Music scrobbling API
- **iTunes Search API** — Album cover artwork
- **Web3Forms** — Contact form backend
- **Vercel** — Hosting platform

## 📞 Contact

- **LinkedIn:** [Devajith Jijush](https://www.linkedin.com/in/devajith-jijush-5741ab39b/)
- **GitHub:** [@Devajuice](https://github.com/devajuice)
- **Instagram:** [@Devajuice](https://instagram.com/devajuice)
- **Website:** [devajuice.com](https://devajuice.com)

---

Made with ❤️ by [Devajuice](https://devajuice.com)

⭐ Star this repo if you found it helpful!
