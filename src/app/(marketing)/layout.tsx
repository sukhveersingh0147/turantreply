import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";
import { auth } from "@/auth";

export default async function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <>
            <Navbar user={session?.user} />
            {/* Spacer to push content below the fixed navbar (height: 80px = h-20) */}
            <div className="h-20" />
            {children}
            <Footer />
        </>
    );
}
