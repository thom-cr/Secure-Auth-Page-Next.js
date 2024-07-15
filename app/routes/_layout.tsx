import { json, LoaderFunctionArgs } from "@remix-run/node";
import { commitSession, csrf_token, getSession } from "../sessions.server";
import { Outlet } from "@remix-run/react";
import { ReactNode } from "react";

interface IndexData
{
    children?: ReactNode;
}

export async function loader({ request }: LoaderFunctionArgs)
{
    const session = await getSession(request.headers.get("Cookie"));
    let csrf = csrf_token();
    
    session.set("csrf", csrf);

    return json( { csrf }, { headers: { "Set-Cookie": await commitSession(session)}});
}

const Index: React.FC<IndexData> = ({ children }) => {   
    return (
        <div>
            {children}
            <Outlet />
        </div>
    );
};

export default Index;