import { type ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";

import { csrf_token, csrf_validation } from "../../server/csrf.server";
import { requireAnonymous } from "../../server/required.server";
import { commitSession, getSession } from "../../server/sessions.server";

import { login } from "./queries.server";
import { validate } from "./validate.server";
  
interface ActionData
{
    errors?: ValidationErrors;
}

interface LoaderData
{
    csrf: any;
}

interface ValidationErrors
{
    email?: string;
    password?: string;
    message?: string;
}

export const meta = () =>
{
    return [{ title: "DEMO | Login"}]
};

export async function loader({ request }: LoaderFunctionArgs)
{
    await requireAnonymous(request);

    const session = await getSession(request.headers.get("Cookie"));
    let csrf = csrf_token(session);

    return json<LoaderData>({ csrf }, {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
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
        if (process.env.NODE_ENV === "development")
        {
            console.error("CSRF VALIDATION ERROR :", error);
        }

        return redirect("/login", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
    }

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const errors = validate(email, password);
    
    if (errors)
    {
        return json<ActionData>({ errors }, 400);
    }

    const userId = await login(email, password);

    if (!userId)
    {
        return json<ActionData>(
          { errors: { message: "Invalid email or password" } },
          400
        );
    }

    session.set("userId", userId);
    
    return redirect("/home", {
        headers: {
            "Set-Cookie": await commitSession(session),
        },
    });
}

export default function Signup() {
    let actionResult = useActionData<typeof action>();
    let { csrf } = useLoaderData<LoaderData>();
  
    return (
        <>
          <div className="flex min-h-full flex-1 flex-col justify-center pb-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                        Log in
                    </h2>
                </div>
  
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <Form className="space-y-6" method="post">
                        <input type="hidden" name="csrf" value={csrf} />
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address{" "}
                                {actionResult?.errors?.email && (
                                <span id="email-error" className="text-red-brand font-bold">
                                    {actionResult.errors.email}
                                </span>
                                )}
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-describedby="email-error"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
  
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password{" "}
                                {actionResult?.errors?.password && (
                                <span id="password-error" className="text-red-brand font-bold">
                                    {actionResult.errors.password}
                                </span>
                                )}
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-describedby="password-error"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div className="text-red-brand font-bold text-center mt-3">
                                {actionResult?.errors?.message ? (
                                actionResult.errors.message
                                ) : (
                                    <>&nbsp;</>
                                )}
                            </div>
                        </div>
  
                        {/* <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label
                              htmlFor="remember-me"
                              className="ml-3 block text-sm leading-6 text-gray-900"
                            >
                              Remember me
                            </label>
                          </div>
                          <div className="text-sm leading-6">
                            <a
                              href="#"
                              className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                              Forgot password?
                            </a>
                          </div>
                        </div> */}
  
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Sign in
                            </button>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                Don't have an account?{" "}
                                <Link to="/signup" className="text-gray-500 hover:underline">
                                    Sign up
                                </Link>
                            </span>
                        </div>
                    </Form>
                </div>
                <div className="fixed left-0 p-4">
                    <Link to="/">
                        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
                    </Link>
                </div>
            </div>
          </div>
      </>
    );
  }