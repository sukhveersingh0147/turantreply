"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAssets() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (!business) return [];

    return prisma.mediaAsset.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" }
    });
}

export async function addAsset(data: {
    name: string;
    type: string;
    url: string;
    intentKeyword?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id }
    });

    if (!business) throw new Error("Business not found");

    const asset = await prisma.mediaAsset.create({
        data: {
            ...data,
            businessId: business.id
        }
    });

    revalidatePath("/assets");
    return asset;
}

export async function deleteAsset(assetId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.mediaAsset.delete({
        where: { id: assetId }
    });

    revalidatePath("/assets");
}
