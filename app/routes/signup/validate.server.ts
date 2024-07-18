import { accountExists } from "./queries.server";

export async function validate_email(email: string)
{
    let errors: { email?: string } = {};

    if (!email)
    {
        errors.email = "Email is required";
    }
    else if (!email.includes("@"))
    {
        errors.email = "Please enter a valid email address";
    }

    if (await accountExists(email))
    {
        errors.email = "An account with this email already exists";
    }

    return Object.keys(errors).length ? errors : null;
}