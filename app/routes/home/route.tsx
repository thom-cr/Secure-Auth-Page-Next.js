import { json, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuthCookie } from "../../auth";

type LoaderData = {
    userId: string;
};

export async function loader({ request }: LoaderFunctionArgs)
{
    let userId = await requireAuthCookie(request);
    return json<LoaderData>({ userId });
}

export const meta = () =>
{
    return [{ title: "DEMO WEBSITE | Home"}]
}

export default function HomePage()
{
    const { userId } = useLoaderData<LoaderData>();

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
                Welcome Home, <br />{userId}
            </h1>
        </div>
    );
}