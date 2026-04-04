"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Components
import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import NewAppointmentModal from "@/components/appointments/NewAppointmentModal";
import EditAppointmentModal from "@/components/appointments/EditAppointmentModal";
import SendReminderModal from "@/components/appointments/SendReminderModal";
import AppointmentDetailDrawer from "@/components/appointments/AppointmentDetailDrawer";

export default function AppointmentsPage() {
  // State
  const [loading, setLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingCount: 0,
    completedThisMonth: 0,
    cancelledThisMonth: 0
  });
  const [businessItems, setBusinessItems] = useState<any[]>([]);
  const [businessName, setBusinessName] = useState("Our Business");
  
  // Filtering & Pagination
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // Fetch Logic
  const fetchData = useCallback(async (reset = false) => {
    if (reset) {
       setLoading(true);
       setPage(1);
    } else {
       setLoadMoreLoading(true);
    }

    try {
      const currentPage = reset ? 1 : page;
      const res = await fetch(`/api/appointments?page=${currentPage}&filter=${activeFilter}&search=${search}`);
      const data = await res.json();

      if (reset) {
        setAppointments(data.appointments);
        setStats(data.stats);
      } else {
        setAppointments(prev => [...prev, ...data.appointments]);
      }
      
      setHasMore(data.appointments.length === 20);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
      setLoadMoreLoading(false);
    }
  }, [activeFilter, search, page]);

  // Initial Load
  useEffect(() => {
    fetchData(true);
  }, [activeFilter, search]);

  // Load More Handler
  const handleLoadMore = () => {
    if (hasMore && !loadMoreLoading) {
      setPage(prev => prev + 1);
    }
  };

  // Trigger fetchData when page changes (but not on reset)
  useEffect(() => {
    if (page > 1) {
      fetchData(false);
    }
  }, [page]);

  // Fetch items for dropdowns
  useEffect(() => {
    const fetchBusinessInfo = async () => {
       const res = await fetch("/api/user/business");
       if (res.ok) {
          const data = await res.json();
          setBusinessItems(data.items || []);
          setBusinessName(data.name || "Our Business");
       }
    };
    fetchBusinessInfo();
  }, []);

  // CRUD Handlers
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Appointment marked as ${status.toLowerCase()}`);
        fetchData(true);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black font-[Outfit] text-white tracking-tighter mb-2">
            Appointments
          </h1>
          <p className="text-zinc-500 font-medium">
             WhatsApp se aaye aur manually add kiye saare appointments
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#25D366] text-black font-black uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-[0_10px_30px_rgba(37,211,102,0.25)]"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </motion.button>
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <Loader2 className="w-10 h-10 text-[#25D366] animate-spin" />
           <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Loading appointments...</p>
        </div>
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
             onEdit={(appt) => { setSelectedAppt(appt); setIsEditModalOpen(true); }}
             onStatusUpdate={handleStatusUpdate}
             onSendReminder={(appt) => { setSelectedAppt(appt); setIsReminderModalOpen(true); }}
           />

           {/* Mobile Cards */}
           <div className="md:hidden space-y-4">
              {appointments.map((appt) => (
                <AppointmentCard 
                  key={appt.id}
                  appt={appt}
                  onEdit={(a) => { setSelectedAppt(a); setIsEditModalOpen(true); }}
                  onSendReminder={(a) => { setSelectedAppt(a); setIsReminderModalOpen(true); }}
                  onViewDetail={(a) => { setSelectedAppt(a); setIsDetailDrawerOpen(true); }}
                />
              ))}
           </div>

           {/* Load More */}
           {hasMore && (
              <div className="flex justify-center pt-8">
                 <button
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                 >
                    {loadMoreLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More"}
                    {!loadMoreLoading && <ArrowRight className="w-4 h-4" />}
                 </button>
              </div>
           )}
        </div>
      )}

      {/* Modals & Overlays */}
      <NewAppointmentModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => fetchData(true)}
        items={businessItems}
      />

      <EditAppointmentModal 
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedAppt(null); }}
        onSuccess={() => fetchData(true)}
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
        onEdit={(a) => { setIsDetailDrawerOpen(false); setSelectedAppt(a); setIsEditModalOpen(true); }}
        onSendReminder={(a) => { setIsDetailDrawerOpen(false); setSelectedAppt(a); setIsReminderModalOpen(true); }}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
