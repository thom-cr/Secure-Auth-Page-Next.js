import crypto from "node:crypto";
import { prisma } from "../../db/prisma";

export async function accountExists(email: string) {
    let account = await prisma.account.findUnique({
        where: { email: email },
        select: { id: true },
    });

    return Boolean(account);
}

export async function createAccount(first_name: string, last_name: string, email: string, password: string)
{
    let salt = crypto.randomBytes(16).toString("hex");
    let hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha256")
        .toString("hex");
    
    return prisma.account.create({
        data: {
            first_name: first_name,
            last_name: last_name,
            email: email,
            Password: {
                create:{
                    hash: hash,
                    salt: salt,
                },
            },
        },
    });
}