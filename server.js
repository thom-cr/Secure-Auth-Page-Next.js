import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createRequestHandler } from "@remix-run/express";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static("build/client")
);

const build = viteDevServer
  ? () =>
      viteDevServer.ssrLoadModule(
        "virtual:remix/server-build"
      )
  : await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

const server = https.createServer(
  {
    key: fs.readFileSync(path.resolve(__dirname, "key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "cert.pem")),
  },
  app
);

const port = 4444;
server.listen(port, () => {
  console.log(`App listening on https://localhost:${port}`);
});
