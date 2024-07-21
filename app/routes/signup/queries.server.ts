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

export async function createAccount(email: string)
{
    return prisma.account.create({
        data: {
            first_name: "",
            last_name: "",
            email: email,
        },
    });
}

export async function mailVerification(email: string)
{
    const buff = crypto.randomBytes(3);
    const v_code = parseInt(buff.toString('hex'), 16).toString().padStart(6, '0').substring(0, 6);

    if (process.env.NODE_ENV === "production")
    {
        await resend.emails.send({
            from: 'send@fooduhav.com',
            to: email,
            subject: 'Mail Verification',
            html: `<p>Your verification code is <strong>${v_code}</strong></p>`,
        });
    }
    
    if(process.env.NODE_ENV === "development")
    {
        console.log(`GENERATED CODE : ${v_code}`);
    }

    return v_code;
}