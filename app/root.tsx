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

import appStylesHref from "./styles/root.css";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: appStylesHref },
    { href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css", rel: "stylesheet", integrity: "sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH", crossorigin: "anonymous"},
];

export const meta = () => {
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
                <h1>DEMO WEBSITE</h1>
                {isRoot && (
                    <Link to="/signup">
                        <button>Sign Up</button>
                    </Link>
                )}
                <Outlet />
                <Scripts />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"></script>
            </body>
        </html>
    );
}