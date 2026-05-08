import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Sidebar from "@/app/dashboard/components/Sidebar";
import ReduxProvider from "@/app/providers/ReduxProvider";

export default async function DashboardLayout({ children } : any) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const userId = payload.userId;
        const userName = payload.userName;

        // حالا می‌تونی این اطلاعات رو به کامپوننت‌ها پاس بدی
        return (
            <ReduxProvider>
                <div className="flex h-screen bg-[#1e1e1e] text-gray-200">
                    {/* sidebar */}
                    <aside className="w-64 h-full border-r border-gray-700 bg-[#252526] shrink-0">
                        <Sidebar />
                    </aside>

                    {/* main content */}
                    <main className="flex-1  overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </ReduxProvider>
        );
    } catch (err) {
        redirect("/login");
    }
}
