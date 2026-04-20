import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use("*", (_req, res) => {
    res.status(200).json({ status: "ok", message: "CoachAthleteConnect API" });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`CoachAthleteConnect API serving on port ${port}`);
  });
})();
