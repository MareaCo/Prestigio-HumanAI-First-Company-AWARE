import { createFileRoute } from "@tanstack/react-router";
import { MainAppRouter } from "@/components/MainAppRouter";

export const Route = createFileRoute("/")({
  component: MainAppRouter,
});
