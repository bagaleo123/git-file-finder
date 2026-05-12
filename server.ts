import { serve } from "bun";
import { join } from "path";

const PORT = process.env.PORT || 10000;

// Import the actual TanStack Start handler
const { default: handler } = await import("./dist/server/index.js");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // FIX: If the path starts with /assets, look in dist/client/assets
    if (url.pathname.startsWith("/assets/")) {
      const filePath = join(process.cwd(), "dist", "client", url.pathname);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    // Otherwise, let the TanStack App handle it
    return handler.fetch(req);
  },
});

console.log(`Server is running on port ${PORT}`);
