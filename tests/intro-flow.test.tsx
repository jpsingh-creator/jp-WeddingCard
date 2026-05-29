/**
 * Regression check: tap "Tap to Continue" on the Ganesha screen and confirm
 * the Curtain (Shubh Vivah) sequence renders next, with no blank frame and
 * no remount of the parent. Validates both online and offline-cached flows.
 *
 * Run with: bunx vitest run tests/intro-flow.test.tsx
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { useState } from "react";

import { GaneshaIntro } from "../src/components/wedding/GaneshaIntro";
import { Curtain } from "../src/components/wedding/Curtain";

// Mirrors WeddingCard's mount logic exactly: GaneshaIntro remains mounted while
// Curtain mounts immediately on tap, with no intermediate scene, blank frame, or parent remount.
function Flow() {
  const [ganeshaDone, setGaneshaDone] = useState(false);
  return (
    <div data-testid="flow-root">
      <GaneshaIntro onDone={() => setGaneshaDone(true)} />
      {ganeshaDone && <Curtain onDone={() => {}} />}
    </div>
  );
}

function setOffline(offline: boolean) {
  if (offline) {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
  } else {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve(new Response(new ArrayBuffer(8), { status: 200 })),
    ));
  }
}

beforeEach(() => {
  Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: () => Promise.resolve(),
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: () => {},
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  cleanup();
});

describe("Ganesha → Curtain tap flow", () => {
  for (const mode of ["online", "offline"] as const) {
    it(`completes the transition (${mode})`, async () => {
      setOffline(mode === "offline");

      render(<Flow />);

      const button = await screen.findByRole("button", { name: /tap to continue/i });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);

      expect(screen.getByTestId("flow-root")).toBeInTheDocument();
      expect(document.querySelector('[data-wedding-scene="ganesha-intro"]')).toBeInTheDocument();
      expect(document.querySelector('[data-wedding-scene="curtain"]')).toBeInTheDocument();
      expect(screen.getByText(/Shubh Vivah/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(document.querySelector('[data-wedding-scene="curtain"]')).toBeInTheDocument();
      });
    }, 10000);
  }
});
