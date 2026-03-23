"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { submitInquiry } from "@/app/actions/marketing";

export default function ContactForm() {
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        const result = await submitInquiry(formData);

        setIsPending(false);

        if (result.success) {
            toast.success("Message sent! We'll get back to you soon.");
            (event.target as HTMLFormElement).reset();
        } else if (result.error) {
            toast.error(result.error);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        className="input-dark w-full"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="john@company.com"
                        className="input-dark w-full"
                        required
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        placeholder="Your Business"
                        className="input-dark w-full"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Subject</label>
                    <input
                        type="text"
                        name="subject"
                        placeholder="How can we help?"
                        className="input-dark w-full"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Message</label>
                <textarea
                    name="message"
                    placeholder="Tell us how we can help..."
                    className="input-dark w-full h-32 resize-none"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isPending ? "Sending..." : "Send Message"}
            </button>
        </form>
    );
}
