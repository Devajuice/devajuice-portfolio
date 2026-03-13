# Devajith | Developer Portfolio 🌟

A modern, responsive single-page portfolio website featuring a clean monochrome design, smooth animations, glass-effect navigation, light/dark theme switching, dynamic music integration, particle constellation background, and interactive easter eggs. Built with React and Vite.

![Website Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

## ✨ Features

### 🎨 Design & UX

- **Light/Dark Theme Toggle** — Smooth ink-blot theme switching with a spinning icon animation, respects system preference and persists via `localStorage`. Also updates the browser chrome color via `theme-color` meta tag
- **Monochrome Design** — Clean black/white palette with a blue accent color
- **Responsive Design** — Seamlessly adapts to desktop, tablet, and mobile devices
- **Floating Pill Navbar** — Centered glassmorphism navigation bar on desktop with clickable logo, compact dropdown on mobile
- **DM Sans Typography** — Modern, clean font used across the entire site
- **Site Footer** — Persistent footer with logo, copyright, and social icon links; stacks and centers on mobile
- **Custom 404 Page** — Styled error page matching the portfolio design with glitch animation, served via Vercel routing
- **Locale-Aware Timezone Display** — Hero section shows the current IST time and how far ahead/behind it is from the visitor's local timezone, updating every 30 seconds
- **No-JS Fallback** — A `<noscript>` banner informs users if JavaScript is disabled and reveals the home section statically

### 🎭 Animations & Interactions

- **Smooth Page Transitions** — Sections fade and slide out before the next one fades in, with a locked transition state to prevent glitches
- **Staggered Content Animations** — Cards, headings, and text elements cascade in with a delay when a section becomes active
- **Typewriter Effect** — Hero subtitle cycles through "Student", "Developer", and "Gamer" with a blinking accent cursor
- **Navbar Entrance** — Navigation pill springs down into view on page load
- **Ink-Blot Theme Transition** — Organic blob SVG animation wipes across the screen when switching themes
- **Hover Effects** — Interactive lift animations on cards, nav items, and buttons
- **Magnetic Buttons** — Hero CTA buttons subtly follow the cursor on hover
- **Theme Icon Spin** — Sun/moon icon rotates 360° when switching themes
- **Active Nav Indicator** — Sliding pill indicator tracks the active nav item
- **Mobile Swipe Gestures** — Swipe left/right on touch devices to navigate between sections, with a live edge hint pill showing the destination

### 🌌 Visual Effects

- **Particle Constellation Background** — Canvas-rendered floating particles that connect with lines when close, gently repel from the cursor, and pulse with the current theme color. Pauses automatically when the tab is hidden to save CPU/battery
- **Cursor Spotlight** — Subtle radial gradient follows the cursor across the page
- **Animated Favicon** — Canvas-drawn `</>` logo with an orbiting glow dot, updates colors automatically with the active theme

### 🐣 Easter Eggs

- **Konami Code** — Type ↑ ↑ ↓ ↓ ← → ← → B A to trigger an achievement-style popup with confetti rain and a +30 Gamer Points badge

### 🎵 Music Integration

- **Live Now-Playing Pill** — Hero section displays a loading skeleton while data is fetching, then shows a green pill with animated equalizer bars when actively scrobbling, or grey when showing the last played track
- **Last.fm API** — Track name, artist, and album fetched in real-time from Last.fm
- **iTunes Cover Art** — Album artwork fetched from the iTunes Search API (CORS-friendly, no key required) at 600×600 resolution, with Last.fm image as fallback
- **Smart Art Caching** — iTunes is only called when the artist/album changes; repeated 30-second polls reuse the cached artwork URL
- **Animated Equalizer Bars** — 4 bars animate when live, sit flat when idle — appear in both the hero pill and the About section music widget
- **Live/Recent Badge** — About section shows a green "Live" or grey "Recent" badge next to the track name
- **Auto-Refresh** — Updates every 30 seconds automatically
- **Background Ambient Music** — Optional procedurally generated ambient piano music using the Web Audio API, with a look-ahead scheduler. Pauses automatically when the tab is hidden

### 📬 Contact Features

- **Functional Contact Form** — Web3Forms integration (no backend needed)
- **Form Validation** — Client-side validation for all fields including email format
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
- **SEO Optimised** — Full meta tags, Open Graph (with image dimensions), Twitter Card, canonical URL, and a clean `sitemap.xml`
- **Accessibility** — Skip link, ARIA labels, keyboard navigation, focus traps on overlays (`role="dialog"`), and `aria-live` regions for dynamic content
- **Reduced Motion** — Respects `prefers-reduced-motion` — disables particle canvas, transitions, and animations
- **Tab Visibility** — Particle canvas and ambient music both pause when the tab is hidden, resuming when you return
- **Auto Footer Year** — Copyright year updates automatically

## 🎨 Color Theme

### Light Mode

| Variable | Value |
|----------|-------|
| Background | `#ffffff` |
| Secondary Background | `#f8f9fa` |
| Text Primary | `#000000` |
| Text Muted | `#666666` |
| Accent | `#2563eb` |

### Dark Mode

| Variable | Value |
|----------|-------|
| Background | `#0a0a0a` |
| Secondary Background | `#121212` |
| Card Background | `#1a1a1a` |
| Text Primary | `#ffffff` |
| Text Muted | `#a0a0a0` |
| Accent | `#3b82f6` |

## 📂 Project Structure

```
devajith-portfolio/
├── index.html               # Entry point with pre-render theme init
├── vite.config.js           # Vite bundling configuration
├── vercel.json              # Vercel deployment & 404 routing logic
├── public/                  # Static assets & standalone pages
│   ├── 404.html             # Custom error page
│   ├── 404.css              # Error page styles
│   └── js/404.js            # Vanilla JS for 404 page theme sync
├── src/
│   ├── main.jsx             # React DOM mounting
│   ├── App.jsx              # Core logic: section state, theme, swipe gestures
│   ├── components/
│   │   ├── AboutSection.jsx
│   │   ├── ContactSection.jsx
│   │   ├── EasterEgg.jsx
│   │   ├── Footer.jsx
│   │   ├── HomeSection.jsx
│   │   ├── HobbiesSection.jsx
│   │   ├── KeyboardShortcuts.jsx
│   │   ├── Navigation.jsx
│   │   ├── ProjectsSection.jsx
│   │   ├── projects.js      # Project data config — edit here to add/update projects
│   │   ├── SkillsSection.jsx
│   │   └── Toast.jsx
│   ├── hooks/
│   │   ├── index.js         # useTheme, useNowPlaying, useParticleCanvas, useTypewriter, useTimezone
│   │   └── useOgImage.js    # OG image URL builder
│   ├── utils/
│   │   ├── audio.js         # Audio engine & ambient music controller
│   │   ├── lastfm.js        # Last.fm metadata + iTunes cover art fetching
│   │   └── theme.js         # Ink-blot animation & theme application
│   └── styles/
│       ├── global.css       # Design system: variables, resets, shared components
│       └── 404.css          # 404 page styles
```

> **Note:** The browser favicon is generated at runtime via a JavaScript canvas animation — no static `favicon.ico` is required. `manifest.json` must stay at the root so browsers and PWA installers can find it automatically.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Git for version control
- Last.fm account (for music widget)
- Web3Forms account (for contact form)

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

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Customize your information**

   In `src/App.jsx`:
   - Update your name in the hero section and OG meta tags

   In `src/hooks/index.js`:
   - Update `MY_TZ` and `MY_TZ_SHORT` if you're not in `Asia/Kolkata`
   - Update the typewriter `words` array in `useTypewriter`

   In `src/utils/lastfm.js`:
   - Replace `LASTFM_USERNAME` and `LASTFM_API_KEY` with your own

   In `src/components/projects.js`:
   - Add or edit your project entries — no JSX changes needed

   In `src/components/ContactSection.jsx`:
   - Replace the `access_key` value with your Web3Forms key

6. **Get API Keys**

   **Last.fm API (Free):**
   - Visit [last.fm/api/account/create](https://www.last.fm/api/account/create)
   - Create an application and copy your API key

   **Web3Forms (Free):**
   - Visit [web3forms.com](https://web3forms.com/)
   - Enter your email to get an access key

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → **Import Git Repository**
4. Select your repository and click **Deploy**
5. Your site will be live at `your-project.vercel.app`

> The included `vercel.json` handles routing so unknown URLs correctly show the 404 page instead of a blank Vercel error.

### Deploy to Netlify

1. Run `npm run build` and drag the `dist/` folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments on push

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
| **Projects** | Clickable project cards — data lives in `src/components/projects.js` |
| **Skills** | Animated progress bars for programming languages, frameworks & tools, and data science technologies |
| **Hobbies** | Gaming, music, and tech exploration |
| **Contact** | Contact form via Web3Forms and social media links |

## 🛠️ Customization Guide

### Changing Theme Colors

Edit CSS variables in `src/styles/global.css`:

```css
:root {
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
}

[data-theme='dark'] {
  --accent: #3b82f6;
  --accent-hover: #60a5fa;
}
```

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

### Adjusting the Particle Density

Find `COUNT` inside `useParticleCanvas` in `src/hooks/index.js`:

```js
const COUNT = Math.min(80, Math.floor(window.innerWidth / 18));
```

Increase the `80` cap or decrease the divisor for more particles, or reduce them for better performance on low-end devices.

### Adding a Project

Open `src/components/projects.js` and add an entry to the `PROJECTS` array:

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

1. Add your section to the `SECTIONS` array in `src/App.jsx`:

   ```js
   const SECTIONS = ["home", "about", "projects", "skills", "hobbies", "newpage", "contact"];
   ```

2. Add its label and icon to `Navigation.jsx`:

   ```js
   const SECTION_LABELS = { ..., newpage: "New Page" };
   const SECTION_ICONS  = { ..., newpage: "fa-star" };
   ```

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

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| React 18 | Component-based UI and state management |
| Vite | Fast bundling and dev server |
| CSS3 | Styling, animations, CSS custom properties |
| Web Audio API | Procedurally generated ambient background music |
| Canvas API | Particle constellation background + animated favicon |
| Intl API | Locale-aware timezone comparison |
| Last.fm API | Music metadata (track, artist, album) |
| iTunes Search API | Album cover art (CORS-friendly, no key required) |
| Font Awesome | Icons |
| Google Fonts (DM Sans) | Typography |
| Web3Forms | Contact form backend |
| react-helmet-async | Dynamic `<head>` / OG meta tag management |
| Vercel | Hosting and routing |

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

> The animated favicon and particle canvas use the HTML5 Canvas API, supported in all modern browsers. The ambient music uses the Web Audio API, available in all evergreen browsers. The timezone display uses `Intl.DateTimeFormat`, universally supported.

## 📄 License

This project is open source and available under the [MIT License](LICENSE.md).

## 🙏 Acknowledgments

- **Font Awesome** — Icons
- **Google Fonts** — DM Sans font family
- **Last.fm** — Music scrobbling API
- **iTunes Search API** — Album cover artwork
- **Web3Forms** — Contact form backend
- **Vercel** — Hosting platform

## 📞 Contact

- **LinkedIn:** [Devajith Jijush](https://www.linkedin.com/in/devajith-jijush-5741ab39b/)
- **GitHub:** [@Devajuice](https://github.com/devajuice)
- **Instagram:** [@Devajuice](https://instagram.com/devajuice)
- **Website:** [devajuice.vercel.app](https://devajuice.vercel.app)

---

Made with ❤️ by [Devajuice](https://devajuice.vercel.app)

⭐ Star this repo if you found it helpful!
