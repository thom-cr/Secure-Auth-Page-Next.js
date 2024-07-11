import crypto from "node:crypto";
import { prisma } from "../../db/prisma";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API);

export async function accountExists(email: string)
{
    let account = await prisma.account.findUnique({
        where: { email: email },
        select: { id: true },
    });

    return Boolean(account);
}

export async function mailVerification(email: string)
{
    const buff = crypto.randomBytes(3);
    const v_code = parseInt(buff.toString('hex'), 16).toString().padStart(6, '0').substring(0, 6);

    await resend.emails.send({
        from: 'send@fooduhav.com',
        to: email,
        subject: 'Mail Verification',
        html: `<p>Your verification code is <strong>${v_code}</strong></p>`,
    });
    
    if(process.env.NODE_ENV === "development")
    {
        console.log(`Generated code : ${v_code}`);
    }

    return v_code;
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