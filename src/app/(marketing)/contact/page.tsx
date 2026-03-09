import { Mail, Phone, MapPin, MessageSquare, ShieldCheck, Globe } from "lucide-react";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#04070a] py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black font-[Outfit] text-white mb-6">
                        Get in <span className="text-gradient">Touch</span>
                    </h1>
                    <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Have questions about ReplyFlow AI? Whether you need support, a product demo, or want to discuss enterprise solutions, our team is here to help.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info Sidebar */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Outfit] mb-6">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Support Email</p>
                                        <p className="text-white hover:text-[#25D366] transition-colors font-medium">support@replyflow.ai</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Business Inquiries</p>
                                        <p className="text-white hover:text-[#25D366] transition-colors font-medium">partners@replyflow.ai</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="text-white font-medium">+91 1800-000-000</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-[#25D366]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Company Address</p>
                                        <p className="text-white/70 leading-relaxed text-sm">
                                            ReplyFlow AI Tech Private Limited<br />
                                            Cyber Hub, Phase 2, DLF Cyber City,<br />
                                            Gurugram, Haryana, India 122002
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Section */}
                        <div className="glass-card border border-white/5 p-8 space-y-4">
                            <h3 className="text-lg font-bold text-white font-[Outfit] flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#25D366]" />
                                Existing Customer?
                            </h3>
                            <p className="text-sm text-white/40 leading-relaxed">
                                Our dedicated support team is ready to help you optimize your automation flows.
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="text-white/60 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    24/7 Support Portal
                                </li>
                                <li className="text-white/60 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    Comprehensive Help Center
                                </li>
                                <li className="text-white/60 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                    Priority Email Support
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="glass-card border border-white/10 p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                            <h2 className="text-2xl font-bold text-white font-[Outfit] mb-2">Send us a message</h2>
                            <p className="text-white/40 text-sm mb-8">We usually reply within 24–48 hours.</p>

                            <form className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="input-dark w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Email Address</label>
                                        <input type="email" placeholder="john@company.com" className="input-dark w-full" />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Company Name</label>
                                        <input type="text" placeholder="Your Business" className="input-dark w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Subject</label>
                                        <select className="input-dark w-full appearance-none">
                                            <option>General Inquiry</option>
                                            <option>Product Demo</option>
                                            <option>Agency Partnership</option>
                                            <option>Enterprise Solutions</option>
                                            <option>Technical Support</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-widest px-1">Message</label>
                                    <textarea placeholder="Tell us how we can help..." className="input-dark w-full h-32 resize-none" />
                                </div>

                                <button type="submit" className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold hover:opacity-90 transition-opacity">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Business Inquiries Grid */}
                        <div className="grid sm:grid-cols-3 gap-6 mt-12">
                            {[
                                { title: "Agency Partnerships", desc: "Built for agencies managing multiple brands." },
                                { title: "Product Demos", desc: "See ReplyFlow in action with a live demo." },
                                { title: "Enterprise Solutions", desc: "Custom features for large scale operations." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#25D366]/30 transition-all group">
                                    <h4 className="font-bold text-white text-sm mb-2 group-hover:text-[#25D366] transition-colors">{item.title}</h4>
                                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Closing */}
                <div className="mt-20 text-center py-12 border-t border-white/5">
                    <p className="text-lg text-white/60 font-[Outfit]">
                        We&apos;re here to help your business grow. If you have any questions, feel free to contact our team.
                    </p>
                </div>
            </div>
        </main>
    );
}
