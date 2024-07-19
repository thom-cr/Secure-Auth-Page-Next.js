import { Session } from "@remix-run/node";
import { randomBytes } from "node:crypto";

import { commitSession, getSession } from "./sessions.server";

export function csrf_token(session: Session)
{
    const token = randomBytes(16).toString("hex");
    let csrf = session.get("csrf");

    if (!csrf)
    {
        session.set("csrf", token);
        
        commitSession(session);

        return token;
    }

    return csrf;
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
