import { getConversations } from "@/app/actions/conversations";
import ConversationsClient from "@/components/dashboard/ConversationsClient";

export default async function ConversationsPage() {
    const initialConversations = await getConversations();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-black font-[Outfit]">Conversations</h1>
                <p className="text-sm text-white/40">All WhatsApp conversations in one inbox</p>
            </div>

            <ConversationsClient initialConversations={initialConversations} />
        </div>
    );
}

