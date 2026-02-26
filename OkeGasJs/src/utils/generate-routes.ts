import fs from "fs";
import path from "path";

const PAGES_DIR = path.join(__dirname, "../pages");
const OUTPUT_FILE = path.join(__dirname, "../okegas-routes.ts");

export function generateRoutes() {
  if (!fs.existsSync(PAGES_DIR)) return;

  const files = fs.readdirSync(PAGES_DIR);
  const imports: string[] = [];
  const mappings: string[] = [];

  files.forEach((file) => {
    if (
      (file.endsWith(".tsx") || file.endsWith(".ts")) &&
      !file.startsWith("_")
    ) {
      const name = file.replace(/\.(tsx|ts)$/, "");
      // Convert filename to Route Key (e.g., 'index' -> '/', 'prabowo' -> '/prabowo')
      const routeKey = name === "index" ? "/" : `/${name}`;

      // Clean variable name (remove special chars)
      const varName = "Page_" + name.replace(/[^a-zA-Z0-9]/g, "_");

      imports.push(`import ${varName} from "./pages/${name}";`);
      mappings.push(`  "${routeKey}": ${varName},`);

      // For index page, also add /index route since server converts / to /index
      if (name === "index") {
        mappings.push(`  "/index": ${varName}, // Server converts / to /index`);
      }
    }
  });

  // Also include _app if it exists, special handling
  if (fs.existsSync(path.join(PAGES_DIR, "_app.tsx"))) {
    imports.push(`import App from "./pages/_app";`);
  }

  const content = `// This file is auto-generated. Do not edit.
import React from "react";
${imports.join("\n")}

export const routes: Record<string, any> = {
${mappings.join("\n")}
};

export const AppLayout = ${fs.existsSync(path.join(PAGES_DIR, "_app.tsx")) ? "App" : "null"};
`;

  if (fs.existsSync(OUTPUT_FILE)) {
    const existing = fs.readFileSync(OUTPUT_FILE, "utf-8");
    if (existing === content) {
      // No changes, skip write to avoid restart loop
      return;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`[OkeGas] Routes generated at ${OUTPUT_FILE}`);
}
