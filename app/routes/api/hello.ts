import { createAPIFileRoute } from "@tanstack/start/api";

export const Route = createAPIFileRoute("/api/hello")({
  GET: async ({ request }) => {
    const hostname = request.headers.get("host");
    return new Response("Hello, World! from " + hostname);
  },
});
