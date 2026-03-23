import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Read the Privacy Policy for Turant Reply AI to understand how we protect your data.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#04070a] py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/" className="text-sm text-[#25D366] hover:underline mb-4 inline-block font-medium">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black font-[Outfit] text-white mb-4">
                        Privacy <span className="text-gradient">Policy</span>
                    </h1>
                    <p className="text-white/40 text-sm">Last updated: 2026</p>
                </div>

                {/* Content */}
                <div className="glass-card border border-white/5 p-8 md:p-12 space-y-10 text-white/70 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Introduction</h2>
                        <p>
                            Welcome to <strong>Turant Reply</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform and services. By using Turant Reply, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Information We Collect</h2>
                        <p className="mb-4">We collect several types of information to provide and improve our service to you:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Personal Information:</strong> Name, email address, and contact details.</li>
                            <li><strong>Business Information:</strong> Business name, industry, and description.</li>
                            <li><strong>WhatsApp Information:</strong> WhatsApp Business configuration and phone numbers.</li>
                            <li><strong>Customer Lead Data:</strong> Data about your customers that you import or capture through our automation tools.</li>
                            <li><strong>Usage Data:</strong> Information on how the Service is accessed and used.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">How We Use Information</h2>
                        <p className="mb-4">Turant Reply uses the collected data for various purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and maintain our Service.</li>
                            <li>To notify you about changes to our Service.</li>
                            <li>To provide customer support.</li>
                            <li>To monitor the usage of our Service.</li>
                            <li>To detect, prevent, and address technical issues.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">WhatsApp and Third Party Integrations</h2>
                        <p className="mb-4">Our platform processes messages through the <strong>Meta WhatsApp Cloud API</strong>.</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>We do not own the data transmitted through WhatsApp; we act as a processor.</li>
                            <li>Your use of WhatsApp is also subject to Meta’s own Privacy Policy and Terms.</li>
                            <li>We may use third-party service providers (like OpenAI for AI responses) to facilitate our Service. These parties have access to your data only to perform specific tasks on our behalf.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Data Storage and Security</h2>
                        <p>
                            The security of your data is important to us. We use industry-standard encryption and secure cloud providers (e.g., Supabase/AWS) to store your information. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">User Rights</h2>
                        <p className="mb-4">Depending on your location, you may have the following rights:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>The right to access, update, or delete the information we have on you.</li>
                            <li>The right of rectification.</li>
                            <li>The right to object.</li>
                            <li>The right of restriction.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Data Retention</h2>
                        <p>
                            We will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. Lead data and message history are retained according to your subscription settings or until account deletion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Changes to Policy</h2>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 font-[Outfit]">Contact Information</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at: <strong>rs163592@gmail.com</strong>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
