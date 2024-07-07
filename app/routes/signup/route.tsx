import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

import { authCookie } from "../../auth";
import { createAccount } from "./queries";
import { validate } from "./validate";

export async function action({ request }: ActionFunctionArgs)
{
    let formData = await request.formData();
    let first_name = String(formData.get("first_name"));
    let last_name = String(formData.get("last_name"));
    let email = String(formData.get("email"));
    let password = String(formData.get("password"));
    let password_check = String(formData.get("password_check"));
    let errors = await validate(email, password, password_check);

    if (errors)
    {
        return { errors };
    }

    let user = await createAccount(first_name, last_name, email, password);
    
    return redirect("/", {
        headers: {
            "Set-Cookie": await authCookie.serialize(user.id),
        },
    });
}

export const meta = () =>
{
    return [{ title: "DEMO | Signup"}]
};

export default function Signup()
{
    let actionData = useActionData<typeof action>();
    let emailError = actionData?.errors?.email;
    let passwordError = actionData?.errors?.password;
    let passwordCheckError = actionData?.errors?.password_check;

    return (
        <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-wd">
                <h2 id="signup-header" className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Sign Up
                </h2>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                    <Form className="space-y-6" method="post">
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
                                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">
                                Last Name {" "}
                            </label>
                            <input
                                autoFocus
                                id="last_name"
                                name="last_name"
                                type="text"
                                required
                                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Email address {" "}
                                {emailError && ( <span className="text-red-500"> {emailError} </span> )}
                            </label>
                            <input
                                autoFocus
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"/>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password {" "}
                                {passwordError && ( <span className="text-red-500"> {passwordError} </span> )}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                aria-describedby="password-error"
                                required
                                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"/>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password check{" "}
                                {passwordCheckError && ( <span className="text-red-500"> {passwordCheckError} </span> )}
                            </label>
                            <input
                                id="password_check"
                                name="password_check"
                                type="password"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"/>
                        </div>
                        
                        <div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Sign in
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
