import { createFileRoute } from "@tanstack/react-router";
import { WeddingCard, validateSearch, headFn } from "@/components/wedding/WeddingCard";

// Alias route — mounts the exact same component as "/" so the
// tap-to-continue transition logic is bit-for-bit identical (no extra
// Suspense boundary, no extra remount, no blank frame).
export const Route = createFileRoute("/p100")({
  validateSearch,
  head: headFn,
  component: WeddingCard,
});