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

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Seed suggested Items/Services
        if (template.catalogItems.length > 0) {
          // Check existing items to avoid duplicates
          const existingItems = await tx.item.findMany({
            where: { businessId, name: { in: template.catalogItems.map(i => i.name) } }
          });
          const existingNames = new Set(existingItems.map(i => i.name));

          const newItems = template.catalogItems.filter(i => !existingNames.has(i.name));

          if (newItems.length > 0) {
            await tx.item.createMany({
              data: newItems.map(item => ({
                name: item.name,
                price: item.price,
                type: item.category, // Mapped category to type
                businessId,
                isAvailable: true,
                isActive: true,
              }))
            });
          }
        }

        // 2. Seed Automations
        if (template.automationRules.length > 0) {
          const existingAutos = await tx.automation.findMany({
            where: { businessId, triggerKeyword: { in: template.automationRules.map(a => a.trigger) } }
          });
          const existingTriggers = new Set(existingAutos.map(a => a.triggerKeyword));

          const newAutos = template.automationRules.filter(a => !existingTriggers.has(a.trigger));

          if (newAutos.length > 0) {
            await tx.automation.createMany({
              data: newAutos.map(auto => ({
                triggerKeyword: auto.trigger,
                responseMessage: auto.messageTemplate, // Mapped messageTemplate to responseMessage
                businessId,
                isActive: true,
              }))
            });
          }
        }

        // 3. Customize and Update AI System Prompt
        const personalizedPrompt = template.aiSystemPrompt.replace(/\[Business Name\]/g, business.name);

        await tx.business.update({
          where: { id: businessId },
          data: {
            aiSystemPrompt: personalizedPrompt,
            dashboardSeeded: true,
            industry: template.label,
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
