import { prisma } from "../../db/prisma";

export async function full_name(userId: string)
{
    const user = await prisma.account.findUnique({
        where: {
            id: userId,
        },
        select: {
            first_name: true,
            last_name: true,
        },
    });

    if (!user || !user.first_name || !user.last_name)
    {
        return "";
    }

    return `${user.first_name} ${user.last_name}`;
}