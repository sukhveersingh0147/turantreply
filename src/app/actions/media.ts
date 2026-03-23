"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAccessibleBusiness } from "./settings";
import { revalidatePath } from "next/cache";

/**
 * For production, we should use Cloudinary, Vercel Blob, or Supabase Storage.
 * This is a placeholder for the URL generation/saving logic.
 */
export async function getMediaAssets() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) return [];

    return await (prisma as any).mediaAsset.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" }
    });
}

export async function addMediaAsset(data: { name: string; url: string; type: string; intentKeyword?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const asset = await (prisma as any).mediaAsset.create({
        data: {
            ...data,
            businessId: business.id
        }
    });

    revalidatePath("/inventory");
    revalidatePath("/campaigns");
    return asset;
}

export async function deleteMediaAsset(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    await (prisma as any).mediaAsset.delete({
        where: { id, businessId: business.id }
    });

    revalidatePath("/inventory");
}

export async function updateItemMedia(itemId: string, imageUrls: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    return await (prisma as any).item.update({
        where: { id: itemId, businessId: business.id },
        data: { imageUrls }
    });
}
