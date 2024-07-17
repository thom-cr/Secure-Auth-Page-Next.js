import crypto from "node:crypto";
import { prisma } from "../../db/prisma";

export async function setupAccount(first_name: string, last_name: string, password: string, userId: string)
{
    let salt = crypto.randomBytes(16).toString("hex");
    let hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha256")
        .toString("hex");

    return prisma.account.update({
        where: {
            id: userId,
        },
        data: {
            first_name: first_name,
            last_name: last_name,
            Password: {
                create:{
                    hash: hash,
                    salt: salt,
                },
            },
        },
    });
}