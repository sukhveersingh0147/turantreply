import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export interface AuthRequest extends Request {
    userId?: string;
    businessId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sessionToken = req.cookies["next-auth.session-token"] || req.cookies["__Secure-next-auth.session-token"];

        if (!sessionToken) {
            return res.status(401).json({ error: "Unauthorized: No session token found" });
        }

        const session = await prisma.session.findUnique({
            where: { sessionToken },
            include: { user: { include: { business: true } } }
        });

        if (!session || session.expires < new Date()) {
            return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
        }

        req.userId = session.userId;
        req.businessId = session.user.business?.id;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
