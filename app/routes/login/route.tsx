import { type ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { csrf_token, csrf_validation } from "../../server/csrf.server";
import { requireAnonymous } from "../../server/required.server";
import { commitSession, getSession, sessionStorage } from "../../server/sessions.server";
import { handleFormSubmit } from "../../auth/browser";
import { authenticator, webAuthnStrategy } from "../../server/auth.server";
import { WebAuthnOptionsResponse } from "../../auth/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await authenticator.isAuthenticated(request);
    let session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
  
    const options = await webAuthnStrategy.generateOptions(request, user);
  
    // Set the challenge in a session cookie so it can be accessed later.
    session.set("challenge", options.challenge);
  
    commitSession(session);
    const headers = new Headers();
    // Update the cookie
    headers.append("Set-Cookie", await commitSession(session))
    headers.set("Cache-Control","no-store")
  
    return json(options, { headers });
  }
  
  export async function action({ request }: ActionFunctionArgs) {
    try {
      await authenticator.authenticate("webauthn", request, {
        successRedirect: "/",
      });
      return { error: null };
    } catch (error) {
      // This allows us to return errors to the page without triggering the error boundary.
      if (error instanceof Response && error.status >= 400) {
        return { error: (await error.json()) as { message: string } };
      }
      throw error;
    }
  }
export default function Login()
{
    const options = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    return (
      <Form onSubmit={handleFormSubmit(options, { attestationType: "direct" })} method="POST">
        <label>
          Username
          <input type="text" name="username" />
        </label>
        <button formMethod="GET">Check Username</button>
        <button
          name="intent"
          value="registration"
          disabled={options.usernameAvailable !== true}
        >
          Register
        </button>
        <button name="intent" value="authentication">
          Authenticate
        </button>
        {actionData?.error ? <div>{actionData.error.message}</div> : null}
      </Form>
    );
}