import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma as db } from "@/lib/prisma";
import { VERTICAL_DATA, VerticalType } from "@/src/lib/vertical-templates";

export async function POST(req: NextRequest) {

  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    )
  }

  const userId = session.user.id

  // 2. Parse + validate businessType
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessType } = body;
  
  const validTypes: VerticalType[] = [
    "salon","gym","coaching",
    "realestate","restaurant","other"
  ]
  if (!validTypes.includes(businessType)) {
    return NextResponse.json(
      { error: "Invalid business type" }, 
      { status: 400 }
    )
  }

  // 3. Idempotency check on User
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      dashboardSeeded: true,
      business: { 
        select: { id: true, dashboardSeeded: true } 
      }
    }
  })

  // Only allow seeding once
  if (user?.dashboardSeeded === true) {
    return NextResponse.json({ 
      success: true, 
      seeded: false,
      message: "Already seeded — skipping" 
    })
  }

  // 4. Get businessId — required for all models
  const businessId = user?.business?.id
  if (!businessId) {
    return NextResponse.json(
      { error: "Business not found. Complete business setup first." }, 
      { status: 404 }
    )
  }

  // 5. Get vertical data
  const vertical = VERTICAL_DATA[businessType as VerticalType]
  if (!vertical) {
    return NextResponse.json(
      { error: "Vertical data not found" }, 
      { status: 404 }
    )
  }

  try {

    // --- SEED CATALOG ITEMS (model: Item) ---
    // Item.type must be one of: 
    // PRODUCT, SERVICE, MENU, COURSE, RENTAL
    // Map vertical catalog to correct type:
    const itemTypeMap: Record<VerticalType, string> = {
      salon:       "SERVICE",
      gym:         "SERVICE",
      coaching:    "COURSE",
      realestate:  "SERVICE",
      restaurant:  "MENU",
      other:       "SERVICE",
    }

    if (vertical.catalogItems && vertical.catalogItems.length > 0) {
      await db.item.createMany({
        data: vertical.catalogItems.map(item => ({
          businessId,
          name:        item.name,
          type:        itemTypeMap[businessType as VerticalType],
          description: item.description,
          price:       item.price,
          category:    item.category,
          isAvailable: true,
          isActive:    true,
          createdAt:   new Date(),
          updatedAt:   new Date(),
        })),
        skipDuplicates: true,
      })
    }

    // --- SEED KEYWORD AUTOMATIONS ---
    // model: Automation
    // Uses: triggerKeyword + responseMessage
    // Seed automationRules that have triggerType: "keyword"
    const keywordRules = vertical.automationRules.filter(
      r => r.triggerType === "keyword"
    )

    if (keywordRules.length > 0) {
      await db.automation.createMany({
        data: keywordRules.map(rule => ({
          businessId,
          triggerKeyword:  rule.trigger,
          responseMessage: rule.messageTemplate,
          isActive:        rule.isActive,
          createdAt:       new Date(),
          updatedAt:       new Date(),
        })),
        skipDuplicates: true,
      })
    }

    // --- SEED AUTOMATION RULES ---
    // model: AutomationRule
    // Uses: triggerStage + message
    // Seed event/schedule based rules
    const stageRules = vertical.automationRules.filter(
      r => r.triggerType === "event" || 
           r.triggerType === "schedule"
    )

    if (stageRules.length > 0) {
      await db.automationRule.createMany({
        data: stageRules.map(rule => ({
          businessId,
          name:         rule.name,
          triggerStage: rule.trigger,
          message:      rule.messageTemplate,
          delayMinutes: rule.delayMinutes,
          isActive:     rule.isActive,
          createdAt:    new Date(),
          updatedAt:    new Date(),
        })),
        skipDuplicates: true,
      })
    }

    // --- SEED AI SYSTEM PROMPT ---
    // model: Business — update aiSystemPrompt field
    await db.business.update({
      where: { id: businessId },
      data:  { 
        aiSystemPrompt: vertical.aiSystemPrompt,
        dashboardSeeded: true,
        updatedAt: new Date(),
      },
    })

    // --- MARK USER AS SEEDED ---
    await db.user.update({
      where: { id: userId },
      data:  { 
        dashboardSeeded: true,
        businessType: businessType,
      },
    })

    return NextResponse.json({ 
      success: true, 
      seeded: true,
      businessType,
      itemsCreated: {
        catalogItems:    vertical.catalogItems.length,
        keywordRules:    keywordRules.length,
        automationRules: stageRules.length,
        aiPrompt:        true,
      }
    })

  } catch (error) {
    console.error("Vertical setup seeding error:", error)
    return NextResponse.json(
      { 
        error: "Seeding failed", 
        details: String(error) 
      },
      { status: 500 }
    )
  }
}
