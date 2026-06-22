import { useOnboardingContext } from "../context";
import { useOnboarding } from "../hooks/useOnboarding";
import type { TourConfig } from "../types";
import { cn } from "../utils/cn";

function onRoute(tour: TourConfig, path: string): boolean {
  if (!tour.route) return true;
  switch (tour.routeMatchMode ?? "exact") {
    case "startsWith":
      return path.startsWith(tour.route);
    case "regex":
      return new RegExp(tour.route).test(path);
    default:
      return path === tour.route;
  }
}

export function Checklist() {
  const {
    journey,
    checklistOpen,
    toggleChecklist,
    setChecklistOpen,
    completedSteps,
    completedCount,
    totalSteps,
    progressPercent,
    onboardingCompleted,
    getTourById,
    startTour,
    setPendingTour,
    navigate,
  } = useOnboarding();
  const { config } = useOnboardingContext();

  if (!journey) return null;

  const launch = (tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) return;
    if (!tour.route || onRoute(tour, config.currentPath)) {
      startTour(tourId);
    } else {
      setPendingTour(tourId);
      navigate?.(tour.route);
    }
  };

  // Where the "Go" button sends the user: the step's own route, or — when the
  // step is paired with a tour — that tour's route, so route isn't declared twice.
  const goRoute = (s: (typeof journey.steps)[number]): string | undefined =>
    s.route ?? (s.tourId ? getTourById(s.tourId)?.route : undefined);

  // Collapsed pill.
  if (!checklistOpen) {
    return (
      <button
        type="button"
        className="rgj-pill"
        onClick={() => setChecklistOpen(true)}
      >
        <span className="rgj-pill-ring">{progressPercent}%</span>
        <span className="rgj-pill-label">
          {onboardingCompleted ? "All set!" : journey.checklistTitle}
        </span>
      </button>
    );
  }

  // Render in array order by default; respect `order` only where it's set.
  const steps = journey.steps
    .map((s, index) => ({ s, index }))
    .sort((a, b) => (a.s.order ?? a.index) - (b.s.order ?? b.index))
    .map(({ s }) => s);

  return (
    <div
      className="rgj-checklist"
      role="dialog"
      aria-label={journey.checklistTitle}
    >
      <div className="rgj-checklist-head">
        <div>
          <p className="rgj-checklist-title">{journey.checklistTitle}</p>
          <p className="rgj-checklist-sub">
            {completedCount} of {totalSteps} complete
          </p>
        </div>
        <button
          type="button"
          className="rgj-close"
          aria-label="Minimize checklist"
          onClick={() => toggleChecklist()}
        >
          ✕
        </button>
      </div>

      <div className="rgj-progress">
        <div
          className="rgj-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="rgj-checklist-list">
        {steps.map((s) => {
          const done = completedSteps.includes(s.id);
          return (
            <li key={s.id} className={cn("rgj-task", done && "rgj-task-done")}>
              <span className="rgj-check">{done ? "✓" : ""}</span>
              {s.icon != null && (
                <span className="rgj-task-icon" aria-hidden="true">
                  {s.icon}
                </span>
              )}
              <div className="rgj-task-body">
                <p className="rgj-task-title">{s.title}</p>
                {s.description && (
                  <p className="rgj-task-desc">{s.description}</p>
                )}
              </div>
              {!done && (
                <div className="rgj-task-actions">
                  {s.tourId ? (
                    <button
                      type="button"
                      className="rgj-btn rgj-btn-sm"
                      onClick={() => launch(s.tourId as string)}
                    >
                      Show me how
                    </button>
                  ) : (
                    s.action && (
                      <button
                        type="button"
                        className="rgj-btn rgj-btn-sm"
                        onClick={() => {
                          setChecklistOpen(false);
                          s.action?.onClick();
                        }}
                      >
                        {s.action.label}
                      </button>
                    )
                  )}
                  {(() => {
                    const route = goRoute(s);
                    return (
                      route && (
                        <button
                          type="button"
                          className="rgj-btn rgj-btn-sm rgj-btn-ghost"
                          onClick={() => {
                            setChecklistOpen(false);
                            navigate?.(route);
                          }}
                        >
                          Go
                        </button>
                      )
                    );
                  })()}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
