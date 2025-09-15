"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Calculator, Settings } from "lucide-react"
import { usePathname } from "@/navigation"
import Header from "./header"
import { useTranslations } from "next-intl"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useTranslations("AppShell")

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/"
                isActive={pathname === "/"}
                tooltip={t('calculator')}
              >
                <Calculator />
                <span>{t('calculator')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/parameters"
                isActive={pathname === "/parameters"}
                tooltip={t('parameters')}
              >
                <Settings />
                <span>{t('parameters')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {/* Can add footer items here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
