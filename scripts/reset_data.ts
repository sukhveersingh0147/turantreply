import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function resetData() {
    console.log("Starting data reset...");
    
    // Admin email to keep
    const adminEmail = "rs163592@gmail.com";
    
    // Find non-admin users
    const nonAdmins = await prisma.user.findMany({
        where: {
            NOT: {
                email: adminEmail
            }
        },
        select: { id: true, email: true }
    });
    
    console.log(`Found ${nonAdmins.length} non-admin accounts to delete:`, nonAdmins.map(u => u.email).join(", "));
    
    // Delete non-admin users (cascading deletes will handle Business, Leads, etc.)
    const deletedCount = await prisma.user.deleteMany({
        where: {
            NOT: {
                email: adminEmail
            }
        }
    });
    
    console.log(`Successfully deleted ${deletedCount.count} users and their associated data.`);
    
    // Optional: Clear any global logs or other tables that might not be attached to users
    // (e.g., AdminLog if orphans are left, Inquiry if not linked to a user/business)
    // For now, the user and business deletion is the primary goal.
}

resetData()
    .catch((err) => {
        console.error("Error during reset:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
