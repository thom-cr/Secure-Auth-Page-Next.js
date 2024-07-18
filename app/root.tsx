import { Link, Links, Meta, Outlet, Scripts, useLoaderData, useLocation } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";

import { getSession } from "./sessions.server";

import "./styles.css";

export async function loader({ request }: LoaderFunctionArgs)
{
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    
    return { userId };
}

export const meta = () =>
{
    return [{ title: "DEMO WEBSITE"}]
}

export default function App()
{
    let { userId } = useLoaderData<typeof loader>();

    const location = useLocation();
    const isRoot = location.pathname === "/";

    return (
        <html>
            <head>
                <link rel="icon" href="data:image/x-icon;base64,AA" />
                <Meta />
                <Links />
            </head>
            <body>
                <Link to="/">
                    <h1 className=" top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10">
                        DEMO WEBSITE
                    </h1>
                </Link>

                {isRoot && (
                    <div className="fixed top-0 right-0 p-4">
                        {userId ? (
                            <form method="post" action="/logout">
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                    Log out
                                </button>
                            </form>
                        ) : (
                            <Link to="/login">
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                    Log in
                                </button>
                            </Link>
                        )}
                    </div>
                )}

                <div className="pt-20">
                    <Outlet />
                </div>

                <Scripts />
            </body>
        </html>
    );
}