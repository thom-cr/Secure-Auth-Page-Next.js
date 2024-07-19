import { redirect } from "@remix-run/node";
import { getSession, destroySession } from "./server/sessions.server";

export async function action({ request }: { request: Request })
{
    let session = await getSession(request.headers.get("Cookie"));

    return redirect("/", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}