import React from "react";
import {
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    useLocation
} from "@remix-run/react";

import type { LinksFunction } from "@remix-run/node";

import "./styles.css";

export const meta = () =>
{
    return [{ title: "DEMO WEBSITE"}]
}

export default function App()
{
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
                <h1 className=" top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10">
                    DEMO WEBSITE
                </h1>

                {isRoot && (
                    <div className="fixed top-0 right-0 p-4">
                        <Link to="/signup">
                            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                                Sign Up
                            </button>
                        </Link>
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