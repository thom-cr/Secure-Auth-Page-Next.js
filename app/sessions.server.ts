import { createCookieSessionStorage, redirect } from "@remix-run/node";

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