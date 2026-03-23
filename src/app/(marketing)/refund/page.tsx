import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund Policy",
    description: "Our transparent refund policy for Turant Reply AI subscriptions.",
};

export default function RefundPage() {
    return (
        <main className="min-h-screen bg-[#04070a] py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/" className="text-sm text-[#25D366] hover:underline mb-4 inline-block font-medium">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black font-[Outfit] text-white mb-4">
                        Refund <span className="text-gradient">Policy</span>
                    </h1>
                    <p className="text-white/40 text-sm">Last updated: 2026</p>
                </div>

                {/* Content */}
                <div className="glass-card border border-white/5 p-8 md:p-12 space-y-10 text-white/70 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Subscription Policy</h2>
                        <p>
                            Turant Reply offers monthly and annual subscription plans. All subscriptions are set to auto-renew unless cancelled by the user before the next billing cycle.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Free Trial Terms</h2>
                        <p>
                            We may offer a Free Trial for a limited period. If you do not cancel during the Free Trial, you will be automatically charged the subscription fee for the plan you selected upon registration.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Refund Eligibility</h2>
                        <p className="mb-4">Refund requests are evaluated on a case-by-case basis:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Service Failure:</strong> If a technical error on our part prevents you from using the service for more than 48 hours.</li>
                            <li><strong>First-time Purchase:</strong> New users may request a refund within 24 hours of their first payment if they have not used the AI or Broadcast features extensively.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Non-Refundable Cases</h2>
                        <p className="mb-4">Refunds will **not** be provided in the following cases:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You changed your mind after utilizing platform features (e.g., sending broadcasts or AI messages).</li>
                            <li>Your WhatsApp account was banned by Meta due to policy violations (e.g., spamming).</li>
                            <li>Partial months of service.</li>
                            <li>Renewal charges where the user forgot to cancel before the billing date.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Cancellation Process</h2>
                        <p>
                            You can cancel your subscription at any time through your Dashboard Settings. After cancellation, you will continue to have access to the service until the end of your current billing period. No further charges will be made.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Billing Disputes</h2>
                        <p>
                            If you believe there has been an error in billing, please contact us immediately. We aim to resolve all billing disputes within 7 business days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Contact for Refund Requests</h2>
                        <p>
                            For any refund-related inquiries, please email <strong>rs163592@gmail.com</strong> with your account details and the reason for the request.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
