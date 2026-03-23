"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAccessibleBusiness } from "./settings";

export async function getInventory() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();

    if (!business) return [];

    try {
        return (prisma as any).item.findMany({
            where: { businessId: business.id },
            orderBy: { updatedAt: "desc" }
        });
    } catch (error) {
        console.error("[INVENTORY] getInventory error:", error);
        throw error;
    }
}

export async function addItem(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const validFields = [
        "name", "type", "description", "price", "stock", 
        "category", "imageUrl", "imageUrls", "variants", "metadata", "isAvailable"
    ];

    const sanitizedData: any = {};
    const extraMetadata: any = data.metadata || {};

    Object.keys(data).forEach(key => {
        if (validFields.includes(key)) {
            sanitizedData[key] = data[key];
        } else {
            extraMetadata[key] = data[key];
        }
    });

    sanitizedData.metadata = Object.keys(extraMetadata).length > 0 ? extraMetadata : null;

    try {
        const item = await (prisma as any).item.create({
            data: {
                ...sanitizedData,
                businessId: business.id
            }
        });

        revalidatePath("/inventory");
        revalidatePath("/catalog");
        return item;
    } catch (error) {
        console.error("[INVENTORY] addItem error:", error);
        throw error;
    }
}

export async function updateStock(itemId: string, newStock: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await (prisma as any).item.updateMany({
        where: { id: itemId },
        data: { stock: newStock }
    });

    revalidatePath("/inventory");
    revalidatePath("/catalog");
}

export async function updateItem(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validFields = [
        "name", "type", "description", "price", "stock", 
        "category", "imageUrl", "imageUrls", "variants", "metadata", "isAvailable"
    ];

    const sanitizedData: any = {};
    const extraMetadata: any = data.metadata || {};

    Object.keys(data).forEach(key => {
        if (validFields.includes(key)) {
            sanitizedData[key] = data[key];
        } else if (key !== 'id') {
            extraMetadata[key] = data[key];
        }
    });

    if (Object.keys(extraMetadata).length > 0) {
        sanitizedData.metadata = extraMetadata;
    }

    try {
        const item = await (prisma as any).item.update({
            where: { id },
            data: sanitizedData
        });

        revalidatePath("/inventory");
        revalidatePath("/catalog");
        return item;
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.warn("[INVENTORY] Attempted to update non-existent item:", id);
            return null;
        }
        console.error("[INVENTORY] updateItem error:", error);
        throw error;
    }
}

export async function bulkAddItems(items: any[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const validFields = [
        "name", "type", "description", "price", "stock", 
        "category", "imageUrl", "imageUrls", "variants", "metadata", "isAvailable"
    ];

    const createdItems = await Promise.all(
        items.map(itemData => {
            const sanitizedData: any = {};
            const extraMetadata: any = itemData.metadata || {};

            Object.keys(itemData).forEach(key => {
                if (validFields.includes(key)) {
                    sanitizedData[key] = itemData[key];
                } else {
                    extraMetadata[key] = itemData[key];
                }
            });

            sanitizedData.metadata = Object.keys(extraMetadata).length > 0 ? extraMetadata : null;

            return (prisma as any).item.create({
                data: {
                    ...sanitizedData,
                    businessId: business.id
                }
            });
        })
    );

    revalidatePath("/inventory");
    revalidatePath("/catalog");
    return createdItems;
}

export async function deleteItem(itemId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await (prisma as any).item.deleteMany({
        where: { id: itemId }
    });

    revalidatePath("/inventory");
    revalidatePath("/catalog");
}

