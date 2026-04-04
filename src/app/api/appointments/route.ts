import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfDay, startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!business) {
        return new NextResponse("Business not found", { status: 404 });
    }

    const businessId = business.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    // Main query where clause
    const where: any = {
      businessId,
    };

    // Apply Filter
    if (filter === "today") {
      where.startTime = { gte: todayStart, lte: todayEnd };
    } else if (filter === "upcoming") {
      where.startTime = { gte: now };
      where.status = "SCHEDULED";
    } else if (filter === "completed") {
      where.status = "COMPLETED";
    } else if (filter === "cancelled") {
      where.status = "CANCELLED";
    }

    // Apply Search
    if (search) {
      where.OR = [
        { lead: { name: { contains: search, mode: "insensitive" } } },
        { lead: { phone: { contains: search } } },
        { title: { contains: search, mode: "insensitive" } }
      ];
    }

    const [appointments, total, stats] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          lead: { select: { name: true, phone: true, status: true, tags: true, leadStage: true, lastInteraction: true, conversationSummary: true } },
          item: { select: { name: true, category: true } }
        },
        orderBy: { startTime: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where }),
      // Stats query
      Promise.all([
        prisma.appointment.count({ where: { businessId, startTime: { gte: todayStart, lte: todayEnd } } }),
        prisma.appointment.count({ where: { businessId, status: "SCHEDULED", startTime: { gte: now } } }),
        prisma.appointment.count({ where: { businessId, status: "COMPLETED", startTime: { gte: monthStart } } }),
        prisma.appointment.count({ where: { businessId, status: "CANCELLED", startTime: { gte: monthStart } } }),
      ])
    ]);

    return NextResponse.json({
      appointments,
      total,
      page,
      stats: {
        todayCount: stats[0],
        pendingCount: stats[1],
        completedThisMonth: stats[2],
        cancelledThisMonth: stats[3]
      }
    });

  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const business = await prisma.business.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!business) {
        return new NextResponse("Business not found", { status: 404 });
    }

    const body = await req.json();
    const { phone, name, title, itemId, startTime, endTime, description } = body;

    if (!phone || !name || !startTime) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Upsert Lead
    const lead = await prisma.lead.upsert({
      where: {
        businessId_phone: {
          businessId: business.id,
          phone: phone,
        }
      },
      update: { name },
      create: {
        businessId: business.id,
        phone,
        name,
        status: "INTERESTED",
        source: "Dashboard"
      }
    });

    // 2. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        businessId: business.id,
        leadId: lead.id,
        title: title || "Manual Appointment",
        itemId: itemId || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description: description || null,
        source: "MANUAL",
        status: "SCHEDULED"
      },
      include: {
        lead: true,
        item: true
      }
    });

    return NextResponse.json(appointment);

  } catch (error) {
    console.error("[APPOINTMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
