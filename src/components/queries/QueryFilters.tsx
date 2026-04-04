"use client";

import React from "react";
import { Search, ChevronDown, Filter } from "lucide-react";

interface QueryFiltersProps {
    filter: string;
    setFilter: (f: string) => void;
    search: string;
    setSearch: (s: string) => void;
    sort: string;
    setSort: (s: string) => void;
}

export function QueryFilters({
    filter,
    setFilter,
    search,
    setSearch,
    sort,
    setSort
}: QueryFiltersProps) {
    const filters = [
        { id: "all", label: "All" },
        { id: "pending", label: "Pending" },
        { id: "paused", label: "AI Paused" },
        { id: "resolved", label: "Resolved" }
    ];

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            filter === f.id
                                ? "bg-[#25D366] text-black border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                                : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Search & Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#25D366] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#25D366]/50 focus:bg-[#25D366]/5 transition-all"
                    />
                </div>

                <div className="relative group">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white/60 outline-none hover:bg-white/10 focus:border-[#25D366]/50 transition-all cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="score">Highest Score</option>
                        <option value="paused_first">AI Paused First</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
    );
}
