import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";

import { createAccount } from "./signup/queries.server";
import { getSession, commitSession, destroySession } from "../sessions.server";

type LoaderData = {
    token: string;
};

export const meta = () =>
{
    return [{ title: "DEMO | Verify"}]
};

export async function loader({ params, request }: { params: { token: string }, request: Request })
{
    const { token } = params;
    const session = await getSession(request.headers.get("Cookie"));
    const buff_token = session.get("token");
    const exp_token = session.get("exp_token");

    if ((!buff_token) || (buff_token !== token) || (Date.now() > exp_token))
    {
        return redirect("/");
    }
    
    return json<LoaderData>({ token });
}

export async function action({ request }: ActionFunctionArgs)
{
    const session = await getSession(request.headers.get("Cookie"));

    let formData = await request.formData();

    const first_name = String(session.get("first_name"));
    const last_name = String(session.get("last_name"));
    const email = String(session.get("email"));
    const password = String(session.get("password"));

    const buff_code = `${formData.get('digit1')}${formData.get('digit2')}${formData.get('digit3')}${formData.get('digit4')}${formData.get('digit5')}${formData.get('digit6')}`;
    const v_code = session.get("v_code");
    const v_tries = session.get("v_tries") || 0;

    if (v_tries >= 3)
    {
        return redirect("/", {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    }

    if (buff_code === v_code)
    {
        let user = await createAccount(first_name, last_name, email, password);

        session.unset("v_code");
        session.unset("v_tries");
        session.unset("token");
        session.unset("exp_token");
        session.set("userId", user.id);
    
        return redirect("/home", {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    } 
    else
    {
        session.set("v_tries", v_tries + 1);
        return json({ error: "Invalid verification code" }, { status: 400, headers: { "Set-Cookie": await commitSession(session) } });
    }
}

export default function VerifyPage()
{
    const { token } = useLoaderData<LoaderData>();
    const actionData = useActionData<typeof action>();

    const input_jumper = (event: React.FormEvent<HTMLInputElement>) =>
    {
        const input = event.currentTarget;

        if (input.value.length === 1)
        {
            const next_input = input.nextElementSibling as HTMLInputElement | null;

            if (next_input && next_input.tagName === 'INPUT')
            {
                next_input.focus();
            }
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Enter Verification Code</h1>
            <Form method="post" className="flex space-x-2">
                {[...Array(6)].map((_, i) => (
                    <input key={i} name={`digit${i + 1}`} type="text" maxLength={1}className="w-12 h-12 text-center text-xl border border-gray-300 rounded" required onInput={input_jumper}/>
                ))}
                <button type="submit" className="ml-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-500">Verify</button>
            </Form>
            {actionData?.error && <p className="text-red-500 mt-4">{actionData.error}</p>}
            <div className="left-0 p-4">
                <Link to="/">
                    <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
                </Link>
            </div>
        </div>
    );
}