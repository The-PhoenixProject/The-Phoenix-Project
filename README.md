# 🐦‍🔥 The Phoenix Project — Front-end

> A responsive web client for Phoenix — connecting eco-conscious buyers and sellers to reuse, upcycle, and resell pre-loved items.

Live demo: [demo](https://the-phoenix-project-front-end.vercel.app) 
Back-end: https://github.com/The-PhoenixProject/The-Phoenix-Project-Back-end

Status: Active development  
Languages: JavaScript, CSS  
Framework: React (adjust if you use another framework)

---

Table of contents
- [About](#about)
- [Tech stack](#tech-stack)
- [Features](#key-features)
- [Getting started](#getting-started-local)
- [Environment variables](#environment-variables)
- [Scripts](#available-scripts)
- [Integration notes (API & Socket.IO)](#Integration-notes-api--socketio)
- [Routing & authentication](#routing--authentication)
- [Testing](#testing)
- [Accessibility & performance](#accessibility--performance)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Maintainers / Contacts](#maintainers--contacts)
- [License](#license)

---

## About

This repository contains the front-end application for The Phoenix Project — a marketplace and community for sustainable reuse. The front-end consumes the Back-end API, handles real-time messaging (Socket.IO), displays products and posts, and provides user authentication and notifications.

---

## Tech stack

- JavaScript (ESNext)
- React (or your chosen UI library)
- CSS / CSS Modules / Tailwind / Styled Components (specify how you style)
- Socket.IO client (for real-time features)
- Axios / Fetch for HTTP requests
- Optional: Vite / Create React App / Next.js (replace with whichever you use)

---

## Key features

- User registration, login, and session management
- Product browsing, creation, editing, and deletion
- Social posts (feed) with likes/comments
- Real-time chat and notifications via Socket.IO
- File/image uploads
- Eco points display and actions
- Responsive UI (mobile-first)

---

## Getting started (local)

Prerequisites:
- Node.js v14+ (recommended latest LTS)
- npm or yarn
- Back-end API running or accessible (see Back-end repo)

1. Clone
```bash
git clone https://github.com/The-PhoenixProject/The-Phoenix-Project-Front-end.git
cd The-Phoenix-Project-Front-end
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Copy and edit env
Depending on your build tool, use either Vite-style or Create React App-style variables.

Vite (recommended):
```bash
cp .env.example .env
# set VITE_API_URL, VITE_SOCKET_URL, etc.
```

Create React App:
```bash
# set REACT_APP_API_URL, REACT_APP_SOCKET_URL, etc.
```

4. Run dev server
```bash
npm run dev   # or `npm start` if using CRA
```

App will be available at http://localhost:3000 (or the port printed by your tool).

---

## Environment variables

Examples (adjust keys to match your project toolchain):

Vite:
- VITE_API_URL=http://localhost:3000
- VITE_SOCKET_URL=http://localhost:3000
- VITE_GOOGLE_MAPS_KEY=your_key_here

Create React App:
- REACT_APP_API_URL=http://localhost:3000
- REACT_APP_SOCKET_URL=http://localhost:3000

Do not commit secrets to git.

---

## Available scripts

(Replace or adjust these to match package.json in the repo.)

- npm run dev — start development server (hot reload)
- npm start — start production server / preview
- npm run build — build optimized production bundle
- npm run lint — run linters
- npm test — run tests
- npm run format — format code (prettier/eslint --fix)

---

## Integration notes (API & Socket.IO)

API
- The front-end talks to the Back-end API at `${API_URL}`.
- Authentication uses JWT: store access token in memory / short-lived storage and refresh tokens securely (httpOnly cookies recommended on production).
- Example request using Axios:
  - GET `${API_URL}/api/products`
  - POST `${API_URL}/api/auth/login`

Socket.IO
- Connect to the Socket.IO server at `${SOCKET_URL}`.
- Typical flow:
  - Connect with authentication (send token in query or use an auth handshake).
  - Listen for events: `message:received`, `notification:new`, `user:online`, etc.
  - Emit events: `message:send`, `conversation:join`, `typing:start`, etc.
- When deploying multiple server instances, use the same Socket.IO adapter (Redis) on the back-end.

---

## Routing & authentication

- Protect private routes with an Auth wrapper (redirect to /login if not authenticated).
- Persist minimal user state; refresh tokens should be handled securely by the back-end (refresh endpoint).
- Components example:
  - /login, /register
  - /products, /products/:id
  - /posts, /posts/:id
  - /messages, /messages/:conversationId
  - /profile, /settings

---

## Testing

- Unit tests: Jest + React Testing Library (recommended)
- E2E tests: Cypress / Playwright (optional)
- Example:
```bash
npm test
```

Write tests for auth flows, product CRUD, post feed, and critical UI components.

---

## Accessibility & performance

- Use semantic HTML and ARIA attributes where appropriate.
- Ensure keyboard navigation and screen-reader compatibility for interactive components (forms, dialogs, chat).
- Optimize images and lazy-load large assets.
- Use Lighthouse to audit performance and accessibility.

---

## Deployment

- Build production bundle: `npm run build`
- Host options:
  - Vercel (good for static front-ends)
  - Netlify
  - GitHub Pages (static)
  - Cloudflare Pages
- Set environment variables in your host dashboard (API and socket URLs).
- If the app is served from a different origin than the API, ensure CORS is configured on the Back-end and FRONTEND_URL is whitelisted.

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Commit work: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

Guidelines:
- Follow code style and run linters/tests locally.
- Provide clear PR descriptions and screenshots for UI changes.
- Add tests for new features.

---

## Maintainers / Contacts

Team members (Front-end / Project contacts)
- Eyad Mohamed Saad
- Ahmed Mohamed Elsayed
- Mariam Mamdouh Darwish
- Rowida Hussein Mahmoud
- Mariam Ahmed Muhamed

For back-end integration or Firebase credentials, see the Back-end repo maintainers.

---

## License

This project is licensed under the ISC License. See LICENSE for details.
