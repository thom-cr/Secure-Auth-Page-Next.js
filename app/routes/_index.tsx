import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "../sessions.server";

export async function loader({ request }: LoaderFunctionArgs)
{
    let session = await getSession(request.headers.get("Cookie"));
    let userId = session.get("userId");

    if (userId)
    {
        throw redirect("/home");
    }

    return null;
}

export default function Index() {
    return (
        <div className="h-full flex flex-col items-center pt-20 bg-slate-900">
            <div className="space-y-4 max-w-md text-xl text-slate-300 font-bold">
                <h1 className="w-full text-4xl font-bold p-4 shadow-md z-10">AUTHENTIFICATION DEMO</h1>
                <p>This is a demo app for experimentation on the authentification process.</p>
            </div>
      </div>
    );
  }