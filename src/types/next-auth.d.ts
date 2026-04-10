import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      businessType: string | null
      dashboardSeeded: boolean
      onboardingCompleted: boolean
      isSetupComplete: boolean
      impersonating?: boolean
      targetUserId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role?: string
    businessType?: string | null
    dashboardSeeded?: boolean
    onboardingCompleted?: boolean
    isSetupComplete?: boolean
    impersonating?: boolean
    targetUserId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    businessType: string | null
    dashboardSeeded: boolean
    onboardingCompleted: boolean
    isSetupComplete: boolean
    impersonating?: boolean
    targetUserId?: string
  }
}
