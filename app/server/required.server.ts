import { redirect } from "@remix-run/react";

import { getSession, commitSession, destroySession } from "./sessions.server";

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

export const requireId = async (request: Request) => {
    const session = await getSession(request.headers.get("Cookie"));
    let user_id = session.get("userId");

    if (!user_id)
    {
        throw redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
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