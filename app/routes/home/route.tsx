import { json, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";

import { requireAuthCookie } from "../server/required.server";

import { full_name } from "./queries.server";

type LoaderData = {
    userId: string;
    name: string;
};

export async function loader({ request }: LoaderFunctionArgs)
{
    const userId = await requireAuthCookie(request);
    const name = await full_name(userId);

    return json<LoaderData>({ userId, name });
}

export const meta = () =>
{
    return [{ title: "DEMO WEBSITE | Home"}]
}

export default function HomePage()
{
    const { userId, name } = useLoaderData<LoaderData>();

    return (
        <div className="flex flex-col items-center justify-start h-screen">
            <div className="fixed top-0 right-0 p-4">
                <form method="post" action="/logout">
                    <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                        Log out
                    </button>
                </form>
            </div>
            <h1 className="text-black text-4xl font-bold mt-8 text-center">
                Welcome Home, <br />{name}
            </h1>
            <p className="text-black text-4xl font-bold mt-8 text-center">ID : {userId}</p>
        </div>
    );
}