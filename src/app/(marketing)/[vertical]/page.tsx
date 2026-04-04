import LandingPage from "@/components/marketing/LandingPage";
import { notFound } from "next/navigation";

const VALID_VERTICALS = ["salon", "gym", "coaching", "realestate", "restaurant", "other"];

export default function VerticalLandingPage({ params }: { params: { vertical: string } }) {
    const { vertical } = params;

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
