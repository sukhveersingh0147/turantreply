import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, description, startTime, endTime, status, itemId } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        status,
        itemId
      },
      include: {
        lead: true,
        item: true
      }
    });

    return NextResponse.json(appointment);

  } catch (error) {
    console.error("[APPOINTMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    // Soft delete: set status to CANCELLED
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json(appointment);

  } catch (error) {
    console.error("[APPOINTMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
