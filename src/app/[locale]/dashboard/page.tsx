
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter, Link, usePathname } from "@/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Award, Archive, Settings, FilePieChart, Globe2, FileText, LogOut } from "lucide-react";

type AdminNavItem = {
  href: string;
  icon: React.ReactNode;
  labelKey: string;
};

const adminNavItems: AdminNavItem[] = [
    { href: "/event-seal", icon: <Award className="h-5 w-5" />, labelKey: 'eventSeal' },
    { href: "/archived-events", icon: <Archive className="h-5 w-5" />, labelKey: 'archivedEvents' },
    { href: "/parameters", icon: <Settings className="h-5 w-5" />, labelKey: 'configurations' },
    { href: "/data-figures", icon: <FilePieChart className="h-5 w-5" />, labelKey: 'dataFigures' },
    { href: "/country-results", icon: <Globe2 className="h-5 w-5" />, labelKey: 'countryResults' },
    { href: "/scientific-review", icon: <FileText className="h-5 w-5" />, labelKey: 'scientificReview' },
];

const AdminDashboard = () => {
    const t = useTranslations("AppShell");
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-8 h-full">
            <aside className="hidden md:block border-r bg-muted/40">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <h3 className="px-2 py-3 text-lg font-bold font-headline">{t('dashboard')}</h3>
                            {adminNavItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        pathname === item.href && "text-primary bg-muted"
                                    )}
                                >
                                    {item.icon}
                                    {t(item.labelKey as any)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                       <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('logout')}
                       </Button>
                    </div>
                </div>
            </aside>
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
    
    return <AdminDashboard />;
}
