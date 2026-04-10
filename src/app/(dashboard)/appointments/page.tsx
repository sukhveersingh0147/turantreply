"use client";

import React, { useState } from "react";
import { Plus, Calendar, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";

// Components
import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import NewAppointmentModal from "@/components/appointments/NewAppointmentModal";
import EditAppointmentModal from "@/components/appointments/EditAppointmentModal";
import SendReminderModal from "@/components/appointments/SendReminderModal";
import AppointmentDetailDrawer from "@/components/appointments/AppointmentDetailDrawer";
import { PageSkeleton } from "@/components/ui/skeletons";

const fetcher = (url: string) => apiFetch(url).then(res => res.json());

export default function AppointmentsPage() {
  // Filtering & Pagination
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // SWR Fetching
  const { data, error, isLoading, mutate } = useSWR(
    `/appointments?page=${page}&filter=${activeFilter}&search=${search}`,
    fetcher,
    { keepPreviousData: true, refreshInterval: 60000 }
  );

  const appointments = data?.appointments || [];
  const stats = data?.stats || {
    todayCount: 0,
    pendingCount: 0,
    completedThisMonth: 0,
    cancelledThisMonth: 0
  };
  const hasMore = data?.appointments?.length === 20;

  // Business Items Fetch (Keep separate or move to context)
  const { data: businessData } = useSWR("/api/user/business", fetcher);
  const businessItems = businessData?.items || [];
  const businessName = businessData?.name || "Our Business";

  // CRUD Handlers
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await apiFetch(`/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Appointment marked as ${status.toLowerCase()}`);
        mutate();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleLoadMore = () => {
    if (hasMore) setPage(p => p + 1);
  };

  if (error) return <div className="p-8 text-red-500 font-bold">Failed to load appointments.</div>;

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-[Outfit] text-white tracking-tighter mb-2">
            Appointments
          </h1>
          <p className="text-zinc-400 font-medium">
             WhatsApp se aaye aur manually add kiye saare appointments
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#25D366] text-black font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-[0_10px_30px_rgba(37,211,102,0.25)]"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {/* Stats */}
      <AppointmentStats stats={stats} />

      {/* Filters */}
      <AppointmentFilters 
        search={search} 
        setSearch={setSearch} 
        activeFilter={activeFilter} 
        setActiveFilter={setActiveFilter} 
      />

      {/* Content */}
      {isLoading && !data ? (
        <PageSkeleton rows={8} />
      ) : appointments.length === 0 ? (
        <div className="py-24 px-8 rounded-3xl border border-white/5 bg-[#111111] flex flex-col items-center text-center">
           <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-700 mb-6">
              <Calendar className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-white mb-2">Koi appointment nahi mili</h3>
           <p className="text-zinc-500 max-w-sm mb-8">
              Jab customers WhatsApp pe appointment book karein, 
              yahan automatically dikhegi.
           </p>
           <button 
             onClick={() => setIsNewModalOpen(true)}
             className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
           >
              + Add Manually
           </button>
        </div>
      ) : (
        <div className="space-y-6">
           {/* Desktop Table */}
          <AppointmentTable 
             appointments={appointments}
             onEdit={(appt: any) => { setSelectedAppt(appt); setIsEditModalOpen(true); }}
             onStatusUpdate={handleStatusUpdate}
             onSendReminder={(appt: any) => { setSelectedAppt(appt); setIsReminderModalOpen(true); }}
          />

           {/* Mobile Cards */}
           <div className="md:hidden space-y-4">
              {appointments.map((appt: any) => (
                <AppointmentCard 
                  key={appt.id}
                  appt={appt}
                  onEdit={(a: any) => { setSelectedAppt(a); setIsEditModalOpen(true); }}
                  onSendReminder={(a: any) => { setSelectedAppt(a); setIsReminderModalOpen(true); }}
                  onViewDetail={(a: any) => { setSelectedAppt(a); setIsDetailDrawerOpen(true); }}
                />
              ))}
           </div>

           {/* Load More */}
           {hasMore && (
              <div className="flex justify-center pt-8">
                 <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                 >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                 </button>
              </div>
           )}
        </div>
      )}

      {/* Modals & Overlays */}
      <NewAppointmentModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => mutate()}
        items={businessItems}
      />

      <EditAppointmentModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedAppt(null); }}
        onSuccess={() => mutate()}
        appointment={selectedAppt}
        items={businessItems}
      />

      <SendReminderModal 
        isOpen={isReminderModalOpen}
        onClose={() => { setIsReminderModalOpen(false); setSelectedAppt(null); }}
        appointment={selectedAppt}
        businessName={businessName}
      />

      <AppointmentDetailDrawer 
        isOpen={isDetailDrawerOpen}
        onClose={() => { setIsDetailDrawerOpen(false); setSelectedAppt(null); }}
        appointment={selectedAppt}
        onEdit={(a: any) => { setIsDetailDrawerOpen(false); setSelectedAppt(a); setIsEditModalOpen(true); }}
        onSendReminder={(a: any) => { setIsDetailDrawerOpen(false); setSelectedAppt(a); setIsReminderModalOpen(true); }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
