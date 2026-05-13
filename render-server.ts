// Production server for Render (Bun runtime).
// Serves the Vite client build from dist/client/* and proxies everything
// else to the TanStack Start SSR handler from dist/server/index.js.
//
// Usage in package.json:  "start": "NODE_ENV=production bun render-server.ts"
import { serve, file } from "bun";
import { join, extname } from "path";
import { stat } from "fs/promises";

const PORT = Number(process.env.PORT) || 10000;
const CLIENT_DIR = join(process.cwd(), "dist", "client");

const { default: handler } = await import("./dist/server/index.js");

const MIME: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

async function tryStaticFile(pathname: string): Promise<Response | null> {
  // Block path traversal
  if (pathname.includes("..")) return null;
  const filePath = join(CLIENT_DIR, pathname);
  try {
    const s = await stat(filePath);
    if (!s.isFile()) return null;
  } catch {
    return null;
  }
  const f = file(filePath);
  const ext = extname(pathname).toLowerCase();
  const headers: Record<string, string> = {
    "content-type": MIME[ext] ?? "application/octet-stream",
  };
  // Hashed assets are immutable
  if (pathname.startsWith("/assets/")) {
    headers["cache-control"] = "public, max-age=31536000, immutable";
  }
  return new Response(f, { headers });
}

serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // 1) Static assets first
    if (
      pathname.startsWith("/assets/") ||
      pathname.startsWith("/_build/") ||
      pathname === "/favicon.ico" ||
      pathname === "/robots.txt" ||
      pathname === "/manifest.json" ||
      /\.(js|mjs|css|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|map|txt)$/i.test(pathname)
    ) {
      const r = await tryStaticFile(pathname);
      if (r) return r;
      if (pathname.startsWith("/assets/")) {
        return new Response("Not found", { status: 404 });
      }
    }

    // 2) Hand off to the TanStack Start SSR handler
    try {
      return await handler.fetch(req, process.env, {});
    } catch (e) {
      console.error("[render-server] SSR error:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`🛡️  Labor Shield live on http://0.0.0.0:${PORT}`);
