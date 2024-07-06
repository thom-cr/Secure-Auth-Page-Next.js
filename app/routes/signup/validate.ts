import { accountExists } from "./queries";

export async function validate(email: string, password:string)
{
    let errors: { email?: string; password?: string } = {};
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

    return Object.keys(errors).length ? errors : null;
}