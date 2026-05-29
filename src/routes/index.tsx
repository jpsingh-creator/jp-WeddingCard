import { createFileRoute } from "@tanstack/react-router";
import { WeddingCard, validateSearch, headFn } from "@/components/wedding/WeddingCard";

export const Route = createFileRoute("/")({
  validateSearch,
  head: headFn,
  component: WeddingCard,
});