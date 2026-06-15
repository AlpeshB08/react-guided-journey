# react-guided-journey

A complete, headless React onboarding system — not just a tooltip library.

[![npm](https://img.shields.io/npm/v/react-guided-journey.svg)](https://www.npmjs.com/package/react-guided-journey)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-♥-ec4899.svg)](https://github.com/sponsors/AlpeshB08)

**[▶ Live interactive demo](https://AlpeshB08.github.io/react-guided-journey/)** ·
[Getting started](./docs/getting-started.md) ·
[Hosting](./docs/hosting.md) ·
[Publishing](./docs/publishing.md) ·
[Sponsor](https://github.com/sponsors/AlpeshB08)

> Try every feature live before you install — tours, checklist, help center,
> discovery tips, theming, and the persisted state (refresh to see it resume).

Ships with guided **tours** (spotlight + tooltips), a getting-started
**checklist** with progress tracking, dismissible **discovery banners**, a
**help center** drawer, and a **welcome modal** — all driven by one minimal,
DB-ready state shape.

- **Zero runtime dependencies.** Only React as a peer dep. The store is a tiny
  `useSyncExternalStore` implementation, no zustand/redux.
- **Router-agnostic.** You pass `currentPath` and `onNavigate` — works with
  react-router, TanStack Router, Next.js, anything.
- **Role-agnostic.** Roles are plain strings; no coupling to an auth library.
- **DB-ready persistence.** The persisted state is four id-arrays that map
  cleanly to a single row. Default localStorage adapter; bring your own async
  adapter for a backend.

## Why this over react-joyride / driver.js / Shepherd?

| | react-guided-journey | react-joyride | driver.js | Shepherd |
|---|---|---|---|---|
| Runtime deps | **0** | several | 0 | several |
| Checklist + progress | ✅ built-in | ❌ | ❌ | ❌ |
| Persistence (resume) | ✅ pluggable | ❌ | ❌ | ❌ |
| Help center / welcome | ✅ | ❌ | ❌ | ❌ |
| Navigate-then-tour | ✅ | ❌ | ❌ | ❌ |
| Role-aware tours | ✅ | ❌ | ❌ | ❌ |
| Tooltip placement | measure-then-show | static estimate | static | popper |
| Async target waiting | ✅ MutationObserver | partial | ❌ | ❌ |
| Keyboard nav + a11y | ✅ | ✅ | partial | ✅ |
| Tooltip arrow/caret | ✅ | ✅ | ✅ | ✅ |

## A modern alternative to react-joyride, driver.js, Shepherd.js, intro.js & Reactour

If you're comparing React onboarding / product-tour libraries, here's where
react-guided-journey fits:

- **vs [react-joyride](https://www.npmjs.com/package/react-joyride)** — joyride
  is tours-only and unmaintained-ish; this adds a checklist, help center,
  discovery tips and persistence, with zero runtime deps.
- **vs [driver.js](https://www.npmjs.com/package/driver.js)** — driver.js is a
  great vanilla-JS highlighter but not React-native and has no checklist or
  resume-state; this is built for React with a full onboarding model.
- **vs [Shepherd.js](https://www.npmjs.com/package/shepherd.js) / [intro.js](https://www.npmjs.com/package/intro.js)** —
  both are tour engines; this is a complete onboarding system (tour + checklist
  + help center + tips) in one headless, themeable package.
- **vs [Reactour](https://www.npmjs.com/package/@reactour/tour) / [Onborda](https://www.npmjs.com/package/onborda) / NextStep** —
  similar tour scope; this adds progress tracking, DB-ready persistence,
  role-aware content and a navigate-then-tour flow.

Short version: most of these are **tooltip/tour libraries**. This is an
**onboarding system** — tours *and* a progress checklist *and* a help center
*and* discovery tips, sharing one DB-ready state shape.

## Install

```bash
npm install react-guided-journey
```

```tsx
import { OnboardingProvider } from "react-guided-journey";
import "react-guided-journey/styles.css";
```

## Quick start

```tsx
<OnboardingProvider
  config={{
    tours,
    journeys,
    role: currentUser.role,
    userId: currentUser.id,
    currentPath: location.pathname, // from your router
    onNavigate: navigate,           // from your router
  }}
>
  <App />
</OnboardingProvider>
```

See [`example/App.tsx`](./example/App.tsx) for a full react-router example, or
run the interactive demo locally:

```bash
cd demo
npm install
npm run dev   # http://localhost:5173
```

> The live-demo link above is a placeholder — update the username/org once you
> push to GitHub and enable Pages (see [docs/hosting.md](./docs/hosting.md)).

## Concepts

- **Tour** — an ordered list of spotlighted steps tied to a route. Set
  `autoLaunch: true` to start it the first time a user reaches its route.
- **Step** — `{ id, target (CSS selector), title, content, placement }`. Each
  step can set its own `width`, `spotlightPadding`, async `onBeforeStep`
  (e.g. open a menu / await a fetch before highlighting) and `onAfterStep`.
- **Journey** — a role-specific checklist of tasks + an optional welcome modal.
  A task with a `tourId` shows a "Show me how" button; finishing that tour marks
  the task complete (`checklistStepId`).
- **Discovery** — a small inline "tip" banner you place anywhere; stays
  dismissed once closed.

## Persisted state (DB-ready)

```ts
interface PersistedState {
  welcomeSeen: boolean;
  completedSteps: string[];        // finished checklist tasks
  seenTours: string[];             // completed OR dismissed — gates auto-launch
  dismissedDiscoveries: string[];
}
```

Use a custom backend instead of localStorage:

```tsx
const adapter: PersistenceAdapter = {
  load: () => fetch(`/api/onboarding/${userId}`).then((r) => r.json()),
  save: (state) =>
    fetch(`/api/onboarding/${userId}`, {
      method: "PUT",
      body: JSON.stringify(state),
    }),
};

<OnboardingProvider config={{ ...config, persistence: adapter }}>
```

## Lifecycle callbacks

```tsx
callbacks: {
  onTourStart, onTourComplete, onTourSkip,
  onStepChange, onStepComplete, onChecklistComplete,
}
```

## Theming

Override any CSS variable (`--rgj-primary`, `--rgj-surface`, `--rgj-radius`, …)
in your own stylesheet. Or set `renderDefaultUI={false}` on the provider and
build your own UI with the exported `useOnboarding()` hook + `<TourRenderer />`.

## Sponsor

react-guided-journey is free and MIT-licensed. If it saves you time, you can
support its development via **[GitHub Sponsors](https://github.com/sponsors/AlpeshB08)**
— one-time or monthly. Thank you 🙏

## License

MIT © [Alpesh Baraiya](https://github.com/AlpeshB08)
