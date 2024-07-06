import { redirect } from "@remix-run/node";
import { authCookie } from "../auth";

export async function action()
{
    return redirect("/", {
        headers: {
            "Set-Cookie": await authCookie.serialize("", {
                maxAge: 0,
            }),
        },
    });
}