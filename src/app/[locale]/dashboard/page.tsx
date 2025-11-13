
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "@/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/app-shell";
import { useTranslations } from "next-intl";

const AdminDashboard = () => {
    const t = useTranslations("AppShell");

    return (
         <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <p className="text-muted-foreground">Admin management area</p>
            </div>
             <main>
                <div className="bg-muted/30 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">Select an option from the menu to manage the application.</p>
                </div>
            </main>
        </div>
    )
}


export default function DashboardPage() {
    const { isAdmin, promptLogin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin) {
            promptLogin();
            // Redirect to home if not an admin
            router.push('/');
        }
    }, [isAdmin, router, promptLogin]);
    
    if (!isAdmin) {
        // Render nothing or a loading spinner while redirecting
        return null;
    }
    
    return (
        <AppShell>
           <AdminDashboard />
        </AppShell>
    );
}
