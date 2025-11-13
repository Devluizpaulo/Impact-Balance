
"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "@/navigation";
import { useEffect } from "react";
import AppShell from "@/components/layout/app-shell";

const AdminDashboardContent = () => {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-2xl font-bold tracking-tight">
                    Bem-vindo ao Dashboard
                </h3>
                <p className="text-sm text-muted-foreground">
                    Selecione uma opção no menu para gerenciar a aplicação.
                </p>
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
            router.push('/');
        }
    }, [isAdmin, router, promptLogin]);
    
    if (!isAdmin) {
        return null; // Or a loading spinner
    }
    
    return (
        <AppShell>
            <AdminDashboardContent />
        </AppShell>
    );
}
