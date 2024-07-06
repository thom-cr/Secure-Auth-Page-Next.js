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
  links: () => links,
  meta: () => meta
});
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLocation
} from "@remix-run/react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var links = () => [
  { href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css", rel: "stylesheet", integrity: "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" }
], meta = () => [{ title: "DEMO WEBSITE" }];
function App() {
  let isRoot = useLocation().pathname === "/";
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx2("link", { rel: "icon", href: "data:image/x-icon;base64,AA" }),
      /* @__PURE__ */ jsx2(Meta, {}),
      /* @__PURE__ */ jsx2(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx2("h1", { className: " top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10", children: "DEMO WEBSITE" }),
      isRoot && /* @__PURE__ */ jsx2("div", { className: "fixed top-0 right-0 p-4", children: /* @__PURE__ */ jsx2(Link, { to: "/signup", children: /* @__PURE__ */ jsx2("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500", children: "Sign Up" }) }) }),
      /* @__PURE__ */ jsx2("div", { className: "pt-20", children: /* @__PURE__ */ jsx2(Outlet, {}) }),
      /* @__PURE__ */ jsx2(Scripts, {}),
      /* @__PURE__ */ jsx2("script", { src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js", integrity: "sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" })
    ] })
  ] });
}

// app/routes/signup.tsx
var signup_exports = {};
__export(signup_exports, {
  action: () => action,
  default: () => Signup,
  meta: () => meta2
});
import { Form, Link as Link2, useActionData } from "@remix-run/react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var meta2 = () => [{ title: "DEMO | Signup" }];
async function action({ request }) {
  let formData = await request.formData(), email = String(formData.get("email")), password = String(formData.get("password")), errors = {};
  return email ? email.includes("@") || (errors.email = "Please enter a valid email address") : errors.email = "Email is required", password ? password.length < 8 && (errors.password = "Password must be at least 8 characters") : errors.password = "Password is required", {
    errors: Object.keys(errors).length ? errors : null
  };
}
function Signup() {
  let actionDate = useActionData(), emailError = actionData?.errors?.email, passwordError = actionData?.errors?.password;
  return /* @__PURE__ */ jsxs2("div", { className: "flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx3("div", { className: "sm:mx-auto sm:w-full sm:max-w-wd", children: /* @__PURE__ */ jsx3("h2", { id: "signup-header", className: "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900", children: "Sign Up" }) }),
    /* @__PURE__ */ jsx3("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]", children: /* @__PURE__ */ jsx3("div", { className: "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12", children: /* @__PURE__ */ jsxs2(Form, { className: "space-y-6", method: "post", children: [
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsxs2("label", { htmlFor: "email", className: "block text-sm font-medium leading-6 text-gray-900", children: [
          "Email address ",
          " ",
          emailError && /* @__PURE__ */ jsx3("span", { className: "text-red-500", children: emailError })
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
          passwordError && /* @__PURE__ */ jsx3("span", { className: "text-red-500", children: passwordError })
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
    ] }) }) }),
    /* @__PURE__ */ jsx3(Link2, { to: "/", children: /* @__PURE__ */ jsx3("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "Back" }) })
  ] });
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-H4JK5KMG.js", imports: ["/build/_shared/chunk-7NNUB5ZJ.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-USTYGHXQ.js", imports: void 0, hasAction: !1, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 }, "routes/signup": { id: "routes/signup", parentId: "root", path: "signup", index: void 0, caseSensitive: void 0, module: "/build/routes/signup-7CZBDI5V.js", imports: void 0, hasAction: !0, hasLoader: !1, hasClientAction: !1, hasClientLoader: !1, hasErrorBoundary: !1 } }, version: "e3e5ec5f", hmr: void 0, url: "/build/manifest-E3E5EC5F.js" };

// server-entry-module:@remix-run/dev/server-build
var mode = "production", assetsBuildDirectory = "public/build", future = { v3_fetcherPersist: !1, v3_relativeSplatPath: !1, v3_throwAbortReason: !1, unstable_singleFetch: !1, unstable_fogOfWar: !1 }, publicPath = "/build/", entry = { module: entry_server_node_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: signup_exports
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
