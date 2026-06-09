import { Router, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest, authMiddleware } from "../middleware/auth";
import { startOfMonth, endOfDay, startOfDay } from "date-fns";

export const appointmentsRouter = Router();

// GET all appointments
appointmentsRouter.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const filter = req.query.filter || "all";
    const search = (req.query.search as string) || "";
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);

    const where: any = { businessId };

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
        select: {
          id: true,
          title: true,
          startTime: true,
          status: true,
          source: true,
          lead: { select: { name: true, phone: true, status: true, tags: true, leadStage: true } },
          item: { select: { name: true, category: true } }
        },
        orderBy: { startTime: "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.appointment.count({ where }),
      Promise.all([
        prisma.appointment.count({ where: { businessId, startTime: { gte: todayStart, lte: todayEnd } } }),
        prisma.appointment.count({ where: { businessId, status: "SCHEDULED", startTime: { gte: now } } }),
        prisma.appointment.count({ where: { businessId, status: "COMPLETED", startTime: { gte: monthStart } } }),
        prisma.appointment.count({ where: { businessId, status: "CANCELLED", startTime: { gte: monthStart } } }),
      ])
    ]);

    res.json({
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
    console.error("[BACKEND_APPOINTMENTS_GET]", error);
    res.status(500).json({ error: "Internal Error" });
  }
});

// POST new appointment
appointmentsRouter.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.businessId;
    if (!businessId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone, name, title, itemId, startTime, endTime, description } = req.body;

    if (!phone || !name || !startTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lead = await prisma.lead.upsert({
      where: { businessId_phone: { businessId, phone } },
      update: { name },
      create: {
        businessId,
        phone,
        name,
        status: "INTERESTED",
        source: "Dashboard"
      }
    });

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        leadId: lead.id,
        title: title || "Manual Appointment",
        itemId: itemId || null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        description: description || null,
        source: "MANUAL",
        status: "SCHEDULED"
      },
      include: { lead: true, item: true }
    });

    res.json(appointment);

  } catch (error) {
    console.error("[BACKEND_APPOINTMENTS_POST]", error);
    res.status(500).json({ error: "Internal Error" });
  }
});
