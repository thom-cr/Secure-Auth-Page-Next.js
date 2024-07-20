import crypto from "node:crypto";
import { prisma } from "../../db/prisma";

export async function login(email: string, password: string)
{
    try
    {
        let user = await prisma.account.findUnique({
            where: { email: email},
            include: { Password: true },
        });
    
        if (!user || !user.Password)
        {
            return false;
        }
    
        let hash = crypto
          .pbkdf2Sync(password, user.Password.salt, 1000, 64, "sha256")
          .toString("hex");
    
        if (hash !== user.Password.hash)
        {
            return false;
        }
    
        return user.id;
    }
    catch (error)
    {
        if (process.env.NODE_ENV === "development")
        {
            console.error("ACCOUNT CREATION ERROR :", error);
        }
    }
}