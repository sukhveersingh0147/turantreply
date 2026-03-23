import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "The Terms of Service for using Turant Reply AI services.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#04070a] py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/" className="text-sm text-[#25D366] hover:underline mb-4 inline-block font-medium">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black font-[Outfit] text-white mb-4">
                        Terms of <span className="text-gradient">Service</span>
                    </h1>
                    <p className="text-white/40 text-sm">Last updated: 2026</p>
                </div>

                {/* Content */}
                <div className="glass-card border border-white/5 p-8 md:p-12 space-y-10 text-white/70 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Introduction</h2>
                        <p>
                            These Terms of Service (&quot;Terms&quot;) govern your use of <strong>Turant Reply</strong>. These Terms constitute a legally binding agreement between you (&quot;User&quot;) and Turant Reply.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Acceptance of Terms</h2>
                        <p>
                            By creating an account or using the platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to any part of these terms, you may not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">User Responsibilities</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must provide accurate and complete information during registration.</li>
                            <li>You are responsible for maintaining the confidentiality of your account password.</li>
                            <li>You are responsible for all activities that occur under your account.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Acceptable Use Policy</h2>
                        <p className="mb-4">You agree not to use the Service:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts.</li>
                            <li>To send spam or unsolicited messages in violation of WhatsApp’s policies.</li>
                            <li>To infringe upon our intellectual property rights or the rights of others.</li>
                            <li>To upload or transmit viruses or any other type of malicious code.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Account Registration</h2>
                        <p>
                            The Service is intended for business use. By registering, you represent that you have the authority to bind your business to these terms. We reserve the right to refuse service or terminate accounts at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Subscription and Payments</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Certain parts of the Service are billed on a subscription basis (&quot;Subscription(s)&quot;).</li>
                            <li>You will be billed in advance on a recurring and periodic basis (monthly or annually).</li>
                            <li>All payments are processed through secure third-party payment gateways.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">WhatsApp Business Platform (Meta) Charges</h2>
                        <p className="mb-4">
                            In addition to our Subscription fees, the WhatsApp Business Platform (Meta) may charge fees based on your usage (e.g., conversation-based pricing).
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Direct Relationship:</strong> You are responsible for maintaining a valid payment method within your Meta Business Manager.</li>
                            <li><strong>Responsibility for Fees:</strong> All Meta-related charges are billed directly by Meta and are your sole responsibility. Turant Reply is not responsible for any Meta usage fees, currency conversion fees, or taxes applicable to your Meta account.</li>
                            <li><strong>Service Availability:</strong> Your access to our Service may be interrupted if your Meta account is suspended due to non-payment of Meta fees.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Termination of Accounts</h2>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Limitation of Liability</h2>
                        <p>
                            In no event shall Turant Reply, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your use of the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are and will remain the exclusive property of Turant Reply and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Changes to Terms</h2>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Governing Law</h2>
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of the jurisdiction where the company is registered, without regard to its conflict of law provisions.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
