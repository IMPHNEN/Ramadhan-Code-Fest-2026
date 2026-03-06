import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { swaggerUI } from "@hono/swagger-ui";
import { swaggerSpec } from "./docs/swagger";
import puasa from "./routes/puasa";
import ibadah from "./routes/ibadah";
import target from "./routes/target";

const app = new Hono();

// Global Middleware
app.use("*", cors());
app.use("*", prettyJSON());
app.use("*", logger());

// Swagger docs
app.get("/docs", swaggerUI({ url: "/docs/spec " }));
app.get("/docs/spec", (c) => c.json(swaggerSpec));

// API Test
app.get("/test", (c) => {
  return c.json({
    success: true,
    message: "Ramadan Tracker API is running",
    version: "1.0.0",
    timestamp: new Date().toLocaleDateString("id-ID"),
  });
});

// Routes
app.route("/api/puasa", puasa);
app.route("/api/ibadah", ibadah);
app.route("/api/target", target);

// 404 handler
app.notFound((c) => {
  return c.json(
    { success: false, message: `Route ${c.req.path} tidak ditemukan` },
    404,
  );
});

// Error handler
app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`);
  return c.json({ success: false, message: "Internal server error" }, 500);
});

const PORT = Number(process.env.PORT);

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`Ramadan Tracker API is running in http://localhost:${PORT}`);
