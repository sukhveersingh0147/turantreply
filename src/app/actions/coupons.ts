"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAccessibleBusiness } from "./settings";

export async function getCoupons() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) return [];

    return await (prisma as any).coupon.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" }
    });
}

export async function createCoupon(data: { code: string; discount: number; expiryDate?: Date }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const coupon = await (prisma as any).coupon.create({
        data: {
            ...data,
            businessId: business.id
        }
    });

    revalidatePath("/inventory");
    revalidatePath("/campaigns");
    return coupon;
}

export async function deleteCoupon(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    await (prisma as any).coupon.delete({
        where: { id, businessId: business.id }
    });

    revalidatePath("/inventory");
    revalidatePath("/campaigns");
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    await (prisma as any).coupon.update({
        where: { id, businessId: business.id },
        data: { isActive }
    });

    revalidatePath("/inventory");
    revalidatePath("/campaigns");
}
