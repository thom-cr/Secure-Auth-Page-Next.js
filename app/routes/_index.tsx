import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authCookie } from "../auth";
import { Link } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs)
{
    let cookieString = request.headers.get("Cookie");
    let userId = await authCookie.parse(cookieString);
    
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