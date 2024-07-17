import { createCookieSessionStorage, redirect, Session } from "@remix-run/node";
import { randomBytes } from "node:crypto";

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

export const requireAnonymous = async (request: Request) => {
    const session = await getSession(request.headers.get("Cookie"));
    let user_id = session.get("userId");
  
    if (user_id)
    {
        throw redirect("/home", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }
};

export const requireVerified = async (request: Request) => {
    const session = await getSession(request.headers.get("Cookie"));
    let setup = session.get("setup");

    if (!setup)
    {
        throw redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }
}

export function csrf_token(session: Session)
{
    try
    {
        const csrf = session.get("csrf");

        if(csrf)
        {
            return csrf;
        }
        const token = randomBytes(16).toString("hex");
        return token;
    }
    catch (error)
    {
        console.error("Error generating CSRF token:", error);
        return undefined;
    }
}

export async function requireAuthCookie(request: Request)
{
    let session = await getSession(request.headers.get("Cookie"));
    let userId = session.get("userId");

    if (!userId)
    {
        throw redirect("/login", {
            headers: {
                "Set-Cookie": await destroySession(session)
            },
        });
    }

    return userId;
}

export async function csrf_validation(request: Request, formData: FormData)
{
    const session = await getSession(request.headers.get("Cookie"));
    const csrf_token = session.get("csrf");
    const csrf_form = formData.get("csrf");

    if (!csrf_token)
    {
        throw new Error("CSRF Token not included.");
    }
    if (csrf_token !== csrf_form)
    {
        throw new Error("CSRF Token diff.");
    }
}
