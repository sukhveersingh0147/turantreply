import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientsClient from "./ClientsClient";

export default async function AdminClientsPage() {
    const session = await auth();
    if (session?.user?.role !== "admin" && session?.user?.role !== "support_admin") {
        redirect("/overview");
    }

    const clients = await prisma.business.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    status: true,
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return <ClientsClient initialClients={clients} />;
}
