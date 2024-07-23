import { createCookieSessionStorage, } from "@remix-run/node";
import { randomUUID } from "node:crypto";

let secret = process.env.COOKIE_SECRET || "default";

if (secret === "default")
{
    console.warn("No COOKIE_SECRET set, the app is insecure.");
    secret = "default-secret";
}

export const setup_uuid = randomUUID();

export let sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "_session",
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secrets: [secret],
      secure: process.env.NODE_ENV === "production",
      maxAge: 2592000,
    },
  });
  
  // you can also export the methods individually for your own usage
  export let { getSession, commitSession, destroySession } = sessionStorage;
  