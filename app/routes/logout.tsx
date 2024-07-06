import { redirect } from "@remix-run/node";
import { authCookie } from "../auth";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
    return redirect("/", {
        headers: {
            "Set-Cookie": await authCookie.serialize("", { expires: new Date(0) }),
        },
    });
}