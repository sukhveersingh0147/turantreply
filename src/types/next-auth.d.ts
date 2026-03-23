import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            status: string;
            isSetupComplete: boolean;
            impersonating?: boolean;
            originalAdminId?: string;
            targetUserId?: string;
        } & DefaultSession["user"]
    }

    interface User {
        role: string;
        status: string;
        isSetupComplete: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        status: string;
        isSetupComplete: boolean;
    }
}
