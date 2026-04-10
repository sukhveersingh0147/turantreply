import LandingPage from "@/components/marketing/LandingPage";
import { notFound } from "next/navigation";

const VALID_VERTICALS = ["salon", "gym", "coaching", "realestate", "restaurant", "other"];

export default async function VerticalLandingPage({ params }: { params: Promise<{ vertical: string }> }) {
    const { vertical } = await params;

    if (!VALID_VERTICALS.includes(vertical.toLowerCase())) {
        notFound();
    }

    return <LandingPage vertical={vertical} />;
}

export function generateStaticParams() {
    return VALID_VERTICALS.map((vertical) => ({
        vertical,
    }));
}
