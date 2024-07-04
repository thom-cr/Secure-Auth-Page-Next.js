import React from "react";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";

export const meta = () => {
    return [{ title: "DEMO | Signup"}]
};

export async function action({ request }: ActionFunctionArgs) {
    let formData = await request.formData();
    console.log(formData.get("email"));
    console.log(formData.get("password"));
    return null;
}

export default function Signup() {
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
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
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
                            Password
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
                        <button type="submit" className="flex w-full justify-center rounded-md bg-pink-brand px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            Sign in
                        </button>
                    </div>
                </Form>
            </div>
        </div>
        <Link to="/">
            <button>Back</button>
        </Link>
    </div>
  );
}
