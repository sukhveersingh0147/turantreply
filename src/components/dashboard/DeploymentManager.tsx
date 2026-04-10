"use client";

import { useState, useEffect } from "react";
import {
    CloudIcon,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Terminal,
    ShieldCheck,
    Info,
    Rocket
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function DeploymentManager() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStatus = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get("/api/deployment/status");
            setStatus(res.data);
        } catch (error) {
            console.error("Failed to fetch deployment status:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const triggerDeploy = async () => {
        if (!confirm("Are you sure you want to trigger a manual deployment to cPanel?")) return;

        setLoading(true);
        try {
            const res = await axios.post("/api/deployment/trigger");
            if (res.data.success) {
                toast.success("Deployment triggered! It may take a few minutes to complete.");
                fetchStatus();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to trigger deployment");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const isPending = status?.status === "in_progress" || status?.status === "queued";
    const isSuccess = status?.conclusion === "success";
    const isError = status?.conclusion === "failure" || status?.conclusion === "cancelled";

    return (
        <div className="space-y-6">
            <div className="glass-card border border-white/5 p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPending ? "bg-yellow-500/20 text-yellow-500 animate-pulse" :
                            isSuccess ? "bg-[#25D366]/20 text-[#25D366]" :
                                isError ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/40"
                            }`}>
                            <CloudIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black font-[Outfit] text-white">Live <span className="text-gradient">Deployment</span></h2>
                            <p className="text-white/40 text-sm font-medium">Auto-sync your local changes to cPanel</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={fetchStatus}
                            disabled={refreshing}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
                        >
                            <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh Status
                        </button>
                        <button
                            onClick={triggerDeploy}
                            disabled={loading || isPending}
                            className="px-6 py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Rocket className="w-4 h-4" />
                            Deploy Now
                        </button>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Current Status</span>
                        <div className="flex items-center gap-2">
                            {isPending ? (
                                <>
                                    <RefreshCcw className="w-4 h-4 text-yellow-500 animate-spin" />
                                    <span className="text-sm font-bold text-yellow-500">Processing...</span>
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                                    <span className="text-sm font-bold text-[#25D366]">Live & Healthy</span>
                                </>
                            ) : isError ? (
                                <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm font-bold text-red-500">Last Build Failed</span>
                                </>
                            ) : (
                                <>
                                    <Clock className="w-4 h-4 text-white/20" />
                                    <span className="text-sm font-bold text-white/40">Status Unknown</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Last Updated</span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-white/20" />
                            <span className="text-sm font-bold text-white/80">
                                {status?.updatedAt ? new Date(status.updatedAt).toLocaleString() : "Sync required"}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Remote Repo</span>
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-white/20" />
                            <a
                                href={status?.htmlUrl || "https://github.com/rinoowner/turantreply"}
                                target="_blank"
                                className="text-sm font-bold text-white/80 hover:text-[#25D366] transition-all flex items-center gap-1.5"
                            >
                                View on GitHub <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {status?.status === "UNCONFIGURED" && (
                    <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                        <Info className="w-5 h-5 text-orange-400 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-orange-400">Environment Configuration Required</p>
                            <p className="text-[10px] text-orange-400/60 mt-1 leading-relaxed">
                                To track real-time deployment status, please add `GITHUB_TOKEN` to your backend `.env` file.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Guide Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white uppercase tracking-widest text-xs">Setup GitHub Secrets</h3>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mb-4">
                        To enable auto-deployment to cPanel, you must add the following secrets to your GitHub Repository (Settings &gt; Secrets and variables &gt; Actions):
                    </p>
                    <div className="space-y-2">
                        {[
                            { name: "FTP_SERVER", desc: "Your cPanel FTP hostname" },
                            { name: "FTP_USERNAME", desc: "Your cPanel FTP username" },
                            { name: "FTP_PASSWORD", desc: "Your cPanel FTP password" },
                        ].map(secret => (
                            <div key={secret.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <code className="text-[10px] font-mono text-[#25D366]">{secret.name}</code>
                                <span className="text-[9px] text-white/30">{secret.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card border border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#25D366]/20 rounded-lg">
                            <Rocket className="w-4 h-4 text-[#25D366]" />
                        </div>
                        <h3 className="font-bold text-white uppercase tracking-widest text-xs">How it works</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 flex-shrink-0">1</div>
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                <strong className="text-white">Edit:</strong> You make changes in the code (frontend or backend).
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 flex-shrink-0">2</div>
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                <strong className="text-white">Push:</strong> You push the changes to GitHub.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-white/40 flex-shrink-0">3</div>
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                <strong className="text-white">Automate:</strong> GitHub Actions builds your Next.js and Express app.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-[10px] font-black text-black flex-shrink-0">4</div>
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                <strong className="text-white text-[#25D366]">Deploy:</strong> The built files are securely transferred to your cPanel.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
