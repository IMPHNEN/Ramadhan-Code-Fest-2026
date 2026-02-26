import http from "http";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

import React from "react";
import { renderToString } from "react-dom/server";

import { getMimeType } from "./utils/mime-types";
import { renderErrorOverlay } from "./utils/error-overlay";
import { flushHead } from "./lib/head";

import { generateRoutes } from "./utils/generate-routes";
import { buildClient } from "./utils/build";

const START_TIME = Date.now();

export function createServer(port = 3000) {
  // Build Client on Start
  const init = async () => {
    try {
      generateRoutes();
      await buildClient();
    } catch (e) {
      console.error("Build failed:", e);
    }
  };

  init().then(() => {
    const server = http.createServer(async (req, res) => {
      // ... (rest of the server logic is largely the same, minor injection update)
      if (req.url === "/_okegas/status") {
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify({ timestamp: START_TIME }));
        return;
      }

      const urlParts = req.url?.split("?") || [];
      let pathName = urlParts[0];

      if (pathName !== "/_okegas/status") {
        console.log("[Request]", pathName);
      }

      // 1. Static Assets Handling (public folder)
      const publicDir = path.join(__dirname, "../public");
      let relativePath = pathName === "/" ? "index.html" : pathName;
      // Normalize absolute paths for joining
      if (relativePath.startsWith("/")) relativePath = relativePath.slice(1);

      const publicFilePath = path.join(publicDir, relativePath);

      if (pathName !== "/_okegas/status") {
        // console.log("[Static Check]", publicFilePath);
      }

      // Security Check: Path Traversal
      if (
        publicFilePath.startsWith(publicDir) &&
        fs.existsSync(publicFilePath)
      ) {
        if (fs.statSync(publicFilePath).isFile()) {
          if (pathName !== "/_okegas/status")
            console.log("[Static Serve]", pathName);
          const mimeType = getMimeType(publicFilePath);
          res.writeHead(200, { "Content-Type": mimeType });
          fs.createReadStream(publicFilePath).pipe(res);
          return;
        }
      }

      // 2. API Routes Handling
      if (pathName.startsWith("/api/")) {
        const apiPath = path.join(__dirname, "pages", pathName + ".ts");
        const apiDir = path.join(__dirname, "pages/api");
        if (apiPath.startsWith(apiDir) && fs.existsSync(apiPath)) {
          try {
            delete require.cache[require.resolve(apiPath)];
            const handler = require(apiPath).default;
            handler(req, res);
          } catch (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
          }
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "API Route Not Found" }));
        }
        return;
      }

      // Ignore favicon
      if (pathName === "/favicon.ico" || pathName.startsWith("/.well-known")) {
        res.writeHead(404);
        res.end();
        return;
      }

      if (pathName === "/") pathName = "/index";

      const query = new URLSearchParams(urlParts[1] || "");
      const lang = query.get("lang") || "id";

      const pagesDir = path.join(__dirname, "pages");
      let pagePath = path.join(pagesDir, pathName + ".tsx");
      let routeParams: Record<string, string> = {};

      // Security Check: LFI Protection
      if (!pagePath.startsWith(pagesDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      // Dynamic Route Resolution
      if (!fs.existsSync(pagePath)) {
        const pathParts = pathName.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          const dirName = pathParts.slice(0, -1).join("/");
          const paramValue = pathParts[pathParts.length - 1];
          const dirPath = path.join(__dirname, "pages", dirName);

          if (dirPath.startsWith(pagesDir) && fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            const dynamicFile = files.find(
              (f) => f.startsWith("[") && f.endsWith("].tsx"),
            );
            if (dynamicFile) {
              pagePath = path.join(dirPath, dynamicFile);
              const paramName = dynamicFile.slice(1, -5);
              routeParams = { [paramName]: paramValue };
            }
          }
        }
      }

      let initialProps = { lang, params: routeParams };

      const okegasData = {
        props: { pageProps: initialProps },
        page: pathName, // Use pathName as the route key
        query: Object.fromEntries(query.entries()),
        params: routeParams,
        buildId: "development",
      };

      // SPA Navigation Support: Return JSON if requested by client router
      if (req.headers["x-okegas-data"] === "1") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(okegasData));
        return;
      }

      const appPath = path.join(__dirname, "pages", "_app.tsx");

      let htmlContent = "";
      try {
        if (pagePath.startsWith(pagesDir) && fs.existsSync(pagePath)) {
          const mod = require(pagePath);
          const Page = mod.default;

          if (mod.getServerSideProps) {
            try {
              const data = await mod.getServerSideProps({
                req,
                res,
                query: Object.fromEntries(query.entries()),
                params: routeParams,
              });
              if (data.props) {
                initialProps = { ...initialProps, ...data.props };
                okegasData.props.pageProps = initialProps;
              }
            } catch (dataErr) {
              console.error("Error in getServerSideProps:", dataErr);
            }
          }

          // Safe JSON serialization
          const safeData = JSON.stringify(okegasData).replace(/</g, "\\u003c");
          const dataScript = `<script id="_OKEGAS_DATA_" type="application/json">${safeData}</script>`;
          const clientScript = `<script src="/_okegas/client.bundle.js"></script>`;

          res.writeHead(200, { "Content-Type": "text/html" });

          flushHead();

          let rawHtml = "";
          let App = null;

          if (fs.existsSync(appPath)) {
            App = require(appPath).default;
            rawHtml = renderToString(
              React.createElement(App, {
                Component: Page,
                pageProps: initialProps,
              }),
            );
          } else {
            rawHtml = renderToString(React.createElement(Page, initialProps));
          }

          const headNodes = flushHead();
          const headHtml = renderToString(
            React.createElement(React.Fragment, null, headNodes),
          );

          if (rawHtml.includes("</head>")) {
            rawHtml = rawHtml.replace("</head>", `${headHtml}</head>`);
          }

          if (rawHtml.includes("<body")) {
            console.log("[Server] Injecting scripts into Body");
            rawHtml = rawHtml.replace(
              /(<body[^>]*>)/,
              '$1<div id="__okegasjs">',
            );
            rawHtml = rawHtml.replace(
              "</body>",
              `</div>${dataScript}${clientScript}</body>`,
            );
          } else {
            console.log("[Server] Injecting scripts (No Body detected)");
            rawHtml = `<div id="__okegasjs">${rawHtml}</div>${dataScript}${clientScript}`;
          }

          htmlContent = "<!DOCTYPE html>" + rawHtml;
        } else {
          console.log(`[404] ${pagePath}`);
          res.writeHead(404, { "Content-Type": "text/html" });

          const notFoundPath = path.join(__dirname, "pages", "_404.tsx");
          let content404 = "<h1>404 - Page Not Found</h1>";

          if (fs.existsSync(notFoundPath)) {
            const Page404 = require(notFoundPath).default;
            let rawHtml = "";
            const safeData = JSON.stringify({
              ...okegasData,
              page: "/404",
            }).replace(/</g, "\\u003c");
            const dataScript = `<script id="_OKEGAS_DATA_" type="application/json">${safeData}</script>`;
            const clientScript = `<script src="/_okegas/client.bundle.js"></script>`;

            if (fs.existsSync(appPath)) {
              const App = require(appPath).default;
              rawHtml = renderToString(
                React.createElement(App, {
                  Component: Page404,
                  pageProps: initialProps,
                }),
              );
            } else {
              rawHtml = renderToString(
                React.createElement(Page404, initialProps),
              );
            }

            if (rawHtml.includes("<body")) {
              rawHtml = rawHtml.replace(
                /(<body[^>]*>)/,
                '$1<div id="__okegasjs">',
              );
              rawHtml = rawHtml.replace(
                "</body>",
                `</div>${dataScript}${clientScript}</body>`,
              );
            } else {
              rawHtml = `<div id="__okegasjs">${rawHtml}</div>${dataScript}${clientScript}`;
            }
            content404 = "<!DOCTYPE html>" + rawHtml;
          }
          htmlContent = content404;
        }
      } catch (err: any) {
        console.error(err);
        htmlContent = renderErrorOverlay(err);
      }

      // Live Reload and Route Announcer (Keep existing)
      const liveReloadScript = `
            <script>
            (function() {
                let lastTimestamp = ${START_TIME};
                let isChecking = false;
                console.log("Hot Reload Active");
                setInterval(async () => {
                    if(isChecking) return;
                    isChecking = true;
                    try {
                        const res = await fetch("/_okegas/status");
                        const data = await res.json();
                        if (lastTimestamp && lastTimestamp !== data.timestamp) {
                            window.location.reload();
                        }
                        lastTimestamp = data.timestamp;
                    } catch (e) {
                    } finally {
                        isChecking = false;
                    }
                }, 1000);
            })();
            </script>
        `;

      let finalHtml = htmlContent;
      if (finalHtml.includes("</head>")) {
        finalHtml = finalHtml.replace("</head>", `${liveReloadScript}</head>`);
      } else {
        finalHtml += liveReloadScript;
      }

      const announcer = `<okegas-route-announcer style="display:none" data-path="${pathName}"></okegas-route-announcer>`;
      if (finalHtml.includes("</html>")) {
        finalHtml = finalHtml.replace("</html>", `${announcer}</html>`);
      } else {
        finalHtml += announcer;
      }

      const reqStart = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - reqStart;
        const statusDetails =
          res.statusCode >= 400
            ? `\x1b[31m${res.statusCode}\x1b[0m`
            : `\x1b[32m${res.statusCode}\x1b[0m`;
        const method = `\x1b[36m${req.method}\x1b[0m`;
        const path = `\x1b[33m${req.url}\x1b[0m`;
        const time = `\x1b[90m${duration}ms\x1b[0m`;

        if (req.url !== "/_okegas/status") {
          console.log(
            `[${new Date().toLocaleTimeString()}] ${method} ${path} -> ${statusDetails} (${time})`,
          );
        }
      });

      res.end(finalHtml);
    });

    server.listen(port, () => {
      process.stdout.write(
        String.fromCharCode(27) + "]0;okegas/server" + String.fromCharCode(7),
      );
      console.log(`OkeGasJS running at http://localhost:${port}`);
      smartOpenBrowser(`http://localhost:${port}`);
    });
  });
}

function smartOpenBrowser(url: string) {
  const lockFile = path.join(__dirname, "../.browser_lock");
  const currentPPID = process.ppid;

  let shouldOpen = true;

  try {
    if (fs.existsSync(lockFile)) {
      const lockData = JSON.parse(fs.readFileSync(lockFile, "utf-8"));
      if (lockData.ppid === currentPPID) {
        shouldOpen = false;
      }
    }
  } catch (e) {}

  if (shouldOpen) {
    try {
      fs.writeFileSync(lockFile, JSON.stringify({ ppid: currentPPID }));
    } catch (e) {}

    const platform = process.platform;
    if (platform === "win32") {
      spawn("cmd", ["/c", "start", "", url]);
    } else if (platform === "darwin") spawn("open", [url]);
    else spawn("xdg-open", [url]);
  }
}
