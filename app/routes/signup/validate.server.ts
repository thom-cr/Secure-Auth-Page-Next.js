import { accountExists } from "./queries.server";

export async function validate(email: string, password:string, password_check:string)
{
    let errors: { email?: string; password?: string; password_check?: string } = {};
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

    if (!password)
    {
        errors.password = "Password is required";
    } 
    else if (password.length < 8)
    {
        errors.password = "Password must be at least 8 characters";
    }

    if (password !== password_check)
    {
        errors.password_check = "Password doesn't match";
    }

    return Object.keys(errors).length ? errors : null;
}