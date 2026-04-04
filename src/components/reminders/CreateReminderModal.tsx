"use client";

import React, { useState } from "react";
import { X, Calendar as CalendarIcon, Clock, Bot, Send, Plus, Info } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

interface CreateReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOneTimeCreate: (data: any) => void;
    onRuleCreate: (data: any) => void;
}

export function CreateReminderModal({
    isOpen,
    onClose,
    onOneTimeCreate,
    onRuleCreate
}: CreateReminderModalProps) {
    const [activeTab, setActiveTab] = useState<"one-time" | "recurring">("one-time");
    
    // One-time state
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [reminderType, setReminderType] = useState("APPOINTMENT");
    const [oneTimeMessage, setOneTimeMessage] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState("10:00 AM");

    // Recurring state
    const [ruleName, setRuleName] = useState("");
    const [triggerStage, setTriggerStage] = useState("appointment_tomorrow");
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [ruleMessage, setRuleMessage] = useState("");

    if (!isOpen) return null;

    const handleOneTimeSubmit = () => {
        onOneTimeCreate({
            phone: customerPhone,
            name: customerName,
            type: reminderType,
            message: oneTimeMessage,
            scheduledAt: selectedDate ? new Date(selectedDate.setHours(parseInt(selectedTime), 0)) : new Date()
        });
        onClose();
    };

    const handleRuleSubmit = () => {
        onRuleCreate({
            name: ruleName,
            triggerStage,
            delayMinutes,
            message: ruleMessage,
            isActive: true
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 my-8">
                {/* Header & Tabs */}
                <div className="bg-white/[0.02] border-b border-white/5">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                             <div className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20">
                                <Plus className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-white">Create New Reminder</h3>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex px-6 pb-[2px] gap-8">
                        <button 
                            onClick={() => setActiveTab("one-time")}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                                activeTab === "one-time" ? "text-[#25D366]" : "text-white/20 hover:text-white/40"
                            }`}
                        >
                            One-time Reminder
                            {activeTab === "one-time" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#25D366]" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab("recurring")}
                            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${
                                activeTab === "recurring" ? "text-[#25D366]" : "text-white/20 hover:text-white/40"
                            }`}
                        >
                            Automation Rule
                            {activeTab === "recurring" && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#25D366]" />}
                        </button>
                    </div>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {activeTab === "one-time" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-300">
                            {/* Form side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Customer Phone*</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 919876543210"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#25D366]/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Customer Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Optional"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#25D366]/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Reminder Type</label>
                                    <select 
                                        value={reminderType}
                                        onChange={(e) => setReminderType(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 outline-none focus:border-[#25D366]/50 cursor-pointer"
                                    >
                                        <option value="APPOINTMENT">📅 Appointment</option>
                                        <option value="FOLLOWUP">🔄 Follow-up</option>
                                        <option value="PAYMENT">💰 Payment</option>
                                        <option value="CUSTOM">📢 Custom</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Message</label>
                                    <textarea 
                                        value={oneTimeMessage}
                                        onChange={(e) => setOneTimeMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Type message here..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#25D366]/50 transition-all resize-none font-medium"
                                    />
                                </div>
                            </div>

                            {/* Calendar side */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Schedule Date</label>
                                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex justify-center scale-90 origin-top">
                                        <DayPicker 
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            classNames={{
                                                day_selected: "bg-[#25D366] text-black rounded-lg font-bold",
                                                day_today: "text-[#25D366] font-black",
                                                day: "text-white/60 hover:bg-white/10 rounded-lg p-2 transition-all cursor-pointer text-sm",
                                                caption: "text-white font-black text-xs uppercase tracking-widest mb-4 flex justify-between",
                                                head_cell: "text-white/20 font-black text-[10px] p-2",
                                                table: "w-full"
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Time Slot</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM"].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => setSelectedTime(t)}
                                                className={`py-2 rounded-lg text-[10px] font-black transition-all border ${
                                                    selectedTime === t ? "bg-[#25D366] text-black border-[#25D366]" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rule Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 24hr Appointment Reminder"
                                        value={ruleName}
                                        onChange={(e) => setRuleName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#25D366]/50 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Trigger Stage</label>
                                    <select 
                                        value={triggerStage}
                                        onChange={(e) => setTriggerStage(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 outline-none focus:border-[#25D366]/50 cursor-pointer"
                                    >
                                        <option value="appointment_tomorrow">Appointment Tomorrow</option>
                                        <option value="appointment_1hr">1 Hour Before</option>
                                        <option value="membership_expiring">Membership Expiring</option>
                                        <option value="no_visit_30days">No Visit (30 days)</option>
                                        <option value="fee_due">Fee Due</option>
                                    </select>
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Delay (Minutes)</label>
                                <input 
                                    type="number" 
                                    value={delayMinutes}
                                    onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#25D366]/50 transition-all font-medium"
                                />
                                <p className="text-[10px] text-white/20 font-medium px-1">Tip: Use 0 for instant, 1440 for 24 hours.</p>
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rule Message Template</label>
                                <textarea 
                                    value={ruleMessage}
                                    onChange={(e) => setRuleMessage(e.target.value)}
                                    rows={5}
                                    placeholder="Enter template with [Name], [Date], [Time]..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#25D366]/50 transition-all resize-none font-medium"
                                />
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {["[Name]", "[Date]", "[Time]", "[Service]"].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => setRuleMessage(prev => prev + v)}
                                            className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-black text-[#25D366] hover:bg-[#25D366]/10 transition-all"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-[11px] text-white/40 leading-relaxed">
                                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <p>Automation rules will generate reminders in your queue automatically based on real-time data changes.</p>
                             </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 pt-0 bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={activeTab === "one-time" ? handleOneTimeSubmit : handleRuleSubmit}
                            disabled={activeTab === "one-time" ? !customerPhone : !ruleName}
                            className="flex-[2] px-6 py-4 rounded-xl bg-[#25D366] text-black text-sm font-black disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95 shadow-[0_8px_20px_rgba(37,211,102,0.2)]"
                        >
                            {activeTab === "one-time" ? "Schedule Reminder" : "Create Rule"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
