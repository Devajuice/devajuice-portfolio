# Devajith | Developer Portfolio 🌟

A modern, responsive single-page portfolio website featuring a clean monochrome design, smooth animations, glass-effect navigation, light/dark theme switching, dynamic music integration, particle constellation background, and interactive easter eggs. Built with vanilla HTML, CSS, and JavaScript.

![Website Preview](https://img.shields.io/badge/Status-Live-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
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
- **Active Nav Dot** — Small accent dot appears beneath the active nav item
- **Mobile Swipe Gestures** — Swipe left/right on touch devices to navigate between sections, with a live edge hint pill showing the destination

### 🌌 Visual Effects

- **Particle Constellation Background** — Canvas-rendered floating particles that connect with lines when close, gently repel from the cursor, and pulse with the current theme color. Pauses automatically when the tab is hidden to save CPU/battery
- **Cursor Spotlight** — Subtle radial gradient follows the cursor across the page
- **Animated Favicon** — Canvas-drawn `</>` logo with an orbiting glow dot, updates colors automatically with the active theme

### 🐣 Easter Eggs

- **Konami Code** — Type ↑ ↑ ↓ ↓ ← → ← → B A to trigger an achievement-style popup with rainbow shimmer border, confetti rain, and a +30 Gamer Points badge

### 🎵 Music Integration

- **Live Now-Playing Pill** — Hero section displays a pill that turns green with animated equalizer bars when actively scrobbling, and grey when showing the last played track
- **Last.fm API Widget** — Real-time display of currently playing or last played track with "NOW PLAYING" / "LAST PLAYED" label
- **Animated Equalizer Bars** — 4 bars animate in sync when live, sit flat when idle — appear in both the hero pill and the About section music widget
- **Live/Recent Badge** — About section shows a green "Live" or grey "Recent" badge next to the track name
- **Album Artwork** — Dynamic album art fetched from Last.fm with fallback to `track.getInfo` when missing
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
- **Fast Loading** — Deferred script loading, preconnect hints for all external origins, and no render-blocking resources
- **SEO Optimised** — Full meta tags, Open Graph (with image dimensions + alt), Twitter Card, canonical URL, and a clean `sitemap.xml`
- **Accessibility** — Skip link, ARIA labels, keyboard navigation, focus management, and `role="dialog"` on overlays
- **Reduced Motion** — Respects `prefers-reduced-motion` — disables particle canvas, transitions, and animations
- **Tab Visibility** — Particle canvas and ambient music both pause when the tab is hidden, resuming when you return
- **Auto Footer Year** — Copyright year updates automatically via JavaScript

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
├── index.html            # Entry point with pre-render theme init
├── vite.config.js        # Vite bundling configuration
├── vercel.json           # Vercel deployment & 404 routing logic
├── public/               # Static assets & standalone pages
│   ├── 404.html          # Custom error page
│   ├── 404.css           # Error page styles
│   ├── global.css        # Shared Design System (Variables & Resets)
│   └── js/404.js         # Vanilla JS for 404 page theme sync
├── src/
│   ├── main.jsx          # React DOM mounting
│   ├── App.jsx           # Core Logic: Section state, Theme listeners, Swipe gestures
│   ├── components/       # UI Sections (Home, About, Projects, etc.)
│   ├── hooks/            # Custom Hooks (useTheme, useParticleCanvas, useNowPlaying)
│   ├── utils/
│   │   ├── audio.js      # Audio engine & Ambient music controller
│   │   ├── theme.js      # Ink blot animation & Theme application
│   │   └── lastfm.js     # API service for music data
│   └── styles/           # Component-specific styling
```

> **Note:** The browser favicon is generated at runtime via a JavaScript canvas animation — no static `favicon.ico` is required. `manifest.json` must stay at the root so browsers and PWA installers can find it automatically.

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Git for version control
- Last.fm account (for music widget)
- Web3Forms account (for contact form)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/devajuice/devajuice-portfolio.git
   cd devajuice-portfolio
   ```

2. **Customize your information**

   In `index.html`:
   - Replace `Devajith` / `Devajuice` with your name throughout
   - Update the hero subtitle words in the typewriter array
   - Update social media links and education timeline entries

   In `js/script.js`:
   - Add your Last.fm username and API key
   - Add your Web3Forms access key
   - Update the timezone constant `MY_TZ` if you're not in `Asia/Kolkata`

3. **Get API Keys**

   **Last.fm API (Free):**
   - Visit [last.fm/api/account/create](https://www.last.fm/api/account/create)
   - Create an application and copy your API key
   - Replace `LASTFM_API_KEY` and `LASTFM_USERNAME` in `js/script.js`

   **Web3Forms (Free):**
   - Visit [web3forms.com](https://web3forms.com/)
   - Enter your email to get an access key
   - Replace the `access_key` value in `js/script.js`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **New Project** → **Import Git Repository**
4. Select your repository and click **Deploy**
5. Your site will be live at `your-project.vercel.app`

> The included `vercel.json` handles routing so unknown URLs correctly show the 404 page instead of a blank Vercel error.

### Deploy to Netlify

1. Drag and drop your project folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

### Deploy to GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Set source to `main` branch and `/ (root)` folder
3. Your site will be live at `username.github.io/repository-name`

> Note: `vercel.json` has no effect on GitHub Pages. To handle 404s there, copy `404.html` to the root — GitHub Pages serves it automatically for unmatched routes.

## 📱 Sections

| Section | Description |
|---------|-------------|
| **Home** | Hero with typewriter subtitle, locale-aware timezone display, CTA buttons, and live Last.fm now-playing pill with equalizer bars |
| **About** | Personal bio, education timeline, and currently listening music widget with album art and live badge |
| **Projects** | Clickable project cards linking to live sites or GitHub repos |
| **Skills** | Animated progress bars for programming languages, frameworks & tools, and data science technologies |
| **Hobbies** | Gaming, music, and tech exploration |
| **Contact** | Contact form via Web3Forms and social media links |

## 🛠️ Customization Guide

### Changing Theme Colors

Edit CSS variables in `css/styles.css`:

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

Find the timezone constants in `js/script.js`:

```js
const MY_TZ = "Asia/Kolkata";
const MY_TZ_SHORT = "IST";
```

Replace with your own IANA timezone string (e.g. `"America/New_York"`, `"Europe/London"`).

### Changing the Typewriter Words

Find the typewriter array in `js/script.js` and update the words:

```js
const words = ['Student', 'Developer', 'Gamer'];
```

### Tuning the Swipe Sensitivity

Find these constants inside `initSwipeGestures()` in `js/script.js`:

```js
const MIN_X = 55;     // minimum horizontal pixels required
const MAX_Y = 80;     // maximum vertical drift before swipe is ignored
const MIN_V = 0.3;    // minimum speed (px/ms) to count as intentional
```

### Adjusting the Particle Density

Find `PARTICLE_COUNT` inside `initParticleCanvas()` in `js/script.js`:

```js
const PARTICLE_COUNT = Math.min(80, Math.floor(window.innerWidth / 18));
```

Increase the `80` cap or decrease the divisor for more particles, or reduce them for better performance on low-end devices.

### Adding a Project Card

Copy and adapt this block inside `.grid-container` in the Projects section of `index.html`:

```html
<a
  href="YOUR_URL"
  class="card project-card"
  target="_blank"
  rel="noopener noreferrer"
>
  <div class="card-icon">
    <i class="fas fa-code"></i>
  </div>
  <div class="card-content">
    <h3>
      Project Name
      <i class="fas fa-external-link-alt project-link-icon"></i>
    </h3>
    <p>Short description of the project.</p>
    <div class="tags">
      <span class="tag"><i class="fab fa-python"></i>Python</span>
    </div>
  </div>
</a>
```

### Adding a Navigation Section

1. Add a button to the navbar `<ul class="nav-links">` in `index.html`:

   ```html
   <li>
     <button id="nav-newpage" class="nav-btn" onclick="navigate('newpage')">
       <span>New Page</span>
     </button>
   </li>
   ```

2. Add it to the mobile dropdown `<ul class="mobile-nav-links">`:

   ```html
   <li>
     <button class="mobile-nav-btn" onclick="navigate('newpage')">
       <i class="fas fa-star" aria-hidden="true"></i>
       <span>New Page</span>
     </button>
   </li>
   ```

3. Add a matching section in `<main>`:

   ```html
   <section id="newpage" class="page-section" aria-labelledby="newpage-heading">
     <h2 id="newpage-heading" class="section-title">
       <i class="fas fa-star"></i>
       <span>New Page</span>
     </h2>
     <!-- content here -->
   </section>
   ```

4. Register it in the section order inside `initSwipeGestures()` in `js/script.js`:

   ```js
   const SECTIONS = ["home", "about", "projects", "skills", "hobbies", "newpage", "contact"];
   ```

5. Add the keyboard shortcut mapping in `js/script.js` if needed:

   ```js
   const SECTION_KEYS = { ..., 7: "newpage" };
   ```

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure and semantic markup |
| CSS3 | Styling, animations, CSS custom properties |
| JavaScript (Vanilla) | Navigation, theme switching, API calls, canvas effects |
| Web Audio API | Procedurally generated ambient background music |
| Canvas API | Particle constellation background + animated favicon |
| Intl API | Locale-aware timezone comparison |
| Font Awesome | Icons |
| Google Fonts (DM Sans) | Typography |
| Web3Forms | Contact form backend |
| Last.fm API | Music tracking integration |
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
