"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { VERTICAL_TEMPLATES, VerticalType } from "@/lib/vertical-templates";
import { toast } from "sonner";

export function useVerticalSetup(initialType?: string) {
  const { data: session, update } = useSession();
  const [isSeeding, setIsSeeding] = useState(false);

  // Use session type first, then initialType, then fallback
  const businessType = (
    session?.user?.businessType?.toLowerCase() || 
    initialType?.toLowerCase() || 
    "other"
  ) as VerticalType;

  const isSeeded = session?.user?.dashboardSeeded || false;

  const verticalData = useMemo(() => {
    return VERTICAL_TEMPLATES[businessType] || VERTICAL_TEMPLATES.other;
  }, [businessType]);

  useEffect(() => {
    const triggerSeeding = async () => {
      // Only seed if NOT already seeded and we have a session user ID
      if (session?.user?.id && !isSeeded && !isSeeding) {
        setIsSeeding(true);
        try {
          console.log("[useVerticalSetup] Auto-seeding for:", businessType);
          
          const res = await fetch("/api/vertical-setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessType })
          });

          const data = await res.json();

          if (res.ok) {
            console.log("[useVerticalSetup] Seed SUCCESS");
            toast.success(`${verticalData.emoji} ${verticalData.label} dashboard ready!`);
            
            // Critical: Refresh session state
            await update({ dashboardSeeded: true });
          } else {
            console.error("[useVerticalSetup] Seed FAILED:", data.error);
          }
        } catch (error) {
          console.error("[useVerticalSetup] Connection error:", error);
        } finally {
          setIsSeeding(false);
        }
      }
    };

    triggerSeeding();
  }, [session?.user?.id, isSeeded, businessType, verticalData, update, isSeeding]);

  return {
    businessType,
    verticalData,
    verticalLabel: verticalData.label,
    verticalEmoji: verticalData.emoji,
    overviewKPIs: verticalData.overviewKPIs,
    isSeeding,
    isSeeded
  };
}
