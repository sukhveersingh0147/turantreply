import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function finalWipe() {
    console.log("🚀 Starting final comprehensive data wipe...");
    
    // Admin email to keep
    const adminEmail = "rs163592@gmail.com";
    
    // 1. Delete all users except the admin
    const deletedUsers = await prisma.user.deleteMany({
        where: {
            NOT: {
                email: adminEmail
            }
        }
    });
    console.log(`✅ Deleted ${deletedUsers.count} non-admin accounts.`);
    
    // 2. Identify the admin user
    const adminUser = await prisma.user.findFirst({
        where: { email: adminEmail }
    });
    
    if (adminUser) {
        // 3. Delete the admin's business profile (resetting their dashboard)
        const deletedBusiness = await prisma.business.deleteMany({
            where: { userId: adminUser.id }
        });
        console.log(`✅ Deleted ${deletedBusiness.count} business profiles for the admin.`);
        
        // 4. Reset admin status
        await prisma.user.update({
            where: { id: adminUser.id },
            data: { 
                isSetupComplete: false,
                role: "admin" // Ensure they have the admin role
            }
        });
        console.log(`✅ Reset admin status (isSetupComplete: false) for ${adminEmail}.`);
    } else {
        console.error("❌ Admin user not found in the database. Please ensure rs163592@gmail.com exists.");
    }
    
    console.log("✨ Final wipe completed successfully.");
}

finalWipe()
    .catch((err) => {
        console.error("❌ Error during final wipe:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
