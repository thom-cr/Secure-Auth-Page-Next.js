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

    console.log(`Generated code : ${v_code}`);

    return v_code;
}

export function uuidGenerator()
{
    const bytes = crypto.randomBytes(16);

    bytes[6] = (bytes[6] & 0x0f) | 0x40; 
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hexBytes = bytes.toString('hex');
    
    return [
        hexBytes.slice(0, 8),
        hexBytes.slice(8, 12),
        hexBytes.slice(12, 16),
        hexBytes.slice(16, 20),
        hexBytes.slice(20, 32)
    ].join('-');
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