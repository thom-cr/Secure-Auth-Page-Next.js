import { json, LoaderFunctionArgs } from "@remix-run/node";

import { requireAnonymous } from "../server/required.server";

export async function loader({ request }: LoaderFunctionArgs)
{
    await requireAnonymous(request);

    return json({});
}

export default function Index()
{
    return (

        <div className="h-full flex flex-col items-center pt-20 bg-slate-900">
            <div className="space-y-4 max-w-md text-xl text-slate-300 font-bold">
                <h1 className="w-full text-4xl font-bold p-4 shadow-md z-10">AUTHENTIFICATION DEMO</h1>
                <p>This is a demo app for experimentation on the authentification process.</p>
            </div>
        </div>
    );
  }