import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, json, Link, useActionData } from "@remix-run/react";
import { randomUUID } from "node:crypto";

import { getSession, commitSession, requireAnonymous, destroySession } from "../../sessions.server";
import { mailVerification } from "./queries.server";
import { validate_email } from "./validate.server";

interface ValidationErrors
{
    email?: string;
    code?: string;
}

interface ActionData
{
    errors?: ValidationErrors;
    step?: "verify_email" | "verify_code";
}

export async function loader({ request }: LoaderFunctionArgs)
{
    await requireAnonymous(request);
    return json({});
}

export async function action({ request }: ActionFunctionArgs)
{
    const formData = await request.formData();
    const intent = String(formData.get("intent"));
    const session = await getSession(request.headers.get("Cookie"));

    if (intent === "verify_email")
    {
        const email = String(formData.get("email"));

        let errors = await validate_email(email);

        if (errors)
        {
            return json<ActionData>({ errors });
        }

        const v_code = await mailVerification(email);

        session.flash("email", email);
        session.set("v_code", v_code);
        session.set("v_tries", 0);

        return json<ActionData>({ step: "verify_code" }, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    }

    if (intent === "verify_code")
    {
        const v_code = session.get("v_code");
        const buff_code = `${formData.get('digit1')}${formData.get('digit2')}${formData.get('digit3')}${formData.get('digit4')}${formData.get('digit5')}${formData.get('digit6')}`;
        const v_tries = session.get("v_tries") || 0;

        if(process.env.NODE_ENV === "development")
        {
            console.log(`V_code : ${v_code}`);
            console.log(`Buff_code : ${buff_code}`);
        }
        
        if (v_tries >= 3)
        {
            session.unset("email");
            session.unset("v_code");
            session.unset("v_tries");

            return redirect("/", {
                headers: {
                    "Set-Cookie": await destroySession(session),
                },
            });
        }

        if (buff_code === v_code)
        {
            const setup_uuid = randomUUID();
            session.unset("v_code");
            session.unset("v_tries");
            session.flash("setup", setup_uuid);
            
            return redirect("/setup", {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            });
        }
        else
        {
            session.set("v_tries", v_tries + 1);

            return json<ActionData>({ errors: { code: "Invalid verification code" }, step: "verify_code" }, {
                headers: {
                    "Set-Cookie": await commitSession(session),
                },
            });
        }
    }
}

export const meta = () => {
    return [{ title: "DEMO | Signup" }];
};

export default function Signup()
{
    const actionResult = useActionData<ActionData>();
    const step = actionResult?.step || "verify_email";

    let codeError = actionResult?.errors?.code;
    let emailError = actionResult?.errors?.email;

    const input_jumper = (event: React.FormEvent<HTMLInputElement>) => {
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
        <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 id="signup-header" className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign Up
                </h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                {step === "verify_email" ? (
                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                        <Form method="post" className="space-y-6">
                            <input type="hidden" name="intent" value="verify_email" />
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                    Email address {" "}
                                    {emailError && (<span className="text-red-500 font-bold"> {emailError} </span>)}
                                </label>
                                <input
                                    autoFocus
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div>
                                <button type="submit" className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    Send mail
                                </button>
                            </div>
                        </Form>
                        <div className="left-0 p-4">
                            <Link to="/">
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
                            </Link>
                        </div>
                    </div>
                ) : step === "verify_code" ? (
                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                        <Form method="post" className="space-y-6">
                            <input type="hidden" name="intent" value="verify_code" />
                                <div className="flex space-x-2 justify-center">
                                    {[...Array(6)].map((_, i) => (
                                        <input key={i} name={`digit${i + 1}`} type="text" maxLength={1} className="w-12 h-12 text-center text-xl border border-gray-300 rounded" required onInput={input_jumper} />
                                    ))}
                                </div>
                                <div>
                                    <button type="submit" className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                        Verify
                                    </button>
                                </div>
                        </Form>
                        {codeError && <p className="text-red-500 mt-4 font-bold">{codeError}</p>}
                        <div className="left-0 p-4">
                            <Link to="/">
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
