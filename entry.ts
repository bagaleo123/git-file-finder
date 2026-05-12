import { serve } from "bun";
import { join } from "path";

const PORT = process.env.PORT || 10000;

// This pulls in the core logic from your build
const { default: handler } = await import("./dist/server/index.js");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // If the browser asks for /assets, manually go get them from dist/client
    if (url.pathname.startsWith("/assets/")) {
      const path = join(process.cwd(), "dist", "client", url.pathname);
      const file = Bun.file(path);
      
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // Otherwise, let the TanStack App handle the request
    return handler.fetch(req);
  },
});

console.log(`🚀 Labor Shield is live on port ${PORT}`);
