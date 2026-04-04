import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function resetAdmin() {
    console.log("Starting administrator profile reset...");
    
    // Admin email
    const adminEmail = "rs163592@gmail.com";
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
        where: { email: adminEmail }
    });
    
    if (!adminUser) {
        console.error("Admin user not found!");
        return;
    }
    
    console.log(`Resetting admin account: ${adminEmail}`);

    // Force deletion of their Business record (Cascading will handle related records)
    const deletedBusiness = await prisma.business.deleteMany({
        where: { userId: adminUser.id }
    });

    console.log(`Successfully deleted ${deletedBusiness.count} business profiles for the admin.`);

    // Reset user completion status
    const updatedUser = await prisma.user.update({
        where: { id: adminUser.id },
        data: { 
            isSetupComplete: false,
            // Ensure they are flagged correctly for setup redirection
            dashboardSeeded: false 
        } as any
    });

    console.log(`Successfully reset isSetupComplete to FALSE for ${adminEmail}.`);
}

resetAdmin()
    .catch((err) => {
        console.error("Error during admin reset:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
