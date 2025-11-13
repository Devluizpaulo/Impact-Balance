
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "@/navigation";
import { useEffect } from "react";
import { Award, Archive, Settings, LogOut } from "lucide-react";
import AppShell from "@/components/layout/app-shell";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
    const t = useTranslations("AppShell");
    const { logout } = useAuth();
    return (
         <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                <p className="text-muted-foreground">Admin management area</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                <aside className="space-y-2">
                    <h2 className="text-lg font-semibold px-3">Menu</h2>
                    <nav className="flex flex-col">
                        <Link href="/event-seal" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Award className="h-5 w-5" />
                            {t('eventSeal')}
                        </Link>
                        <Link href="/archived-events" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Archive className="h-5 w-5" />
                            {t('archivedEvents')}
                        </Link>
                        <Link href="/parameters" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Settings className="h-5 w-5" />
                            {t('configurations')}
                        </Link>
                         <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-4" onClick={logout}>
                            <LogOut className="h-5 w-5 mr-3" />
                            {t('logout')}
                        </Button>
                    </nav>
                </aside>
                <main>
                    <div className="bg-muted/30 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Select an option from the menu to manage the application.</p>
                    </div>
                </main>
            </div>
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

