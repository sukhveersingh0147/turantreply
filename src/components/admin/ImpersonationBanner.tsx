import { auth } from "@/auth";
import { stopImpersonation } from "@/app/actions/impersonation";
import { ShieldAlert, LogOut } from "lucide-react";

export default async function ImpersonationBanner() {
    const session = await auth();

    if (!session?.user?.impersonating) {
        return null;
    }

    return (
        <div className="bg-orange-500 text-black px-4 py-2 flex items-center justify-between sticky top-0 z-[100] font-bold text-xs ring-1 ring-orange-400/20 shadow-xl">
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span>
                    Monitoring Mode: Currently impersonating
                    <span className="font-black px-1.5 py-0.5 bg-black/10 rounded ml-1">
                        {session?.user?.targetUserId || "Unknown"}
                    </span>
                </span>
            </div>
            <form action={stopImpersonation}>
                <button className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg hover:bg-black/80 transition-all font-black uppercase tracking-tighter text-[10px]">
                    <LogOut className="w-3 h-3" />
                    Stop Session
                </button>
            </form>
        </div>
    );
}
