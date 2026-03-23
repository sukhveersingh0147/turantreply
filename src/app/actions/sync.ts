"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

import { getAccessibleBusiness } from "./settings";

export async function exportLeadsToCSV() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    const businessWithLeads = await prisma.business.findUnique({
        where: { id: business?.id || "" },
        include: { leads: true }
    });

    if (!businessWithLeads) throw new Error("Business not found");

    const header = ["Name", "Phone", "Status", "Stage", "Interest", "Last Interaction", "Summary"];
    const rows = businessWithLeads.leads.map(lead => [
        lead.name || "N/A",
        lead.phone,
        lead.status,
        lead.leadStage || lead.leadType || "NEW",
        lead.customerInterest || "N/A",
        (lead as any).lastInteraction?.toISOString() || "N/A",
        lead.conversationSummary?.replace(/,/g, ";") || "N/A"
    ]);

    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    return csvContent;
}
import { revalidatePath } from "next/cache";


function parseCSVLine(line: string) {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
}

export async function importInventoryFromCSV(csvText: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { count: 0 };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const dataLines = lines.slice(1);

    const results = [];
    for (const line of dataLines) {
        const values = parseCSVLine(line);
        
        const item: any = {
            businessId: business.id,
            isActive: true,
            category: "General",
            type: "PRODUCT",
            price: 0,
            stock: 0,
            description: ""
        };

        headers.forEach((h, i) => {
            const val = values[i];
            if (!val) return;

            if (h.includes("name")) item.name = val;
            else if (h.includes("type")) item.type = val.toUpperCase();
            else if (h.includes("price")) item.price = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
            else if (h.includes("stock")) item.stock = parseInt(val.replace(/[^0-9]/g, '')) || 0;
            else if (h.includes("category")) item.category = val;
            else if (h.includes("desc")) item.description = val;
            else if (h.includes("image")) item.imageUrl = val;
        });

        if (!item.name) continue;

        try {
            const created = await (prisma as any).item.create({
                data: item
            });
            results.push(created);
        } catch (e) {
            console.error("[SYNC] Failed to import item:", item.name, e);
        }
    }

    revalidatePath("/inventory");
    revalidatePath("/catalog");
    return { count: results.length };
}

export async function importLeadsFromCSV(csvText: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const business = await getAccessibleBusiness();
    if (!business) throw new Error("Business not found");

    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { count: 0 };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const dataLines = lines.slice(1);

    const results = [];
    for (const line of dataLines) {
        const values = parseCSVLine(line);
        
        const lead: any = {
            businessId: business.id,
            status: "ACTIVE",
            leadStage: "NEW",
            phone: ""
        };

        headers.forEach((h, i) => {
            const val = values[i];
            if (!val) return;

            if (h.includes("phone") || h.includes("number") || h.includes("mobile")) {
                // Normalize phone: remove non-numeric
                lead.phone = val.replace(/\D/g, '');
            }
            else if (h.includes("name")) lead.name = val;
            else if (h.includes("stage") || h.includes("type")) lead.leadStage = val.toUpperCase();
            else if (h.includes("interest")) lead.customerInterest = val;
            else if (h.includes("summary") || h.includes("note")) lead.conversationSummary = val;
        });

        if (!lead.phone) continue;

        try {
            // Upsert lead by phone and businessId
            const created = await prisma.lead.upsert({
                where: {
                    businessId_phone: {
                        businessId: business.id,
                        phone: lead.phone
                    }
                },
                update: lead,
                create: lead
            });
            results.push(created);
        } catch (e) {
            console.error("[SYNC] Failed to import lead:", lead.phone, e);
        }
    }

    revalidatePath("/leads");
    return { count: results.length };
}
