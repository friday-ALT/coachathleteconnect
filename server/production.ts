import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      console.log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Health check (before routes so it's always fast)
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

(async () => {
  try {
    const server = await registerRoutes(app);

    // Serve the Vite-built frontend from dist/public
    // When bundled by esbuild to dist/, __dirname === dist/
    // so path.resolve(__dirname, "public") === dist/public — the Vite output dir.
    const distPath = path.resolve(__dirname, "public");

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      // SPA fallback: serve index.html for any unmatched route
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
      console.log(`Serving frontend from ${distPath}`);
    } else {
      // No frontend build — API-only mode (e.g. mobile backend)
      app.use("*", (_req, res) => {
        res.status(200).json({ status: "ok", message: "CoachAthleteConnect API" });
      });
      console.warn("No frontend build found — API-only mode. Run `npm run build` to include the web client.");
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, "0.0.0.0", () => {
      console.log(`CoachAthleteConnect running on port ${port}`);
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
})();
