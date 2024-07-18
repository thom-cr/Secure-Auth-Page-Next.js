import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, Form, Link, json, redirect, useLoaderData } from "@remix-run/react";
import { getSession, commitSession, requireId, requireVerified, csrf_validation, destroySession, csrf_token } from "../../sessions.server";
import { validate_password } from "../signup/validate.server";
import { setupAccount } from "./queries.server";

interface ValidationErrors
{
    password?: string;
    password_check?: string;
    message?: string;
}

interface ActionData
{
    errors?: ValidationErrors;
}

interface LoaderData
{
    csrf: any;
}

export async function loader({ request }: LoaderFunctionArgs)
{
    await requireVerified(request);
    await requireId(request);
    
    const session = await getSession(request.headers.get("Cookie"));
    const csrf = csrf_token(session);

    return json<LoaderData>({ csrf });
}

export async function action({ request }: ActionFunctionArgs)
{
    const formData = await request.formData();
    const session = await getSession(request.headers.get("Cookie"));

    try
    {
        await csrf_validation(request, formData);
    }
    catch (error)
    {
        session.flash("error", "/!\\ CSRF Token ERROR /!\\");

        return redirect("/", {
          headers: { "Set-Cookie": await destroySession(session) },
        });
    }

    const user_id = session.get("userId");
    const first_name = String(formData.get("first_name"));
    const last_name = String(formData.get("last_name"));
    const password = String(formData.get("password"));
    const password_check = String(formData.get("password_check"));

    let errors = await validate_password(password, password_check);

    if (errors)
    {
        return json<ActionData>({ errors }, { status: 400 });
    }

    await setupAccount(first_name, last_name, password, user_id);

    return redirect("/home", {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}

export default function Setup()
{
    const actionResult = useActionData<ActionData>();

    let { csrf } = useLoaderData<LoaderData>();

    let passwordError = actionResult?.errors?.password;
    let passwordCheckError = actionResult?.errors?.password_check;

    return (
        <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 id="signup-header" className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Setup
                </h2>
            </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                        <Form className="space-y-6" method="post">
                            <input type="hidden" name="csrf" value={csrf} />
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    First Name {" "}
                                </label>
                                <input
                                    autoFocus
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Last Name {" "}
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password {" "}
                                    {passwordError && (<span className="text-red-500 font-bold"> {passwordError} </span>)}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    aria-describedby="password-error"
                                    required
                                    className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div>
                                <label htmlFor="password_check" className="block text-sm font-medium leading-6 text-gray-900">
                                    Password check{" "}
                                    {passwordCheckError && (<span className="text-red-500 font-bold"> {passwordCheckError} </span>)}
                                </label>
                                <input
                                    id="password_check"
                                    name="password_check"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div>
                                <button type="submit" className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                                    Setup Account
                                </button>
                            </div>
                        </Form>
                        <div className="fixed left-0 p-4">
                            <Link to="/">
                                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
                            </Link>
                        </div>
                    </div>
                </div>
        </div>
    );
}