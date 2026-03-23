import { getOrdersData } from "@/app/actions/orders";
import OrdersClient from "@/components/dashboard/OrdersClient";

export default async function OrdersPage() {
    const initialData = await getOrdersData();
    return <OrdersClient initialData={initialData} />;
}
