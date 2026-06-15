import { type ReactNode, useEffect, useState } from "react";
import { CodeBlock } from "./ui";

const SECTIONS = [
  { id: "requirements", label: "Requirements" },
  { id: "install", label: "Installation" },
  { id: "structure", label: "Project structure" },
  { id: "quickstart", label: "Provider & config" },
  { id: "tours", label: "Tours" },
  { id: "checklist", label: "Checklist (journeys)" },
  { id: "roles", label: "Roles & access" },
  { id: "tips", label: "Discovery tips" },
  { id: "theming", label: "Theming" },
  { id: "persistence", label: "Persistence" },
  { id: "api", label: "API & hooks" },
];

export function Docs() {
  const [active, setActive] = useState("install");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (!el) continue;
      const io = new IntersectionObserver(
        ([e]) => e.isIntersecting && setActive(s.id),
        { rootMargin: "-25% 0px -65% 0px" },
      );
      io.observe(el);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="docs">
      <aside className="docs-nav">
        <p className="docs-nav-title">Documentation</p>
        <nav>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "docs-link-on" : ""}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <a
          className="docs-gh"
          href="https://www.npmjs.com/package/react-guided-journey"
          target="_blank"
          rel="noreferrer"
        >
          ↗ npm package
        </a>
      </aside>

      <article className="docs-body">
        <Doc id="requirements" title="Requirements">
          <p>
            react-guided-journey is a <b>React</b> library — it renders with
            React and React DOM, so it works in any React-based app or
            framework, but not in non-React frameworks.
          </p>
          <PropsTable
            head={["Requirement", "Version", "Notes"]}
            rows={[
              [
                "react",
                ">= 18",
                "Peer dependency. Uses useSyncExternalStore (React 18+).",
              ],
              [
                "react-dom",
                ">= 18",
                "Peer dependency. Tooltips/tips are portaled to <body>.",
              ],
              [
                "A bundler",
                "any",
                "Vite, Webpack, Next, Remix, etc. — ships ESM + CJS + types.",
              ],
              [
                "TypeScript",
                "optional",
                "Fully typed; works fine in plain JS too.",
              ],
            ]}
          />
          <p>
            <b>Runtime dependencies: zero.</b> The store is a tiny internal{" "}
            <Code>useSyncExternalStore</Code> implementation — no Redux, no
            Zustand, nothing added to your bundle but the library itself (&lt;
            12&nbsp;kb gzipped).
          </p>
          <ul className="doc-list">
            <li>
              <b>Works with:</b> Vite, Create React App, Next.js (App or Pages
              router), Remix, Gatsby, React Router, TanStack Router — anything
              React.
            </li>
            <li>
              <b>Not for:</b> Vue, Angular, Svelte, or vanilla JS (it's
              React-only).
            </li>
            <li>
              <b>SSR:</b> safe — the localStorage adapter no-ops on the server,
              and overlays mount on the client.
            </li>
          </ul>
        </Doc>

        <Doc id="install" title="Installation">
          <p>React 18+ is the only peer dependency.</p>
          <CodeBlock lang="bash" code="npm install react-guided-journey" />
          <p>Import the stylesheet once, at your app's entry point:</p>
          <CodeBlock
            lang="ts"
            code={`// src/main.tsx (or App root)
import "react-guided-journey/styles.css";`}
          />
          <Callout>
            Forgetting this import is the #1 reason tours "don't show up" — the
            components render, but unstyled (invisible).
          </Callout>
        </Doc>

        <Doc id="structure" title="Project structure (recommended)">
          <p>
            The library is config-driven. The React-standard approach is to keep
            your tour/journey definitions in plain data files and mount one
            provider near the root. Nothing here is required — it's just the
            convention that scales best.
          </p>
          <FileTree
            lines={[
              "src/",
              "├─ onboarding/",
              "│  ├─ tours.ts         # TourConfig[]  — your guided tours",
              "│  ├─ journeys.ts      # JourneyConfig[] — checklist + welcome",
              "│  ├─ discoveries.ts   # DiscoveryConfig[] — tips",
              "│  └─ index.ts         # re-export all three",
              "├─ providers/",
              "│  └─ AppProviders.tsx # <OnboardingProvider> lives here",
              "└─ main.tsx            # imports styles.css once",
            ]}
          />
          <p>
            <b>Where each thing goes:</b>
          </p>
          <ul className="doc-list">
            <li>
              <b>Provider</b> — once, near the root, <i>inside</i> your router
              so it can read the path. Wrap your whole app.
            </li>
            <li>
              <b>Tours / journeys / discoveries</b> — plain data arrays in their
              own files, passed to the provider's <Code>config</Code>.
            </li>
            <li>
              <b>Tour targets</b> — add a <Code>data-tour="…"</Code> attribute
              to the component you want to spotlight, wherever it lives.
            </li>
            <li>
              <b>&lt;DiscoveryBanner /&gt;</b> — drop it on the page where that
              tip belongs (it self-hides once dismissed).
            </li>
            <li>
              <b>Default UI</b> (checklist pill, help center, welcome modal) —
              rendered automatically by the provider. No placement needed.
            </li>
          </ul>
        </Doc>

        <Doc id="quickstart" title="Provider & config">
          <p>
            Mount <b>one</b> provider near the root of your app,{" "}
            <b>inside your router</b> (it reads the router's hooks). Everything
            that should show tours/checklist/help goes inside it — i.e. your
            whole app. The nesting is always{" "}
            <b>Router → OnboardingProvider → App</b>. Here's the complete{" "}
            <Code>main.tsx</Code>:
          </p>
          <CodeBlock
            code={`// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import { OnboardingProvider } from "react-guided-journey";
import "react-guided-journey/styles.css";
import App from "./App";
import { tours, journeys } from "./onboarding/config";

// Wrapper so we can read the router hooks (it must be inside the router).
function AppProviders({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <OnboardingProvider
      config={{
        tours,
        journeys,
        currentPath: pathname,   // from the router
        onNavigate: navigate,    // from the router
        // role:   user?.role,   // optional
        // userId: user?.id,     // optional (keeps each user's progress)
      }}
    >
      {children}
    </OnboardingProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppProviders>
      <App />
    </AppProviders>
  </BrowserRouter>,
);`}
          />
          <Callout>
            Order matters: <Code>&lt;BrowserRouter&gt;</Code> →{" "}
            <Code>&lt;AppProviders&gt;</Code> (the provider) →{" "}
            <Code>&lt;App /&gt;</Code>. The provider must be inside the router,
            and your app inside the provider.
          </Callout>
          <p>
            That's the whole wiring — the welcome modal, checklist pill, help
            center and tours now render automatically. Add a{" "}
            <Code>data-tour</Code> attribute to anything you want a tour to point
            at (see <a href="#tours">Tours</a>).
          </p>
          <p>
            <b>What every config prop does:</b>
          </p>
          <PropsTable
            rows={[
              [
                "tours",
                "TourConfig[]",
                "Your guided tours (spotlight walkthroughs). Required.",
              ],
              [
                "journeys",
                "JourneyConfig[]",
                "Checklists + welcome modal, optionally per role.",
              ],
              [
                "discoveries",
                "DiscoveryConfig[]",
                "Tip definitions rendered by <DiscoveryBanner>.",
              ],
              [
                "role",
                "string?",
                "Current user's role. Filters which tours/journeys show. Omit = everyone.",
              ],
              [
                "userId",
                "string | number?",
                "Namespaces saved state so each user resumes their own progress.",
              ],
              [
                "currentPath",
                "string",
                "Your router's current path — powers auto-launch & navigate-then-tour. Required.",
              ],
              [
                "onNavigate",
                "(route) => void",
                "Your router's navigate — used by 'Show me how' to change pages first.",
              ],
              [
                "persistence",
                "PersistenceAdapter?",
                "Where to save state. Defaults to localStorage; pass your own for a DB.",
              ],
              [
                "theme",
                "OnboardingTheme?",
                "Theme tokens (primary, radius…) injected as CSS variables.",
              ],
              [
                "callbacks",
                "OnboardingCallbacks?",
                "onTourComplete, onStepChange, onChecklistComplete, etc.",
              ],
              [
                "transitionMs",
                "number?",
                "Speed (ms) of the step-to-step glide/fade. Default 220; 0 disables.",
              ],
              [
                "tooltipWidth",
                "number?",
                "Default tooltip width in px (override per-step with step.width). Default 320.",
              ],
              [
                "debug",
                "boolean?",
                "Show a visible warning in-tooltip when a step's target isn't found.",
              ],
            ]}
          />
          <Callout>
            Render the provider <b>inside</b> your <Code>&lt;Router&gt;</Code>,
            so <Code>useLocation</Code> / <Code>useNavigate</Code> are
            available.
          </Callout>
        </Doc>

        <Doc id="tours" title="Tours">
          <p>
            Define tours as a data array (e.g. <Code>onboarding/tours.ts</Code>)
            and pass it to the provider. A tour is steps tied to a route; set{" "}
            <Code>autoLaunch</Code> to start it on first visit.
          </p>
          <CodeBlock
            code={`// onboarding/tours.ts
import type { TourConfig } from "react-guided-journey";

export const tours: TourConfig[] = [{
  id: "dashboard",
  title: "Dashboard tour",
  route: "/",                     // where this tour runs
  autoLaunch: true,               // start on first visit to the route
  roles: ["admin"],               // optional — who sees it
  checklistStepId: "see-dashboard", // mark this task done when finished
  steps: [{
    id: "stats",
    target: "[data-tour='stats']", // any CSS selector
    title: "Your stats",
    content: "These update live.",
    placement: "bottom",           // top|bottom|left|right|*-start|*-end|center
    width: 320,                    // optional per-step width
    onBeforeStep: async () => openSidebar(), // awaited before highlighting
    onAfterStep: () => closeSidebar(),
  }],
}];`}
          />
          <p>
            Then mark the element to spotlight — anywhere in your component
            tree:
          </p>
          <CodeBlock
            lang="tsx"
            code={`// components/StatsCard.tsx
<section data-tour="stats">…</section>`}
          />
        </Doc>

        <Doc id="checklist" title="Checklist (journeys)">
          <p>
            A journey is a getting-started checklist plus an optional welcome
            modal. Keep it in <Code>onboarding/journeys.ts</Code>. A task with a{" "}
            <Code>tourId</Code> shows a "Show me how" button; finishing that
            tour ticks the task off.
          </p>
          <CodeBlock
            code={`// onboarding/journeys.ts
import type { JourneyConfig } from "react-guided-journey";

export const journeys: JourneyConfig[] = [{
  roles: ["admin"],          // omit for everyone (see "Roles & access")
  checklistTitle: "Getting started",
  welcome: { title: "Welcome 👋", body: "Let's set up.", primaryLabel: "Start" },
  steps: [
    { id: "see-dashboard", title: "Take the tour", tourId: "dashboard", order: 1 },
    { id: "invite-team",   title: "Invite your team", route: "/team", order: 2 },
  ],
}];`}
          />
          <p>
            The checklist pill, progress bar and welcome modal render
            automatically — you don't place them anywhere.
          </p>
        </Doc>

        <Doc id="roles" title="Roles & access">
          <p>
            Roles are plain strings <i>you</i> define — the library never
            assumes an auth system. You pass the current user's role once via{" "}
            <Code>config.role</Code>, and each tour / journey / tip declares
            which roles may see it.
          </p>
          <PropsTable
            rows={[
              [
                "roles omitted / []",
                "everyone",
                "No role restriction — shown to all users (single-role apps can ignore roles entirely).",
              ],
              [
                'roles: ["admin"]',
                "single role",
                "Only users whose role === 'admin' see it.",
              ],
              [
                'roles: ["admin","owner"]',
                "multiple roles",
                "Shown if the user's role is any of the listed roles.",
              ],
            ]}
            head={["roles value", "Meaning", "Behaviour"]}
          />
          <p>
            <b>Single-role / no-roles app?</b> Just omit <Code>role</Code> and
            the <Code>roles</Code> field everywhere — everything shows to
            everyone.
          </p>
          <CodeBlock
            code={`// Multi-role: pick the journey + tours for this user
<OnboardingProvider config={{ ...config, role: user.role }}>

// Single-role app: omit role entirely — all content shows
<OnboardingProvider config={{ tours, journeys, currentPath, ... }}>`}
          />
          <p>
            When multiple journeys match, the most specific role-matched journey
            wins, falling back to the first journey with no <Code>roles</Code>.
          </p>
        </Doc>

        <Doc id="tips" title="Discovery tips">
          <p>
            Small dismissible highlights for a feature or page. Define them in{" "}
            <Code>onboarding/discoveries.ts</Code>, then drop a{" "}
            <Code>&lt;DiscoveryBanner /&gt;</Code> on the page where the tip
            belongs. Inline or pinned to a corner; each has its own icon, accent
            and optional CTA. Dismissals persist.
          </p>
          <CodeBlock
            code={`// onboarding/discoveries.ts
export const discoveries = [{
  id: "new-reports",
  icon: "🎉",
  title: "New: Reports",
  body: "Export your data as CSV.",
  placement: "bottom-right", // inline | bottom-right | bottom-left | top-right | top-left
  accent: "#059669",
  roles: ["admin"],          // optional
  action: { label: "Show me", onClick: () => navigate("/reports") },
}];`}
          />
          <CodeBlock
            lang="tsx"
            code={`// ReportsPage.tsx — place where the tip should appear
import { DiscoveryBanner } from "react-guided-journey";

<DiscoveryBanner id="new-reports" />`}
          />
          <p>
            Inline tips sit in the document flow; floating ones are portaled to{" "}
            <Code>&lt;body&gt;</Code>, so a sticky header can't hide them.
          </p>
        </Doc>

        <Doc id="theming" title="Theming">
          <p>Three ways, easiest first:</p>
          <p>
            <b>
              1. The <Code>theme</Code> prop
            </b>{" "}
            — pass it to the provider, no stylesheet edit:
          </p>
          <CodeBlock
            code={`<OnboardingProvider config={{
  ...config,
  theme: { primary: "#e11d48", radius: "8px", surface: "#fff" },
}}>`}
          />
          <p>
            <b>2. Override CSS variables</b> in a stylesheet loaded after the
            library's:
          </p>
          <CodeBlock
            lang="css"
            code={`:root {
  --rgj-primary: #e11d48;
  --rgj-radius: 8px;
  --rgj-surface: #ffffff;
  --rgj-text: #111827;
}`}
          />
          <p>
            <b>3. Auto-adopt your brand tokens</b> — the defaults fall back to{" "}
            <Code>--brand</Code>, <Code>--color-primary</Code>,{" "}
            <Code>--color-surface</Code> and <Code>--radius</Code> if you
            already define them. So if your design system uses those, the
            widgets match your palette with <b>zero config</b>.
          </p>
        </Doc>

        <Doc id="persistence" title="Persistence">
          <p>
            Progress is saved so users resume where they left off. The entire
            saved shape is just four fields:
          </p>
          <PropsTable
            head={["Field", "Type", "Meaning"]}
            rows={[
              ["welcomeSeen", "boolean", "Has the welcome modal been shown."],
              ["completedSteps", "string[]", "Finished checklist task ids."],
              [
                "seenTours",
                "string[]",
                "Tours completed or dismissed (gates auto-launch).",
              ],
              ["dismissedDiscoveries", "string[]", "Tip ids the user closed."],
            ]}
          />
          <p>
            <b>Default:</b> a <Code>localStorage</Code> adapter, namespaced by{" "}
            <Code>userId</Code> (so each user has their own progress, and signed
            -out users don't collide). No setup required.
          </p>
          <p>
            <b>Persist to your backend</b> by implementing a{" "}
            <Code>PersistenceAdapter</Code>. Both <Code>load</Code> and{" "}
            <Code>save</Code> may be synchronous or return a Promise — the
            provider awaits <Code>load</Code> on mount and calls{" "}
            <Code>save</Code> whenever a persisted field changes (debounced to
            real changes only):
          </p>
          <CodeBlock
            code={`import type { PersistenceAdapter, PersistedState } from "react-guided-journey";

const adapter: PersistenceAdapter = {
  // Called once on mount. Return null to start fresh.
  async load(): Promise<PersistedState | null> {
    const res = await fetch(\`/api/onboarding/\${userId}\`);
    if (!res.ok) return null;          // 404 → first-time user
    return res.json();
  },

  // Called on every persisted change. Fire-and-forget; errors won't crash UI.
  async save(state: PersistedState): Promise<void> {
    await fetch(\`/api/onboarding/\${userId}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
  },

  // Optional — called by reset().
  async clear(): Promise<void> {
    await fetch(\`/api/onboarding/\${userId}\`, { method: "DELETE" });
  },
};

<OnboardingProvider config={{ ...config, persistence: adapter }} />`}
          />
          <Callout>
            Because the shape is four plain id-arrays, it maps to a single DB
            row / document — no schema gymnastics. You can also keep
            localStorage and sync to your API in the background from{" "}
            <Code>save</Code>.
          </Callout>
        </Doc>

        <Doc id="api" title="API & hooks">
          <p>
            Call <Code>useOnboarding()</Code> anywhere inside the provider to
            drive it from your own UI (a custom "Help" button, etc.):
          </p>
          <CodeBlock
            code={`import { useOnboarding } from "react-guided-journey";

function HelpButton() {
  const { startTour, setHelpCenterOpen, progressPercent } = useOnboarding();
  return <button onClick={() => setHelpCenterOpen(true)}>Help</button>;
}

// Available: startTour, endTour, dismissTour, toggleChecklist,
// setHelpCenterOpen, completeStep, reset
// Derived: journey, progressPercent, completedCount, onboardingCompleted`}
          />
          <p>
            Want a fully custom look? Set{" "}
            <Code>renderDefaultUI={"{false}"}</Code> and compose your own
            components with the hook plus <Code>&lt;TourRenderer /&gt;</Code>.
          </p>
        </Doc>

        <div className="docs-foot">
          That's everything. Questions or bugs →{" "}
          <a href="https://github.com" target="_blank" rel="noreferrer">
            open an issue
          </a>
          .
        </div>
      </article>
    </div>
  );
}

function Doc({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

function Callout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`callout ${className}`}>💡 {children}</div>;
}

function FileTree({ lines }: { lines: string[] }) {
  return (
    <pre className="filetree">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

function PropsTable({
  rows,
  head = ["Prop", "Type", "What it does"],
}: {
  rows: string[][];
  head?: string[];
}) {
  return (
    <div className="ptable-wrap">
      <table className="ptable">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              <td>
                <code className="inline-code">{r[0]}</code>
              </td>
              <td className="ptable-type">{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
