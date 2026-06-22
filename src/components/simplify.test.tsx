import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DiscoveryConfig, JourneyConfig, TourConfig } from "../types";
import { DiscoveryBanner } from "./DiscoveryBanner";
import { OnboardingProvider } from "./OnboardingProvider";

const floating: DiscoveryConfig = {
  id: "tip-float",
  title: "Floating tip",
  body: "I pin to a corner.",
  placement: "bottom-right",
};

const inline: DiscoveryConfig = {
  id: "tip-inline",
  title: "Inline tip",
  body: "I sit in the layout.",
};

describe("discovery auto-render + dedupe", () => {
  it("renders a floating discovery automatically from config", async () => {
    render(
      <OnboardingProvider
        config={{
          tours: [],
          discoveries: [floating],
          currentPath: "/",
          userId: "d1",
        }}
      >
        <div />
      </OnboardingProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByText("Floating tip")).toHaveLength(1),
    );
  });

  it("does not duplicate when a floating tip is also mounted manually", async () => {
    render(
      <OnboardingProvider
        config={{
          tours: [],
          discoveries: [floating],
          currentPath: "/",
          userId: "d2",
        }}
      >
        <DiscoveryBanner id="tip-float" />
      </OnboardingProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByText("Floating tip")).toHaveLength(1),
    );
  });

  it("does NOT auto-render an inline tip until the component is placed", async () => {
    const { rerender } = render(
      <OnboardingProvider
        config={{
          tours: [],
          discoveries: [inline],
          currentPath: "/",
          userId: "d3",
        }}
      >
        <div />
      </OnboardingProvider>,
    );
    await waitFor(() => expect(screen.queryByText("Inline tip")).toBeNull());

    rerender(
      <OnboardingProvider
        config={{
          tours: [],
          discoveries: [inline],
          currentPath: "/",
          userId: "d3",
        }}
      >
        <DiscoveryBanner id="tip-inline" />
      </OnboardingProvider>,
    );
    await waitFor(() => expect(screen.getByText("Inline tip")).toBeTruthy());
  });

  it("still renders floating tips manually in headless mode", async () => {
    render(
      <OnboardingProvider
        renderDefaultUI={false}
        config={{
          tours: [],
          discoveries: [floating],
          currentPath: "/",
          userId: "d4",
        }}
      >
        <DiscoveryBanner id="tip-float" />
      </OnboardingProvider>,
    );
    await waitFor(() =>
      expect(screen.getAllByText("Floating tip")).toHaveLength(1),
    );
  });
});

describe("tour → checklist-step auto-link", () => {
  const tours: TourConfig[] = [
    {
      id: "dash",
      title: "Dashboard",
      steps: [{ id: "a", title: "A", content: "a" }], // centered (no target)
    },
  ];
  const journeys: JourneyConfig[] = [
    {
      checklistTitle: "Getting started",
      // Step links to the tour via tourId only — no checklistStepId on the tour.
      steps: [{ id: "see-dash", title: "See dashboard", tourId: "dash" }],
    },
  ];

  it("completes the linked step when its tour finishes", async () => {
    render(
      <OnboardingProvider
        config={{ tours, journeys, currentPath: "/", userId: "t1" }}
      >
        <div />
      </OnboardingProvider>,
    );

    // Open the checklist pill, launch the tour, finish it.
    await waitFor(() =>
      expect(screen.getByText("Getting started")).toBeTruthy(),
    );
    fireEvent.click(screen.getByText("Getting started"));
    fireEvent.click(screen.getByText("Show me how"));
    await waitFor(() => expect(screen.getByText("Finish")).toBeTruthy());
    fireEvent.click(screen.getByText("Finish"));

    // The linked step is now complete, so the collapsed pill reads "All set!".
    await waitFor(() => expect(screen.getByText("All set!")).toBeTruthy());
  });
});
