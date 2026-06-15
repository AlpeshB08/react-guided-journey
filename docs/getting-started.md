# Getting started

Integrate react-guided-journey in ~5 minutes.

## 1. Install

```bash
npm install react-guided-journey
# or: pnpm add / yarn add / bun add
```

`react` and `react-dom` (v18+) are peer dependencies — you already have them.

## 2. Import the stylesheet once

Anywhere that runs at app startup (e.g. your root `main.tsx`):

```tsx
import "react-guided-journey/styles.css";
```

> Skipping this is the #1 reason tours "don't show up". The components render,
> but with no styles they're invisible/unstyled.

## 3. Define your tours and checklist

```tsx
import type { TourConfig, JourneyConfig } from "react-guided-journey";

export const tours: TourConfig[] = [
  {
    id: "dashboard",
    title: "Dashboard tour",
    route: "/",
    autoLaunch: true,            // start on first visit to "/"
    checklistStepId: "see-dashboard", // mark this checklist task done when finished
    steps: [
      {
        id: "stats",
        target: "[data-tour='stats']", // any CSS selector
        title: "Your stats",
        content: "These update live.",
        placement: "bottom",
      },
    ],
  },
];

export const journeys: JourneyConfig[] = [
  {
    roles: ["admin"],            // optional — omit for "everyone"
    checklistTitle: "Getting started",
    welcome: {
      title: "Welcome 👋",
      body: "Let's set things up.",
      primaryLabel: "Show me around",
    },
    steps: [
      {
        id: "see-dashboard",
        title: "Take the dashboard tour",
        tourId: "dashboard",     // shows a "Show me how" button
        order: 1,
      },
    ],
  },
];
```

Add the `data-tour` attribute (or any selector you like) to the element you want
to spotlight:

```tsx
<div data-tour="stats">…</div>
```

## 4. Wrap your app in the provider

The provider is **router-agnostic** — you wire in your router's current path and
navigate function.

### react-router

```tsx
import { OnboardingProvider } from "react-guided-journey";
import { useLocation, useNavigate } from "react-router-dom";
import "react-guided-journey/styles.css";

function Providers({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <OnboardingProvider
      config={{
        tours,
        journeys,
        role: currentUser.role,   // any string, optional
        userId: currentUser.id,   // namespaces persistence
        currentPath: pathname,
        onNavigate: navigate,
      }}
    >
      {children}
    </OnboardingProvider>
  );
}
```

> `<OnboardingProvider>` must be rendered **inside** your `<Router>` so that
> `useLocation`/`useNavigate` are available.

### Next.js (app router)

```tsx
"use client";
import { usePathname, useRouter } from "next/navigation";

const pathname = usePathname();
const router = useRouter();
// currentPath={pathname} onNavigate={router.push}
```

### No router

```tsx
currentPath="/" onNavigate={() => {}}
```

That's the whole integration. The welcome modal, checklist pill, help center and
tour overlay now render automatically.

## 5. Trigger things from your own UI (optional)

```tsx
import { useOnboarding } from "react-guided-journey";

function HelpButton() {
  const { setHelpCenterOpen, startTour } = useOnboarding();
  return <button onClick={() => setHelpCenterOpen(true)}>Help</button>;
}
```

## Persisting to your backend instead of localStorage

```tsx
import type { PersistenceAdapter } from "react-guided-journey";

const adapter: PersistenceAdapter = {
  load: async () => (await fetch(`/api/onboarding/${userId}`)).json(),
  save: (state) =>
    fetch(`/api/onboarding/${userId}`, {
      method: "PUT",
      body: JSON.stringify(state),
    }),
};

// config={{ ...config, persistence: adapter }}
```

The state you store is just four arrays/booleans — see `PersistedState`.

## Discovery banners

Place a dismissible tip anywhere:

```tsx
import { DiscoveryBanner } from "react-guided-journey";

// config.discoveries = [{ id: "new-reports", title: "New!", body: "..." }]
<DiscoveryBanner id="new-reports" />
```

## Bring your own UI (headless mode)

Set `renderDefaultUI={false}` and compose with the hook + `<TourRenderer />`:

```tsx
<OnboardingProvider config={config} renderDefaultUI={false}>
  <MyCustomChecklist />   {/* uses useOnboarding() */}
  <TourRenderer />        {/* keep the tour overlay */}
</OnboardingProvider>
```

## Step lifecycle hooks

```tsx
{
  id: "menu-item",
  target: "[data-tour='menu-item']",
  // open a menu (or await a fetch) BEFORE the step highlights — it waits
  onBeforeStep: async () => openSidebar(),
  onAfterStep: () => closeSidebar(),
  title: "...",
  content: "...",
}
```

## Theming

Override any CSS variable in your own stylesheet (loaded after the library's):

```css
:root {
  --rgj-primary: #e11d48;
  --rgj-radius: 8px;
  --rgj-surface: #fff;
}
```

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Nothing appears | You forgot `import "react-guided-journey/styles.css"`. |
| "Invalid hook call" | Duplicate React. Ensure the lib is a dep and React is deduped (single copy). |
| Tour doesn't auto-launch | `autoLaunch` not set, route doesn't match, or it's already in `seenTours`. |
| Tooltip points at nothing | The `target` selector doesn't match, or the element mounts late — it now waits via MutationObserver up to 8s, then centers. |
| Provider error | A component using `useOnboarding` is outside `<OnboardingProvider>`. |
