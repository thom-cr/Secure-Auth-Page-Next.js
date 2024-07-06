import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, createCookie, redirect } from "@remix-run/node";
import { RemixServer, useLoaderData, useLocation, Meta, Links, Link, Outlet, Scripts, useActionData, Form } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
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
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
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
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
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
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
let secret = process.env.COOKIE_SECRET || "default";
if (secret === "default") {
  console.warn("No COOKIE_SECRET set, the app is insecure.");
  secret = "default-secret";
}
let authCookie = createCookie("auth", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [secret],
  secure: process.env.NODE_ENV === "production",
  maxAge: 2592e3
});
async function loader$1({ request }) {
  let cookieString = request.headers.get("Cookie");
  let userId = await authCookie.parse(cookieString);
  return { userId };
}
const meta$1 = () => {
  return [{ title: "DEMO WEBSITE" }];
};
function App() {
  let { userId } = useLoaderData();
  const location = useLocation();
  const isRoot = location.pathname === "/";
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("link", { rel: "icon", href: "data:image/x-icon;base64,AA" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx("h1", { className: " top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10", children: "DEMO WEBSITE" }),
      isRoot && /* @__PURE__ */ jsx("div", { className: "fixed top-0 right-0 p-4", children: userId ? /* @__PURE__ */ jsx(Link, { to: "/logout", children: /* @__PURE__ */ jsx("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500", children: "Log out" }) }) : /* @__PURE__ */ jsx(Link, { to: "/signup", children: /* @__PURE__ */ jsx("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500", children: "Log in" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "pt-20", children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
async function loader({ request }) {
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize("", { expires: /* @__PURE__ */ new Date(0) })
    }
  });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const prisma = new PrismaClient();
process.on("beforeExit", () => {
  prisma.$disconnect();
});
async function accountExists(email) {
  let account = await prisma.account.findUnique({
    where: { email },
    select: { id: true }
  });
  return Boolean(account);
}
async function createAccount(email, password) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1e3, 64, "sha256").toString("hex");
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
async function validate(email, password) {
  let errors = {};
  if (!email) {
    errors.email = "Email is required";
  } else if (!email.includes("@")) {
    errors.email = "Please enter a valid email address";
  }
  if (await accountExists(email)) {
    errors.email = "An account with this email already exists";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  return Object.keys(errors).length ? errors : null;
}
async function action({ request }) {
  let formData = await request.formData();
  let email = String(formData.get("email"));
  let password = String(formData.get("password"));
  let errors = await validate(email, password);
  if (errors) {
    return { errors };
  }
  let user = await createAccount(email, password);
  return redirect("/", {
    headers: {
      "Set-Cookie": await authCookie.serialize(user.id)
    }
  });
}
const meta = () => {
  return [{ title: "DEMO | Signup" }];
};
function Signup() {
  var _a, _b;
  let actionData = useActionData();
  let emailError = (_a = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _a.email;
  let passwordError = (_b = actionData == null ? void 0 : actionData.errors) == null ? void 0 : _b.password;
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-wd", children: /* @__PURE__ */ jsx("h2", { id: "signup-header", className: "mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900", children: "Sign Up" }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]", children: /* @__PURE__ */ jsxs("div", { className: "bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12", children: [
      /* @__PURE__ */ jsxs(Form, { className: "space-y-6", method: "post", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "email", className: "block text-sm font-medium leading-6 text-gray-900", children: [
            "Email address ",
            " ",
            emailError && /* @__PURE__ */ jsxs("span", { className: "text-red-500", children: [
              " ",
              emailError,
              " "
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              autoFocus: true,
              id: "email",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: true,
              className: "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900", children: [
            "Password ",
            " ",
            passwordError && /* @__PURE__ */ jsxs("span", { className: "text-red-500", children: [
              " ",
              passwordError,
              " "
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "password",
              name: "password",
              type: "password",
              autoComplete: "current-password",
              "aria-describedby": "password-error",
              required: true,
              className: "form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("button", { type: "submit", className: "flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", children: "Sign in" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "fixed left-0 p-4", children: /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx("button", { className: "bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700", children: "Back" }) }) })
    ] }) })
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Signup,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DztYSs3N.js", "imports": ["/assets/components-DHQgZ3oM.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DIP2O3KC.js", "imports": ["/assets/components-DHQgZ3oM.js"], "css": ["/assets/root-BCr1BnIO.css"] }, "routes/logout": { "id": "routes/logout", "parentId": "root", "path": "logout", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/logout-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/signup": { "id": "routes/signup", "parentId": "root", "path": "signup", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-ed-gwjOR.js", "imports": ["/assets/components-DHQgZ3oM.js"], "css": [] } }, "url": "/assets/manifest-11029501.js", "version": "11029501" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_fogOfWar": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/logout": {
    id: "routes/logout",
    parentId: "root",
    path: "logout",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/signup": {
    id: "routes/signup",
    parentId: "root",
    path: "signup",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
