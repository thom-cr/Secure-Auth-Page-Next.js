import { createCookieSessionStorage, } from "@remix-run/node";
import { randomUUID } from "node:crypto";

let secret = process.env.COOKIE_SECRET || "default";

if (secret === "default")
{
    console.warn("No COOKIE_SECRET set, the app is insecure.");
    secret = "default-secret";
}

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
    cookie: {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secrets: [secret],
        secure: process.env.NODE_ENV === "production",
        maxAge: 2592000,
    }
});

export const setup_uuid = randomUUID();