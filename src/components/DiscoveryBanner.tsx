import { createPortal } from "react-dom";
import { useOnboardingContext } from "../context";
import { useOnboarding } from "../hooks/useOnboarding";
import type { DiscoveryConfig } from "../types";
import { cn } from "../utils/cn";

interface DiscoveryBannerProps {
  /** Discovery id to render. Hidden once dismissed. */
  id: string;
}

function isFloating(d: DiscoveryConfig): boolean {
  return (d.placement ?? "inline") !== "inline";
}

/**
 * The actual tip card. Shared by the public `<DiscoveryBanner>` and the
 * provider's auto-renderer so both paths render identical markup/behaviour.
 * Floating tips are portaled to <body> so an ancestor's stacking context
 * (e.g. a parent with a CSS transform/animation) can't trap them behind other
 * fixed UI like a sticky header.
 */
function DiscoveryCard({ d }: { d: DiscoveryConfig }) {
  const { dismissDiscovery } = useOnboarding();
  const placement = d.placement ?? "inline";
  const floating = placement !== "inline";

  const card = (
    <div
      className={cn(
        "rgj-discovery",
        floating && "rgj-discovery-float",
        floating && `rgj-discovery-${placement}`,
      )}
      role="status"
      style={d.accent ? { ["--rgj-tip" as string]: d.accent } : undefined}
    >
      {d.icon != null && <span className="rgj-discovery-icon">{d.icon}</span>}
      <div className="rgj-discovery-main">
        <p className="rgj-discovery-title">{d.title}</p>
        <div className="rgj-discovery-text">{d.body}</div>
        {d.action && (
          <button
            type="button"
            className="rgj-btn rgj-btn-sm rgj-btn-primary rgj-discovery-action"
            onClick={() => {
              d.action?.onClick();
              dismissDiscovery(d.id);
            }}
          >
            {d.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        className="rgj-close"
        aria-label="Dismiss tip"
        onClick={() => dismissDiscovery(d.id)}
      >
        ✕
      </button>
    </div>
  );

  return floating ? createPortal(card, document.body) : card;
}

/**
 * A discovery "tip" — a small dismissible highlight for a feature or page.
 *
 * Renders inline by default. Floating tips (placement: "bottom-right" |
 * "bottom-left" | "top-right" | "top-left") are rendered automatically by the
 * provider, so you only need this component to place an **inline** tip at a
 * specific spot in your layout. Mounting it for a floating tip is harmless — it
 * no-ops to avoid a duplicate (unless you've set `renderDefaultUI={false}`, in
 * which case it renders the floating tip itself).
 */
export function DiscoveryBanner({ id }: DiscoveryBannerProps) {
  const { discoveriesForRole, dismissedDiscoveries } = useOnboarding();
  const { autoDiscoveries } = useOnboardingContext();

  const d = discoveriesForRole.find((x) => x.id === id);
  if (!d || dismissedDiscoveries.includes(id)) return null;

  // The provider already renders floating tips globally — don't double up.
  if (isFloating(d) && autoDiscoveries) return null;

  return <DiscoveryCard d={d} />;
}

/**
 * Renders every floating discovery (for the current role) automatically.
 * Mounted by the provider in default-UI mode so consumers don't have to wire a
 * `<DiscoveryBanner>` for corner tips — they "just show" from config, like the
 * checklist and tours. Inline tips still use `<DiscoveryBanner>` for placement.
 */
export function AutoDiscoveries() {
  const { discoveriesForRole, dismissedDiscoveries } = useOnboarding();

  return (
    <>
      {discoveriesForRole
        .filter((d) => isFloating(d) && !dismissedDiscoveries.includes(d.id))
        .map((d) => (
          <DiscoveryCard key={d.id} d={d} />
        ))}
    </>
  );
}
