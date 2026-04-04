import { prisma } from "@/lib/prisma";
import { VERTICAL_TEMPLATES, VerticalType } from "@/lib/vertical-templates";

export class SeedService {
  static async seedBusinessDashboard(businessId: string, verticalType: string) {
    // Normalize vertical type (lowercase as per new spec)
    const type = (verticalType.toLowerCase() as VerticalType) || 'other';
    const template = VERTICAL_TEMPLATES[type] || VERTICAL_TEMPLATES.other;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { dashboardSeeded: true, name: true }
    });

    if (!business) {
      throw new Error("Business not found");
    }

    // We allow re-seeding if needed, but typically we check dashboardSeeded
    // For rebranding, we'll overwrite the AI prompt but only append items/automations

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Seed suggested Items/Services
        if (template.suggestedItems.length > 0) {
          // Check existing items to avoid duplicates
          const existingItems = await tx.item.findMany({
            where: { businessId, name: { in: template.suggestedItems.map(i => i.name) } }
          });
          const existingNames = new Set(existingItems.map(i => i.name));

          const newItems = template.suggestedItems.filter(i => !existingNames.has(i.name));

          if (newItems.length > 0) {
            await tx.item.createMany({
              data: newItems.map(item => ({
                name: item.name,
                price: item.price,
                type: item.type,
                businessId,
                isAvailable: true,
                isActive: true,
              }))
            });
          }
        }

        // 2. Seed Automations
        if (template.automations.length > 0) {
          const existingAutos = await tx.automation.findMany({
            where: { businessId, triggerKeyword: { in: template.automations.map(a => a.trigger) } }
          });
          const existingTriggers = new Set(existingAutos.map(a => a.triggerKeyword));

          const newAutos = template.automations.filter(a => !existingTriggers.has(a.trigger));

          if (newAutos.length > 0) {
            await tx.automation.createMany({
              data: newAutos.map(auto => ({
                triggerKeyword: auto.trigger,
                responseMessage: auto.response,
                businessId,
                isActive: true,
              }))
            });
          }
        }

        // 3. Customize and Update AI System Prompt
        const personalizedPrompt = template.aiPrompt.replace(/{businessName}/g, business.name);

        await tx.business.update({
          where: { id: businessId },
          data: {
            aiSystemPrompt: personalizedPrompt,
            dashboardSeeded: true,
            industry: template.name,
          }
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Error seeding dashboard:", error);
      throw error;
    }
  }
}
