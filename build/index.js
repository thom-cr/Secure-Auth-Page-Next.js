var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
};

// node_modules/@remix-run/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = {};
__export(entry_server_node_exports, {
  default: () => handleRequest
});
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx } from "react/jsx-runtime";
var ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  return userAgent ? "isbot" in isbotModule && typeof isbotModule.isbot == "function" ? isbotModule.isbot(userAgent) : "default" in isbotModule && typeof isbotModule.default == "function" ? isbotModule.default(userAgent) : !1 : !1;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = !1, { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = !0;
          let body = new PassThrough(), stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500, shellRendered && console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  loader: () => loader,
  meta: () => meta
});
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useLocation
} from "@remix-run/react";

// app/auth.ts
import { createCookie } from "@remix-run/node";
var secret = process.env.COOKIE_SECRET || "default";
secret === "default" && (console.warn("No COOKIE_SECRET set, the app is insecure."), secret = "default-secret");
var authCookie = createCookie("auth", {
  httpOnly: !0,
  path: "/",
  sameSite: "lax",
  secrets: [secret],
  secure: !0,
  maxAge: 2592e3
});

// app/root.tsx
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
async function loader({ request }) {
  let cookieString = request.headers.get("Cookie");
  return { userId: await authCookie.parse(cookieString) };
}
var meta = () => [{ title: "DEMO WEBSITE" }];
function App() {
  let { userId } = useLoaderData(), isRoot = useLocation().pathname === "/";
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx2("link", { rel: "icon", href: "data:image/x-icon;base64,AA" }),
      /* @__PURE__ */ jsx2(Meta, {}),
      /* @__PURE__ */ jsx2(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx2("h1", { className: " top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10", children: "DEMO WEBSITE" }),
      isRoot && /* @__PURE__ */ jsx2("div", { className: "fixed top-0 right-0 p-4", children: userId ? /* @__PURE__ */ jsx2(Link, { to: "/logout", children: /* @__PURE__ */ jsx2("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500", children: "Log out" }) }) : /* @__PURE__ */ jsx2(Link, { to: "/signup", children: /* @__PURE__ */ jsx2("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500", children: "Log in" }) }) }),
      /* @__PURE__ */ jsx2("div", { className: "pt-20", children: /* @__PURE__ */ jsx2(Outlet, {}) }),
      /* @__PURE__ */ jsx2(Scripts, {})
    ] })
  ] });
}

// app/routes/logout.tsx
var logout_exports = {};
__export(logout_exports, {
  loader: () => loader2
});
import { redirect } from "@remix-run/node";
async function loader2({ request }) {
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize("", { expires: /* @__PURE__ */ new Date(0) })
    }
  });
}

// app/routes/signup/route.tsx
var route_exports = {};
__export(route_exports, {
  action: () => action,
  default: () => Signup,
  meta: () => meta2
});
import { redirect as redirect2 } from "@remix-run/node";
import { Form, Link as Link2, useActionData } from "@remix-run/react";

// app/routes/signup/queries.ts
import crypto from "node:crypto";

// app/db/prisma.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();
process.on("beforeExit", () => {
  prisma.$disconnect();
});

// app/routes/signup/queries.ts
async function accountExists(email) {
  let account = await prisma.account.findUnique({
    where: { email },
    select: { id: !0 }
  });
  return Boolean(account);
}
async function createAccount(email, password) {
  let salt = crypto.randomBytes(16).toString("hex"), hash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha256").toString("hex");
  return prisma.account.create({
    data: {
      email,
      Password: {
        create: {
          hash,
          salt
        }
      }
    }
  });
}

// app/routes/signup/validate.ts
async function validate(email, password) {
  let errors = {};
  return email ? email.includes("@") || (errors.email = "Please enter a valid email address") : errors.email = "Email is required", await accountExists(email) && (errors.email = "An account with this email already exists"), password ? password.length < 8 && (errors.password = "Password must be at least 8 characters") : errors.password = "Password is required", Object.keys(errors).length ? errors : null;
}

// app/routes/signup/route.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
async function action({ request }) {
  let formData = await request.formData(), email = String(formData.get("email")), password = String(formData.get("password")), errors = await validate(email, password);
  if (errors)
    return { errors };
  let user = await createAccount(email, password);
  return redirect2("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize(user.id)
    }
  });
}
var meta2 = () => [{ title: "DEMO | Signup" }];
function Signup() {
  let actionData = useActionData(), emailError = actionData?.errors?.email, passwordError = actionData?.errors?.password;
  return /* @__PURE__ */ jsxs2("div", { className: "flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx3("div", { className: "sm:mx-auto sm:w-full sm:max-w-wd", children: /* @__PURE__ */ jsx3("h2", { id: "signup-header", className: "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900", children: "Sign Up" }) }),
    /* @__PURE__ */ jsx3("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]", children: /* @__PURE__ */ jsxs2("div", { className: "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12", children: [
      /* @__PURE__ */ jsxs2(Form, { className: "space-y-6", method: "post", children: [
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsxs2("label", { htmlFor: "email", className: "block text-sm font-medium leading-6 text-gray-900", children: [
            "Email address ",
            " ",
            emailError && /* @__PURE__ */ jsxs2("span", { className: "text-red-500", children: [
              " ",
              emailError,
              " "
            ] })
          ] }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              autoFocus: !0,
              id: "email",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: !0,
              className: "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs2("div", { children: [
          /* @__PURE__ */ jsxs2("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900", children: [
            "Password ",
            " ",
            passwordError && /* @__PURE__ */ jsxs2("span", { className: "text-red-500", children: [
              " ",
              passwordError,
              " "
            ] })
          ] }),
          /* @__PURE__ */ jsx3(
            "input",
            {
              id: "password",
              name: "password",
              type: "password",
              autoComplete: "current-password",
              "aria-describedby": "password-error",
              required: !0,
              className: "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            }
          )
        ] }),
        /* @__PURE__ */ jsx3("div", { children: /* @__PURE__ */ jsx3("button", { type: "submit", className: "flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", children: "Sign in" }) })
      ] }),
      /* @__PURE__ */ jsx3("div", { className: "fixed left-0 p-4", children: /* @__PURE__ */ jsx3(Link2, { to: "/", children: /* @__PURE__ */ jsx3("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "Back" }) }) })
    ] }) })
  ] });
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-SG7NJ4BG.js", imports: ["/build/_shared/chunk-WXYZDEJH.js", "/build/_shared/chunk-Q3IECNXJ.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-BDI26IEO.js", imports: ["/build/_shared/chunk-XID6SJQA.js"], hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/logout": { id: "routes/logout", parentId: "root", path: "logout", index: void 0, caseSensitive: void 0, module: "/build/routes/logout-GPTXG6BX.js", imports: void 0, hasAction: !1, hasLoader: !0, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-JNPYB4GK.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "9a4f4edb", hmr: void 0, url: "/build/manifest-9A4F4EDB.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "production", assetsBuildDirectory = "public\\build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, unstable_singleFetch: !1, unstable_fogOfWar: !1 }, publicPath = "/build/", entry = { module: entry_server_node_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: logout_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: route_exports
  }
};
export {
  assets_manifest_default as assets,
  assetsBuildDirectory,
  entry,
  future,
  mode,
  publicPath,
  routes
};
