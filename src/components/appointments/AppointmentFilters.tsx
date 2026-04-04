"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";

interface FilterProps {
  search: string;
  setSearch: (s: string) => void;
  activeFilter: string;
  setActiveFilter: (f: string) => void;
}

const filters = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AppointmentFilters({ 
  search, 
  setSearch, 
  activeFilter, 
  setActiveFilter 
}: FilterProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      {/* Search */}
      <div className="relative w-full md:max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#25D366] transition-colors" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or title..."
          className="w-full bg-[#111111] border border-[#27272a] rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#25D366] outline-none transition-all placeholder:text-zinc-700"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/5 rounded-full"
          >
            <X className="w-4 h-4 text-zinc-500 hover:text-white" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? "bg-[#25D366] text-black shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                : "bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
