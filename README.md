# Devajith | Developer Portfolio 🌟

A modern, responsive single-page portfolio website featuring a monochrome design system on Tailwind CSS v4, smooth animations, a gooey mobile menu, light/dark theme switching, live Last.fm music integration with full-bleed album art, and interactive easter eggs. Built with React and Vite.

![Website Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## ✨ Features

### 🎨 Design & UX

- **Light/Dark Theme Toggle** — Respects system preference, persists via `localStorage`, and is bootstrapped inline in `index.html` before first paint so there is no flash of the wrong theme. Components that need concrete colours (the WebGL shader, confetti) read it through `useIsDark()`, which mirrors the DOM `.dark` class with a `MutationObserver` and a `matchMedia` listener
- **EasyUI Design System** — Every colour, radius and glass surface is a CSS custom property declared in a Tailwind v4 `@theme` block, so tokens are real utilities (`bg-surface`, `text-muted`) rather than magic strings. Light is the `:root` default and dark overrides under `.dark`
- **Monochrome Design** — Black/white palette with a single green accent reserved for the "live" music state, so colour carries meaning
- **Responsive Design** — Seamlessly adapts to desktop, tablet, and mobile devices
- **Floating Pill Navbar** — Centered glassmorphism pill on desktop with a sliding active-section indicator; the mobile drawer is a gooey menu (see below)
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

- **WebGL Dot Shader Background** — A full-screen `DotShader` canvas behind the content, driven by a `uMouse`/`uTime` uniform pair. It re-reads the theme through `useIsDark()` so the dots invert with light/dark, and pauses when the tab is hidden to save GPU/battery
- **Full-Bleed Album Art** — The About card and the home now-playing pill render the cover as a scaled, blurred, saturated backdrop clipped by the container's own `overflow-hidden` radius. No edge masks: at pill height a gradient mask reads as a blotchy vignette rather than a cover
- **Thin Glass Veil** — The frosted layer over the artwork is 22% surface tint with `blur(10px) saturate(220%)`, enough tint for contrast and enough saturation that the artwork reads as colour rather than a grey wash. The veil inherits its container radius so it cannot show as a hard rectangle where `backdrop-filter` is unsupported
- **Animated Favicon** — Canvas-drawn `</>` logo with an orbiting glow dot that plays for 3 seconds on load then stops to avoid ongoing repaints; colors update automatically with the active theme

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
- **Toast Notifications** — Non-intrusive slide-in toasts for form success, errors, and navigation feedback
- **Social Media Links** — Quick access to LinkedIn, GitHub, and Instagram

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` – `6` | Jump to section |
| `T` | Toggle theme |
| `B` | Back to top |
| `?` | Open/close shortcuts overlay |
| `Esc` | Close overlays / mobile menu |

### ⚡ Performance & Accessibility

- **PWA Ready** — `manifest.json` enables "Add to Home Screen" on Android/iOS with app shortcuts for Projects and Contact
- **Theme Color** — `theme-color` meta tag updates the browser chrome to match your accent color (light and dark variants)
- **Fast Loading** — Vite-bundled output, deferred script loading, preconnect hints for all external origins, and no render-blocking resources
- **SEO Optimised** — Full meta tags, Open Graph (with image dimensions), Twitter Card, canonical URL, JSON-LD structured data (Person schema), and a clean `sitemap.xml`
- **Accessibility** — Skip link, ARIA labels, keyboard navigation, focus traps on overlays (`role="dialog"`), `aria-live` regions for dynamic content, and `aria-hidden` on the mobile nav dropdown when closed so hidden buttons are invisible to screen readers and excluded from the tab order
- **Reduced Motion** — Respects `prefers-reduced-motion` — disables the WebGL background and CSS transitions, and `DotShader` listens for changes at runtime rather than only reading the preference once on mount
- **Tab Visibility** — The background shader and ambient music both pause when the tab is hidden, resuming when you return
- **Deduplicated Init** — Initial section is computed once at module level from `window.location.hash` and shared across all state initialisers, avoiding redundant hash reads
- **Auto Footer Year** — Copyright year updates automatically

## 🎨 Color Theme

Tokens are declared in `src/index.css`. Light is the `:root` default; `.dark` overrides the same custom properties.

### Light Mode (`:root`)

| Token | Value |
|-------|-------|
| `--color-bg` | `#fafafa` |
| `--color-surface` | `#ffffff` |
| `--color-surface-hover` | `#f4f4f5` |
| `--color-border` | `#e4e4e7` |
| `--color-text-primary` | `#0a0a0a` |
| `--color-text-secondary` | `#52525b` |
| `--color-text-muted` | `#71717a` |
| `--color-text-subtle` | `#a1a1aa` |
| `--color-accent` | `#0a0a0a` |
| `--color-live` | `#22c55e` |

### Dark Mode (`.dark`)

| Token | Value |
|-------|-------|
| `--color-bg` | `#111113` |
| `--color-surface` | `#1c1c1f` |
| `--color-surface-hover` | `#202023` |
| `--color-border` | `#29292c` |
| `--color-text-primary` | `#f2f2f3` |
| `--color-text-secondary` | `#a1a1a6` |
| `--color-text-muted` | `#6f6f75` |
| `--color-text-subtle` | `#4d4d52` |
| `--color-accent` | `#f2f2f3` |
| `--color-live` | `#4ade80` |

The accent is intentionally the same as `text-primary` in both themes — the palette is monochrome, and green appears only where it means something (the live now-playing state). `--art-alpha` (`0.85` light / `0.9` dark) controls how far the blurred album art pushes its own colour into the glass surface.

## 📂 Project Structure

```
devajith-portfolio/
├── index.html               # Entry point; bootstraps the theme inline before first paint
├── vite.config.js           # Vite bundling, Tailwind plugin, /api/nowplaying dev middleware
├── vercel.json              # Vercel deployment & 404 routing logic
├── .env.example             # Template for LASTFM_API_KEY (never commit a real .env)
├── api/
│   └── nowplaying.js        # Serverless proxy — keeps the Last.fm key off the client
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
    ├── index.css            # The whole design system: @theme tokens, light/dark, utilities
    ├── components/
    │   ├── AboutSection.jsx     # Timeline, accordion, music card with full-bleed art
    │   ├── ContactSection.jsx   # Contact form + copy-email button
    │   ├── EasterEgg.jsx
    │   ├── ErrorBoundary.jsx    # Per-section failure isolation
    │   ├── Footer.jsx           # 4-column grid: brand, quick links, connect, resources
    │   ├── HomeSection.jsx      # Hero + now-playing pill
    │   ├── HobbiesSection.jsx
    │   ├── KeyboardShortcuts.jsx
    │   ├── Navigation.jsx       # PillNavigation desktop bar + gooey mobile drawer, SECTIONS
    │   ├── ProjectsSection.jsx
    │   ├── projects.jsx         # Project data config — edit here to add/update projects
    │   ├── SkillsSection.jsx
    │   ├── Toast.jsx
    │   ├── ToastContext.js
    │   ├── useToast.js
    │   └── ui/                  # EasyUI primitives
    │       ├── Button.jsx
    │       ├── DotShader.jsx      # WebGL background
    │       ├── Equalizer.jsx
    │       ├── LiveBadge.jsx
    │       ├── MagneticButton.jsx
    │       ├── PillNavigation.jsx # Floating glass pill + sliding indicator
    │       ├── SmoothAccordion.jsx
    │       └── SpotlightCard.jsx
    ├── hooks/
    │   ├── index.js         # useSound, useNowPlaying, useTimezone, useTypewriter
    │   ├── useFocusTrap.js  # Shared focus-trap hook used by overlays
    │   ├── useIsDark.js     # Mirrors the DOM .dark class into React state
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
npm run check              # build + static/SSR render assertions (26 checks)
npm run browser-check      # navigation, section rendering, console/network errors
npm run music-pill-check   # live / no-tracks / failed now-playing states
npm run music-style-check  # artwork visibility, edge coverage, glass, "Live" accent, mobile layout (48 checks)
npm run ui-polish-check    # pill centring, icon alignment, transitions, goo menu geometry (38 checks)
```

The four `.mjs` suites drive a **real browser via `puppeteer-core`** against a running server, so start one first:

```bash
npm run preview            # in one terminal (production build — required for real CSS)
npm run ui-polish-check    # in another
```

Run the browser suites against `preview`, not `dev` — Vite's dev server serves
unprocessed CSS, so token-derived values such as the auto-generated
`-webkit-backdrop-filter` prefix will not match production.

`music-style-check` measures artwork visibility by **screenshotting the region
with and without artwork** and comparing pixels, because asserting that the
backdrop CSS exists says nothing about whether the artwork is actually visible
through the glass tint. It pins the theme via `localStorage` so the light and
dark accent tokens are each verified explicitly.

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
> **Known issue:** `vercel.json` also rewrites `/api/og` and `/api/og.png` to `/api/og.png.js`, but that file does not exist in the repo, so the OG image endpoint 404s. The static `og-image-v2.png` in `public/` is what actually serves. Either add the generator using `@vercel/og` (already a dependency) or drop those two rewrite rules.

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
| **Contact** | Contact form via Web3Forms, copy-email button, and social media links |

## 🛠️ Customization Guide

### Changing Theme Colors

Edit the tokens in the `@theme` block in `src/index.css`, and override them for
dark mode inside the `.dark` block in the same file:

```css
@theme {
  --color-accent: #0a0a0a;
  --color-live: #22c55e;
}

@layer base {
  .dark {
    --color-accent: #f2f2f3;
    --color-live: #4ade80;
  }
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

2. Add its label and icon in the same file. Icons are Font Awesome class names:

   ```js
   export const SECTION_LABELS = { ..., newpage: 'New Page' };
   export const SECTION_ICONS  = { ..., newpage: 'fa-star' };
   ```

   `NAV_ITEMS` is derived from those two maps, so the desktop pill and the gooey
   mobile menu both pick up the new entry automatically.

3. Add a matching `<section>` inside `<main>` in `App.jsx`:

   ```jsx
   <section id="newpage" className={getStateClasses("newpage")} aria-labelledby="newpage-heading">
     <NewPageSection />
   </section>
   ```

4. Add the keyboard shortcut mapping if needed:

   ```js
   const SECTION_KEYS = { ..., 7: "newpage" };
   ```

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

A very pale cover cannot tint a light surface much, so if the art is still washed
out on light theme, the cover itself is the limiting factor, not the veil. Also
check that you are looking at a production build: the `-webkit-backdrop-filter`
prefix is only added by Lightning CSS during `vite build`.

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
